/*
 * Home page: floating project cards.
 *
 *  - Cards are created from HG.homeCards() (the projects, plus the posters of
 *    events that have a page) and arranged around the centered
 *    intro text (they never cover it), then drift with light physics.
 *  - Hover / focus: the card scales up, shows its caption and every other card
 *    fades out; the navigation fades out too (via HG.motion.projectActive).
 *  - Drag anywhere: draws a ribbon of silver chrome and nudges the cards with
 *    parallax. A normal click on a card still opens it. Until someone has
 *    drawn, a flourish draws itself every few seconds to show what to do.
 *  - PAUSE / RESUME (HG.motion.paused), reduced-motion and hidden tabs stop
 *    the animation loop.
 */
(function () {
    'use strict'

    var HG = window.HG
    var host = document.getElementById('main')
    if (!host || document.body.getAttribute('data-page') !== 'home') return

    var intro = host.querySelector('.stage-intro')
    if (!intro) return

    var PHYSICS = {
        frictionPerSec: 0.18,
        pointerRepel: 0.065,
        maxSpeed: 32,
        driftStrength: 7,
        separation: 0.26,
        hoverScale: 1.8,
        rotationSpring: 7,
        rotationDamping: 0.82,
    }

    // Drag-to-draw interaction. Tweak these for more / less movement, or to
    // change how the drawn line looks.
    var DRAG = {
        // The line is a ribbon: thick where you move slowly, thin where you move
        // fast, pointed at both ends.
        lineWidth: 12, // widest part, px
        minWidth: 2.6, // thinnest part, px
        fastSpeed: 1.5, // px per ms that counts as "fast"
        taperTail: 48, // length of the pointed start, px
        taperHead: 30, // length of the pointed end (at the pointer), px
        // Silver chrome: dark steel edge, a metal body with bands of light and
        // dark, a white highlight on one side and a shaded side.
        edge: '#3f4147',
        shade: '#6e7179',
        chrome: [
            ['0', '#f6f7f9'],
            ['0.25', '#bfc2c8'],
            ['0.5', '#ffffff'],
            ['0.75', '#989ba3'],
            ['1', '#e3e5e9'],
        ],
        // Keeps normal clicks from being mistaken for a drag.
        threshold: 10,
        sampleDistance: 12,
        movementMin: 0.48,
        movementMax: 1.15,
        maxPointerStep: 72,
        fadeMs: 1000,
    }

    // The flourish that draws itself until someone has drawn (see playGhost).
    var GHOST = { firstDelay: 4400, every: 9000, drawMs: 2300, holdMs: 500, fadeMs: 900, maxPlays: 4 }

    // -------------------------------------------------------------- helpers
    function hashString(input) {
        var h = 2166136261
        for (var i = 0; i < input.length; i++) {
            h ^= input.charCodeAt(i)
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
        }
        return h >>> 0
    }

    function makeRandom(seed) {
        var t = seed || 1
        return function () {
            t += 0x6d2b79f5
            var x = Math.imul(t ^ (t >>> 15), 1 | t)
            x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
            return ((x ^ (x >>> 14)) >>> 0) / 4294967296
        }
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value))
    }

    // Half-extents of a rotated, scaled box.
    function getBounds(width, height, rotationDeg, scale) {
        var r = (rotationDeg * Math.PI) / 180
        var w = width * scale
        var h = height * scale
        var c = Math.abs(Math.cos(r))
        var s = Math.abs(Math.sin(r))
        return { halfW: (w * c + h * s) / 2, halfH: (w * s + h * c) / 2 }
    }

    function halton(index, base) {
        var f = 1
        var r = 0
        var i = index
        while (i > 0) {
            f /= base
            r += f * (i % base)
            i = Math.floor(i / base)
        }
        return r
    }

    function overlapArea(a, b) {
        var x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
        var y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
        return x * y
    }

    function rectFromCenter(x, y, halfW, halfH) {
        return { left: x - halfW, top: y - halfH, right: x + halfW, bottom: y + halfH }
    }

    function rectArea(r) {
        return Math.max(1, (r.right - r.left) * (r.bottom - r.top))
    }

    function cardRect(card, rotation, scale) {
        var b = getBounds(card.width, card.height, rotation, scale)
        return rectFromCenter(card.x, card.y, b.halfW, b.halfH)
    }

    // ---------------------------------------------------------------- state
    var cards = []
    var pointer = { x: 0, y: 0, active: false, down: false }
    var drag = {
        active: false,
        dragging: false,
        pointerId: null,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        points: [],
        suppressClickUntil: 0,
        fadeTimer: null,
    }
    var rafId = null
    var lastTick = 0
    var docVisible = !document.hidden
    var layoutW = 0
    var layoutH = 0
    var relayoutRaf = null
    var flushRaf = null
    var pendingRelayout = false
    var pendingRepair = false
    var paused = false
    var ready = false
    // True while a card is still easing (scale / tilt). Keeps the loop running
    // after PAUSE so a hovered card still grows to full size.
    var settling = false

    var reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
    var touchLike =
        window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches

    // ------------------------------------------------------------ drag trail
    // What you draw is a ribbon of polished silver chrome, like the swirls on the
    // poster: a dark edge, a metal body, a white highlight on one side and a
    // shaded side. All plain SVG inside one overlay; only its attributes change
    // while you drag.
    var SVG_NS = 'http://www.w3.org/2000/svg'

    function svgEl(tag, attrs) {
        var el = document.createElementNS(SVG_NS, tag)
        Object.keys(attrs || {}).forEach(function (name) {
            el.setAttribute(name, attrs[name])
        })
        return el
    }

    var dragSvg = svgEl('svg', { 'aria-hidden': 'true' })
    dragSvg.setAttribute('class', 'drag-trail')
    dragSvg.style.transition = 'opacity ' + DRAG.fadeMs + 'ms ease'

    var chromeGradient = svgEl('linearGradient', {
        id: 'hg-chrome',
        gradientUnits: 'userSpaceOnUse',
        x1: '0',
        y1: '0',
        x2: '380',
        y2: '380',
        spreadMethod: 'reflect',
    })
    DRAG.chrome.forEach(function (stop) {
        chromeGradient.appendChild(svgEl('stop', { offset: stop[0], 'stop-color': stop[1] }))
    })
    var defs = svgEl('defs')
    defs.append(chromeGradient)

    var ribbonBody = svgEl('polygon', {
        fill: 'url(#hg-chrome)',
        stroke: DRAG.edge,
        'stroke-width': '1.1',
        'stroke-linejoin': 'round',
    })
    var ribbonShade = svgEl('polygon', { fill: DRAG.shade, opacity: '0.5' })
    var ribbonShine = svgEl('polygon', { fill: '#ffffff', opacity: '0.92' })
    dragSvg.append(defs, ribbonBody, ribbonShade, ribbonShine)

    function smoothstep(t) {
        t = clamp(t, 0, 1)
        return t * t * (3 - 2 * t)
    }

    // Offset outline of the centre line: `factor` scales the width, `shift`
    // moves the centre towards the light (up-left) when positive.
    function ribbonOutline(path, factor, shift) {
        var left = []
        var right = []
        for (var i = 0; i < path.length; i++) {
            var a = path[Math.max(0, i - 1)]
            var b = path[Math.min(path.length - 1, i + 1)]
            var tx = b.x - a.x
            var ty = b.y - a.y
            var len = Math.hypot(tx, ty) || 1
            var nx = -ty / len
            var ny = tx / len
            var half = (path[i].w * factor) / 2
            var cx = path[i].x - shift * path[i].w * 0.7
            var cy = path[i].y - shift * path[i].w * 0.7
            left.push((cx + nx * half).toFixed(1) + ',' + (cy + ny * half).toFixed(1))
            right.push((cx - nx * half).toFixed(1) + ',' + (cy - ny * half).toFixed(1))
        }
        return left.concat(right.reverse()).join(' ')
    }

    // points: [{ x, y, t }] with t in ms. Draws the ribbon through them.
    function renderRibbon(points) {
        if (points.length < 2) return clearRibbon()

        // Width at each point from how fast the pointer was moving there.
        var widths = points.map(function (p, i) {
            if (i === 0) return DRAG.lineWidth * 0.6
            var q = points[i - 1]
            var speed = Math.hypot(p.x - q.x, p.y - q.y) / Math.max(1, p.t - q.t)
            return DRAG.minWidth + (DRAG.lineWidth - DRAG.minWidth) * (1 - clamp(speed / DRAG.fastSpeed, 0, 1))
        })
        widths = widths.map(function (w, i) {
            var before = i > 0 ? widths[i - 1] : w
            var after = i < widths.length - 1 ? widths[i + 1] : w
            return before * 0.25 + w * 0.5 + after * 0.25
        })

        // Smooth centre line (Catmull-Rom spline through the points).
        var STEPS = 6
        var path = []
        for (var i = 0; i < points.length - 1; i++) {
            var p0 = points[Math.max(0, i - 1)]
            var p1 = points[i]
            var p2 = points[i + 1]
            var p3 = points[Math.min(points.length - 1, i + 2)]
            for (var k = 0; k < STEPS; k++) {
                var t = k / STEPS
                var t2 = t * t
                var t3 = t2 * t
                path.push({
                    x: 0.5 * (2 * p1.x + (p2.x - p0.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (3 * p1.x - p0.x - 3 * p2.x + p3.x) * t3),
                    y: 0.5 * (2 * p1.y + (p2.y - p0.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (3 * p1.y - p0.y - 3 * p2.y + p3.y) * t3),
                    w: widths[i] + (widths[i + 1] - widths[i]) * t,
                })
            }
        }
        var tail = points[points.length - 1]
        path.push({ x: tail.x, y: tail.y, w: widths[widths.length - 1] })

        // Point both ends.
        var total = 0
        path[0].s = 0
        for (var j = 1; j < path.length; j++) {
            total += Math.hypot(path[j].x - path[j - 1].x, path[j].y - path[j - 1].y)
            path[j].s = total
        }
        var tailLen = Math.max(1, Math.min(DRAG.taperTail, total * 0.5))
        var headLen = Math.max(1, Math.min(DRAG.taperHead, total * 0.5))
        path.forEach(function (p) {
            p.w = Math.max(0.6, p.w * smoothstep(p.s / tailLen) * smoothstep((total - p.s) / headLen))
        })

        ribbonBody.setAttribute('points', ribbonOutline(path, 1, 0))
        ribbonShade.setAttribute('points', ribbonOutline(path, 0.42, -0.2))
        ribbonShine.setAttribute('points', ribbonOutline(path, 0.26, 0.2))

    }

    function clearRibbon() {
        ;[ribbonBody, ribbonShade, ribbonShine].forEach(function (el) {
            el.setAttribute('points', '')
        })
    }

    function clearDragGeometry() {
        clearRibbon()
        drag.points = []
        ribbonHead = null
    }

    // The newest point is the pointer itself; draw at most once per frame.
    var ribbonHead = null
    var ribbonRaf = null
    function updateDragGeometry(x, y) {
        ribbonHead = { x: x, y: y, t: performance.now() }
        if (ribbonRaf !== null) return
        ribbonRaf = window.requestAnimationFrame(function () {
            ribbonRaf = null
            if (ribbonHead && drag.active) renderRibbon(drag.points.concat([ribbonHead]))
        })
    }

    // -------------------------------------------------- "draw here" demo
    // Until someone has drawn, a flourish draws itself every few seconds, so
    // it is obvious the page can be drawn on. It stops for good on the first
    // real drag, and never plays with reduced motion.
    var hasDrawn = false
    try {
        hasDrawn = window.sessionStorage.getItem('hg-drawn') === '1'
    } catch (e) {}

    var ghost = { timer: null, raf: null, running: false, plays: 0 }

    // A looping, hand-drawn-looking curve (a prolate trochoid), as stage points.
    function ghostPath(w, h, textBottom) {
        var loops = 2
        var count = 46
        var raw = []
        for (var i = 0; i <= count; i++) {
            var th = (i / count) * Math.PI * 2 * loops
            raw.push({ x: th - 1.9 * Math.sin(th), y: -1.9 * Math.cos(th) + 0.4 * Math.sin(th * 0.5) })
        }
        var xs = raw.map(function (p) { return p.x })
        var ys = raw.map(function (p) { return p.y })
        var minX = Math.min.apply(null, xs)
        var maxX = Math.max.apply(null, xs)
        var minY = Math.min.apply(null, ys)
        var maxY = Math.max.apply(null, ys)
        // Below the intro text, so the flourish never writes over it.
        var top = clamp(textBottom + 18, h * 0.4, h * 0.72)
        var width = w * 0.84
        var height = Math.max(70, Math.min(h * 0.34, width * 0.5, h - 28 - top))
        var left = w * 0.08
        return raw.map(function (p, i) {
            return {
                x: left + ((p.x - minX) / (maxX - minX)) * width,
                y: top + ((p.y - minY) / (maxY - minY)) * height,
                t: (i / count) * GHOST.drawMs,
            }
        })
    }

    function ghostAllowed() {
        return (
            !hasDrawn &&
            !drag.active &&
            docVisible &&
            !reducedMotionMedia.matches &&
            !document.documentElement.classList.contains('project-selected') &&
            !document.documentElement.classList.contains('menu-open')
        )
    }

    function scheduleGhost(delay) {
        if (ghost.timer !== null) window.clearTimeout(ghost.timer)
        ghost.timer = null
        if (hasDrawn || ghost.plays >= GHOST.maxPlays) return
        ghost.timer = window.setTimeout(playGhost, delay)
    }

    function cancelGhost() {
        if (ghost.timer !== null) window.clearTimeout(ghost.timer)
        if (ghost.raf !== null) window.cancelAnimationFrame(ghost.raf)
        ghost.timer = null
        ghost.raf = null
        if (ghost.running) {
            ghost.running = false
            dragSvg.style.transition = 'none'
            dragSvg.style.opacity = '0'
            clearDragGeometry()
        }
    }

    function playGhost() {
        ghost.timer = null
        if (!ghostAllowed()) return scheduleGhost(2500)
        var rect = host.getBoundingClientRect()
        var path = ghostPath(rect.width, rect.height, intro.getBoundingClientRect().bottom - rect.top)
        var started = performance.now()
        ghost.running = true
        ghost.plays++
        dragSvg.style.transition = 'none'
        dragSvg.style.opacity = '1'

        function frame(now) {
            ghost.raf = null
            if (!ghost.running) return
            var u = clamp((now - started) / GHOST.drawMs, 0, 1)
            var eased = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2
            var f = eased * (path.length - 1)
            var whole = Math.floor(f)
            var points = path.slice(0, whole + 1)
            if (whole < path.length - 1) {
                var m = f - whole
                var a = path[whole]
                var b = path[whole + 1]
                points.push({ x: a.x + (b.x - a.x) * m, y: a.y + (b.y - a.y) * m, t: a.t + (b.t - a.t) * m })
            }
            renderRibbon(points)
            if (u < 1) {
                ghost.raf = window.requestAnimationFrame(frame)
                return
            }
            ghost.timer = window.setTimeout(function () {
                dragSvg.style.transition = 'opacity ' + GHOST.fadeMs + 'ms ease'
                dragSvg.style.opacity = '0'
                ghost.timer = window.setTimeout(function () {
                    ghost.timer = null
                    ghost.running = false
                    clearDragGeometry()
                    scheduleGhost(GHOST.every)
                }, GHOST.fadeMs + 40)
            }, GHOST.holdMs)
        }
        ghost.raf = window.requestAnimationFrame(frame)
    }

    // The first real drag: the demo has done its job.
    function markDrawn() {
        if (hasDrawn) return
        hasDrawn = true
        try {
            window.sessionStorage.setItem('hg-drawn', '1')
        } catch (e) {}
        cancelGhost()
    }

    // ----------------------------------------------------- intro obstacle
    // The rectangle (in stage coordinates) that cards must stay out of: the
    // intro text plus some breathing room.
    function getIntroObstacle(hostRect) {
        var textRect = intro.getBoundingClientRect()
        var padding = hostRect.width <= 520 ? 12 : 26
        return {
            left: Math.max(0, textRect.left - hostRect.left - padding),
            top: Math.max(0, textRect.top - hostRect.top - padding),
            right: Math.min(hostRect.width, textRect.right - hostRect.left + padding),
            bottom: Math.min(hostRect.height, textRect.bottom - hostRect.top + padding),
        }
    }

    // Project a card into the nearest free strip around the text. If an
    // enlarged card can't fit, shrink it until it does. Runs after the wall
    // collisions so the walls can't push it back over the text.
    function protectIntro(card, hostRect, margin, obstacle) {
        var bounds = getBounds(card.width, card.height, card.rotation, card.scale)
        if (overlapArea(rectFromCenter(card.x, card.y, bounds.halfW, bounds.halfH), obstacle) <= 0) return

        var gap = 3
        var strips = [
            { left: margin, top: margin, right: hostRect.width - margin, bottom: obstacle.top - gap },
            { left: margin, top: obstacle.bottom + gap, right: hostRect.width - margin, bottom: hostRect.height - margin },
            { left: margin, top: margin, right: obstacle.left - gap, bottom: hostRect.height - margin },
            { left: obstacle.right + gap, top: margin, right: hostRect.width - margin, bottom: hostRect.height - margin },
        ]
        var unit = getBounds(card.width, card.height, card.rotation, 1)
        // A hovered / focused card must not hop to another strip (it would leave
        // the pointer behind and flicker): it stays where it is and shrinks to
        // fit, with the pointer still on it.
        var interactive = card.hover || card.focused
        var pinned = card.hover && pointer.active
        var candidates = strips
            .filter(function (s) {
                return s.right > s.left && s.bottom > s.top
            })
            .map(function (s) {
                var scale = Math.min(
                    card.scale,
                    (s.right - s.left) / Math.max(1, unit.halfW * 2),
                    (s.bottom - s.top) / Math.max(1, unit.halfH * 2)
                )
                var halfW = unit.halfW * scale
                var halfH = unit.halfH * scale
                var x = clamp(card.x, s.left + halfW, s.right - halfW)
                var y = clamp(card.y, s.top + halfH, s.bottom - halfH)
                return {
                    x: x,
                    y: y,
                    scale: scale,
                    distance: Math.pow(x - card.x, 2) + Math.pow(y - card.y, 2),
                    covers: !pinned || (Math.abs(x - pointer.x) <= halfW + 1 && Math.abs(y - pointer.y) <= halfH + 1),
                }
            })

        // Prefer a strip that fits without shrinking (for a hovered card: one
        // that keeps it at least full size under the pointer); otherwise the
        // largest possible card. Then the shortest move.
        // (A card easing back down from a hover is judged by its resting size,
        // not by the enlarged size it is leaving.)
        var floor = interactive ? card.baseScale * 0.97 : Math.min(card.scale, card.baseScale) - 0.001
        if (interactive && candidates.some(function (c) { return c.covers })) {
            candidates = candidates.filter(function (c) {
                return c.covers
            })
        }
        candidates.forEach(function (c) {
            c.ok = c.scale >= floor
        })
        candidates.sort(function (a, b) {
            if (a.ok !== b.ok) return a.ok ? -1 : 1
            // A hovered card never trades position for size: it just shrinks.
            if (!interactive && !a.ok && Math.abs(a.scale - b.scale) > 0.001) return b.scale - a.scale
            return a.distance - b.distance
        })
        var best = candidates[0]
        if (!best) return
        if (Math.abs(best.x - card.x) > 0.01) card.vx = 0
        if (Math.abs(best.y - card.y) > 0.01) card.vy = 0
        card.x = best.x
        card.y = best.y
        card.scale = best.scale
    }

    // -------------------------------------------------------- active card
    function getActiveCard() {
        for (var i = 0; i < cards.length; i++) if (cards[i].focused) return cards[i]
        for (var j = 0; j < cards.length; j++) if (cards[j].hover) return cards[j]
        return null
    }

    // Hovered / focused card stays; every other card fades out, and the
    // navigation is told a project is active.
    function syncActiveSelection() {
        var selected = getActiveCard()
        cards.forEach(function (c) {
            c.root.classList.toggle('is-active', c.hover || c.focused)
            c.root.classList.toggle('is-hidden', !!selected && c !== selected)
        })
        HG.motion.set({ projectActive: !!selected })
    }

    // The caption never wraps, so it can be wider than a narrow card. Anchor it
    // on the side facing the middle of the stage so it can't run into a wall.
    function setCaptionSide(card) {
        if (card.hover || card.focused) return
        card.root.classList.toggle('caption-right', card.x > host.clientWidth / 2)
    }

    function setZ(card, z) {
        card.z = z
        card.root.style.zIndex = String(z)
    }

    function clearActive() {
        cards.forEach(function (c) {
            c.hover = false
            c.focused = false
            setZ(c, 1)
        })
        if (host.contains(document.activeElement)) document.activeElement.blur()
        syncActiveSelection()
    }

    function isInteractionLocked() {
        return (
            pointer.down ||
            cards.some(function (c) {
                return c.hover || c.focused
            })
        )
    }

    function shouldAnimate() {
        return !reducedMotionMedia.matches && !paused && docVisible && !pointer.down
    }

    function wantsFrames() {
        if (!ready || !docVisible || pointer.down) return false
        if (shouldAnimate()) return true
        return !reducedMotionMedia.matches && settling
    }

    // ----------------------------------------------------------- the frame
    function draw(t, dt, freezeTransforms) {
        var rect = host.getBoundingClientRect()
        var hostW = rect.width
        var hostH = rect.height
        if (hostW <= 0 || hostH <= 0) return
        var margin = hostW <= 520 ? 14 : 26
        var friction = Math.pow(PHYSICS.frictionPerSec, dt)
        var dtNorm = clamp(dt * 60, 0, 2.2)
        var obstacle = getIntroObstacle(rect)
        var animate = shouldAnimate()
        var reduced = reducedMotionMedia.matches
        var stillEasing = false
        var i, j

        // Soft separation between cards.
        for (i = 0; i < cards.length; i++) {
            var a = cards[i]
            var aBounds = getBounds(a.width, a.height, a.rotation, a.scale)
            var aRect = rectFromCenter(a.x, a.y, aBounds.halfW, aBounds.halfH)
            for (j = i + 1; j < cards.length; j++) {
                var b = cards[j]
                var bBounds = getBounds(b.width, b.height, b.rotation, b.scale)
                var bRect = rectFromCenter(b.x, b.y, bBounds.halfW, bBounds.halfH)
                var dx = b.x - a.x
                var dy = b.y - a.y
                var dist = Math.hypot(dx, dy) || 0.001
                var nx = dx / dist
                var ny = dy / dist
                var overlapRatio = overlapArea(aRect, bRect) / Math.min(rectArea(aRect), rectArea(bRect))

                var push = 0
                if (overlapRatio > 0) {
                    push =
                        (0.06 + overlapRatio * 0.26 + Math.max(0, overlapRatio - 0.25) * 0.42) *
                        PHYSICS.separation
                    if (overlapRatio > 0.75) push += (overlapRatio - 0.75) * 0.6
                } else {
                    var gapX = Math.max(0, Math.abs(dx) - (aBounds.halfW + bBounds.halfW))
                    var gapY = Math.max(0, Math.abs(dy) - (aBounds.halfH + bBounds.halfH))
                    var nearGap = Math.hypot(gapX, gapY)
                    if (nearGap < 22) push = ((22 - nearGap) / 22) * 0.02 * PHYSICS.separation
                }
                push *= dtNorm

                if (push > 0) {
                    if (!(a.hover || a.focused)) {
                        a.vx -= nx * push
                        a.vy -= ny * push
                    }
                    if (!(b.hover || b.focused)) {
                        b.vx += nx * push
                        b.vy += ny * push
                    }
                }
            }
        }

        cards.forEach(function (card) {
            var interactive = card.hover || card.focused
            var freezeCard = freezeTransforms || interactive
            card.targetScale = interactive ? PHYSICS.hoverScale : card.baseScale
            if (!freezeTransforms) {
                // Reduced motion: snap to the target instead of easing.
                card.scale = reduced
                    ? card.targetScale
                    : card.scale + (card.targetScale - card.scale) * Math.min(1, dt * 10)
            }

            if (!freezeCard && animate) {
                // Slow wandering drift, plus a push away from the pointer.
                var wobbleX = Math.sin(t * 0.00027 + card.driftPhase) * card.driftX
                var wobbleY = Math.cos(t * 0.00023 + card.driftPhase) * card.driftY
                card.vx += wobbleX * PHYSICS.driftStrength * dt
                card.vy += wobbleY * PHYSICS.driftStrength * dt
                if (pointer.active) {
                    var pdx = card.x - pointer.x
                    var pdy = card.y - pointer.y
                    var d2 = pdx * pdx + pdy * pdy
                    var limit = 240 * 240
                    if (d2 < limit && d2 > 0.01) {
                        var inv = 1 / Math.sqrt(d2)
                        var mag = (1 - d2 / limit) * PHYSICS.pointerRepel
                        card.vx += pdx * inv * mag * 60 * dt
                        card.vy += pdy * inv * mag * 60 * dt
                    }
                }
            } else {
                card.vx *= Math.pow(0.2, dt)
                card.vy *= Math.pow(0.2, dt)
            }

            card.vx = clamp(card.vx * friction, -PHYSICS.maxSpeed, PHYSICS.maxSpeed)
            card.vy = clamp(card.vy * friction, -PHYSICS.maxSpeed, PHYSICS.maxSpeed)

            if (!freezeCard && animate) {
                card.x += card.vx * dt * 60 * 0.11
                card.y += card.vy * dt * 60 * 0.11
                var targetTilt = card.baseRotation + clamp(card.vx * 0.09, -3.2, 3.2)
                card.rotationTarget += (targetTilt - card.rotationTarget) * Math.min(1, dt * 3)
                card.rotationVelocity += (card.rotationTarget - card.rotation) * PHYSICS.rotationSpring * dt
                card.rotationVelocity *= Math.pow(PHYSICS.rotationDamping, dt * 60)
                card.rotation += card.rotationVelocity * dtNorm
            } else if (!freezeTransforms) {
                if (reduced) {
                    card.rotationTarget = card.rotation = card.baseRotation
                    card.rotationVelocity = 0
                } else {
                    card.rotationTarget += (card.baseRotation - card.rotationTarget) * Math.min(1, dt * 6)
                    card.rotationVelocity += (card.rotationTarget - card.rotation) * PHYSICS.rotationSpring * dt
                    card.rotationVelocity *= Math.pow(PHYSICS.rotationDamping, dt * 60)
                    card.rotation += card.rotationVelocity * dtNorm
                }
            }

            // Keep inside the stage, bouncing softly off the walls.
            var bounds = getBounds(card.width, card.height, card.rotation, card.scale)
            var minX = margin + bounds.halfW
            var maxX = hostW - margin - bounds.halfW
            var minY = margin + bounds.halfH
            var maxY = hostH - margin - bounds.halfH

            if (minX > maxX || minY > maxY) {
                var unit = getBounds(card.width, card.height, card.rotation, 1)
                var fitScale = Math.min(
                    (hostW - margin * 2) / Math.max(1, unit.halfW * 2),
                    (hostH - margin * 2) / Math.max(1, unit.halfH * 2)
                )
                card.scale = clamp(fitScale, 0.1, 1.4)
                card.x = hostW / 2
                card.y = hostH / 2
            } else {
                if (card.x < minX) {
                    card.x = minX
                    card.vx = Math.abs(card.vx) * 0.2
                } else if (card.x > maxX) {
                    card.x = maxX
                    card.vx = -Math.abs(card.vx) * 0.2
                }
                if (card.y < minY) {
                    card.y = minY
                    card.vy = Math.abs(card.vy) * 0.2
                } else if (card.y > maxY) {
                    card.y = maxY
                    card.vy = -Math.abs(card.vy) * 0.2
                }
            }

            protectIntro(card, rect, margin, obstacle)

            // Compare with the previous frame *after* the walls / text have had
            // their say, so a card held at a smaller size doesn't count as easing.
            if (Math.abs(card.scale - card.prevScale) > 0.0004 || Math.abs(card.rotation - card.prevRotation) > 0.004) {
                stillEasing = true
            }
            card.prevScale = card.scale
            card.prevRotation = card.rotation

            card.root.style.transform =
                'translate3d(' + (card.x - card.width / 2).toFixed(2) + 'px,' +
                (card.y - card.height / 2).toFixed(2) + 'px,0) ' +
                'rotate(' + card.rotation.toFixed(2) + 'deg) ' +
                'scale(' + card.scale.toFixed(3) + ')'
        })
        settling = stillEasing
    }

    function tick(time) {
        var dt = clamp((time - lastTick) / 1000, 0, 1 / 24)
        lastTick = time
        draw(time, dt, false)
        rafId = wantsFrames() ? window.requestAnimationFrame(tick) : null
    }

    function startLoop() {
        if (!wantsFrames() || rafId != null) return
        rafId = window.requestAnimationFrame(function (t) {
            // Pretend one 60fps frame has passed so the first frame isn't dt = 0.
            lastTick = t - 1000 / 60
            tick(t)
        })
    }

    function stopLoop() {
        if (rafId != null) {
            window.cancelAnimationFrame(rafId)
            rafId = null
        }
    }

    function oneShotDraw(freezeTransforms) {
        draw(performance.now(), 1 / 60, !!freezeTransforms)
    }

    // ----------------------------------------------------------- layout
    // Nudge overlapping resting cards apart (only used after a layout change).
    function repairLayout(hostRect, margin) {
        var obstacle = getIntroObstacle(hostRect)
        for (var iter = 0; iter < 10; iter++) {
            var changed = false
            for (var i = 0; i < cards.length; i++) {
                var a = cards[i]
                if (a.hover || a.focused) continue
                var aRect = cardRect(a, a.baseRotation, a.baseScale)
                for (var j = i + 1; j < cards.length; j++) {
                    var b = cards[j]
                    if (b.hover || b.focused) continue
                    var bRect = cardRect(b, b.baseRotation, b.baseScale)
                    var oa = overlapArea(aRect, bRect)
                    if (oa <= 0) continue
                    var overlapRatio = oa / Math.min(rectArea(aRect), rectArea(bRect))
                    var dx = b.x - a.x
                    var dy = b.y - a.y
                    var dist = Math.hypot(dx, dy) || 1
                    var nx = dx / dist
                    var ny = dy / dist
                    var shift = (0.5 + overlapRatio * 1.7) * 3.8
                    a.x -= nx * shift
                    a.y -= ny * shift
                    b.x += nx * shift
                    b.y += ny * shift
                    changed = true
                }
            }
            cards.forEach(function (c) {
                var bounds = getBounds(c.width, c.height, c.baseRotation, c.baseScale)
                var minX = margin + bounds.halfW
                var maxX = hostRect.width - margin - bounds.halfW
                var minY = margin + bounds.halfH
                var maxY = hostRect.height - margin - bounds.halfH
                c.x = clamp(c.x, Math.min(minX, maxX), Math.max(minX, maxX))
                c.y = clamp(c.y, Math.min(minY, maxY), Math.max(minY, maxY))
                protectIntro(c, hostRect, margin, obstacle)
            })
            if (!changed) break
        }
    }

    // Sizes every card for the current stage, and places any card that has not
    // been placed yet (cards that already have a position keep it, scaled to
    // the new stage size).
    function layoutCards() {
        var hostRect = host.getBoundingClientRect()
        if (!cards.length || hostRect.width <= 0 || hostRect.height <= 0) return

        var count = cards.length
        var w = hostRect.width
        var baseSeed = hashString(count + ':' + Math.round(w) + ':' + Math.round(hostRect.height))
        var minDim = Math.max(1, Math.min(w, hostRect.height))
        var density = clamp(count / 8, 0.95, 2.4)
        var areaNorm = clamp(Math.sqrt((w * hostRect.height) / 450000), 0.72, 1.12)
        var baseMin = w <= 520 ? 88 : w <= 860 ? 108 : 124
        var baseMax = w <= 520 ? 116 : w <= 860 ? 146 : 174
        var sizeMin = clamp(baseMin * areaNorm * (1.02 - (density - 1) * 0.16), 56, baseMax)
        var sizeMax = clamp(baseMax * areaNorm * (1.0 - (density - 1) * 0.14), sizeMin + 10, 196)
        var safeMargin = w <= 520 ? 10 : 18
        var occupancyBudget = 0.5
        var introRect = getIntroObstacle(hostRect)
        var rx = layoutW > 0 ? w / layoutW : 1
        var ry = layoutH > 0 ? hostRect.height / layoutH : 1
        var materialChange = false

        // 1. Width from the seeded random + image shape, then measure the height.
        var drafts = cards.map(function (card) {
            var rnd = makeRandom(hashString(baseSeed + ':' + card.key))
            var width = clamp(
                sizeMin + rnd() * (sizeMax - sizeMin) + (card.ratio - 1) * 14,
                sizeMin,
                sizeMax
            )
            card.root.style.width = width + 'px'
            return { card: card, rnd: rnd, width: width, height: 0, captionHeight: 0 }
        })

        function measure(d) {
            d.height = d.card.root.offsetHeight || d.card.root.getBoundingClientRect().height || 96
            d.captionHeight = Math.max(22, d.card.caption.offsetHeight || 22)
        }
        drafts.forEach(measure)

        // A card must fit in the strip above AND the strip below the text,
        // otherwise every card ends up pushed into the one strip that is tall
        // enough. Shrink anything taller than that.
        var stripH = Math.min(introRect.top, hostRect.height - introRect.bottom) - safeMargin
        if (stripH > 48) {
            var maxCardH = stripH * 0.9
            var floorW = w <= 520 ? 48 : 64
            drafts.forEach(function (d) {
                if (d.height <= maxCardH) return
                var coverH = Math.max(1, d.height - d.captionHeight)
                d.width = Math.max(floorW, d.width * Math.max(0.2, (maxCardH - d.captionHeight) / coverH))
                d.card.root.style.width = d.width + 'px'
                measure(d)
            })
        }

        // 2. Too crowded? Scale every card down to fit the free area.
        var usableArea = Math.max(1, (w - safeMargin * 2) * (hostRect.height - safeMargin * 2))
        var footprint = drafts.reduce(function (sum, d) {
            return sum + d.width * d.height
        }, 0)
        var textArea =
            Math.max(0, introRect.right - introRect.left) * Math.max(0, introRect.bottom - introRect.top)
        var targetFootprint = Math.max(1, usableArea - textArea) * occupancyBudget
        if (footprint > targetFootprint) {
            var scaleDown = Math.sqrt(targetFootprint / footprint)
            var minW = w <= 520 ? 56 : w <= 860 ? 72 : 88
            drafts.forEach(function (d) {
                d.width = clamp(d.width * scaleDown, minW, sizeMax)
                d.card.root.style.width = d.width + 'px'
            })
            drafts.forEach(measure)
        }

        // 3. Place cards, one at a time, at the best of many sampled spots.
        var placed = []
        drafts.forEach(function (d, index) {
            var card = d.card
            var rnd = d.rnd
            var prev = card.placed
            var sizeChanged = !prev || Math.abs(card.width - d.width) > 2 || Math.abs(card.height - d.height) > 2
            if (sizeChanged) materialChange = true
            card.width = d.width
            card.height = d.height

            if (prev) {
                card.x = clamp(safeMargin + (card.x - safeMargin) * rx, safeMargin, w - safeMargin)
                card.y = clamp(safeMargin + (card.y - safeMargin) * ry, safeMargin, hostRect.height - safeMargin)
                placed.push(card)
                return
            }

            card.baseRotation = (rnd() - 0.5) * 7
            card.baseScale = 0.96 + rnd() * 0.06
            var samples = Math.max(160, count * 30)
            var bestX = w * 0.5
            var bestY = hostRect.height * 0.5
            var bestScore = -Infinity

            for (var s = 0; s < samples; s++) {
                var hIndex = 1 + index * samples + s
                var jx = (rnd() - 0.5) * 0.08
                var jy = (rnd() - 0.5) * 0.08
                var px0 = safeMargin + clamp(halton(hIndex, 2) + jx, 0.03, 0.97) * Math.max(1, w - safeMargin * 2)
                var py0 =
                    safeMargin +
                    clamp(halton(hIndex, 3) + jy, 0.03, 0.97) * Math.max(1, hostRect.height - safeMargin * 2)

                var fitScale = card.baseScale
                var testBounds = getBounds(d.width, d.height, card.baseRotation, fitScale)
                if (
                    safeMargin + testBounds.halfW > w - safeMargin - testBounds.halfW ||
                    safeMargin + testBounds.halfH > hostRect.height - safeMargin - testBounds.halfH
                ) {
                    var unit = getBounds(d.width, d.height, card.baseRotation, 1)
                    fitScale = clamp(
                        Math.min(
                            (w - safeMargin * 2) / Math.max(1, unit.halfW * 2),
                            (hostRect.height - safeMargin * 2) / Math.max(1, unit.halfH * 2)
                        ),
                        0.1,
                        card.baseScale
                    )
                }
                var bounds = getBounds(d.width, d.height, card.baseRotation, fitScale)
                var px = clamp(px0, safeMargin + bounds.halfW, Math.max(safeMargin + bounds.halfW, w - safeMargin - bounds.halfW))
                var py = clamp(
                    py0,
                    safeMargin + bounds.halfH,
                    Math.max(safeMargin + bounds.halfH, hostRect.height - safeMargin - bounds.halfH)
                )
                var rectA = rectFromCenter(px, py, bounds.halfW, bounds.halfH)
                var captionRatioA = clamp(d.captionHeight / Math.max(1, d.height), 0.14, 0.5)
                var rectCaptionA = {
                    left: rectA.left,
                    right: rectA.right,
                    top: rectA.bottom - (rectA.bottom - rectA.top) * captionRatioA,
                    bottom: rectA.bottom,
                }

                var nearestGap = Infinity
                var overlapPenalty = 0
                var hardPenalty = 0
                for (var k = 0; k < placed.length; k++) {
                    var other = placed[k]
                    var rectB = cardRect(other, other.baseRotation, other.baseScale)
                    var gapX = Math.max(0, rectB.left - rectA.right, rectA.left - rectB.right)
                    var gapY = Math.max(0, rectB.top - rectA.bottom, rectA.top - rectB.bottom)
                    nearestGap = Math.min(nearestGap, Math.hypot(gapX / Math.max(1, w), gapY / Math.max(1, hostRect.height)))

                    var ratio = overlapArea(rectA, rectB) / Math.min(rectArea(rectA), rectArea(rectB))
                    var otherCaptionRatio = clamp((other.caption.offsetHeight || 24) / Math.max(1, other.height), 0.14, 0.5)
                    var rectCaptionB = {
                        left: rectB.left,
                        right: rectB.right,
                        top: rectB.bottom - (rectB.bottom - rectB.top) * otherCaptionRatio,
                        bottom: rectB.bottom,
                    }
                    // Avoid covering another card's caption (and having ours covered).
                    var maskA = overlapArea(rectCaptionA, rectB) / rectArea(rectCaptionA)
                    var maskB = overlapArea(rectCaptionB, rectA) / rectArea(rectCaptionB)
                    overlapPenalty += Math.max(0, ratio - 0.12) * 4.4
                    if (ratio > 0.26) hardPenalty += (ratio - 0.26) * 15
                    if (ratio > 0.72) hardPenalty += (ratio - 0.72) * 50
                    hardPenalty += (maskA + maskB) * 14
                    if (maskA > 0.24 || maskB > 0.24) hardPenalty += (Math.max(maskA, maskB) - 0.24) * 60
                }

                var edge = Math.min(rectA.left, w - rectA.right, rectA.top, hostRect.height - rectA.bottom)
                var introOverlap = overlapArea(rectA, introRect)
                var centerPenalty =
                    introOverlap > 0 ? 900 + (2200 * introOverlap) / Math.max(1, d.width * d.height) : 0
                // A mild pull toward the copy, so images cluster around it
                // instead of all sitting at the outer edges.
                var introGapX = Math.max(0, introRect.left - rectA.right, rectA.left - introRect.right)
                var introGapY = Math.max(0, introRect.top - rectA.bottom, rectA.top - introRect.bottom)
                var introDistancePenalty = (Math.hypot(introGapX, introGapY) / minDim) * 6
                var score =
                    (nearestGap === Infinity ? 0.35 : nearestGap) * 18 +
                    (edge / minDim) * 1.8 -
                    overlapPenalty -
                    hardPenalty -
                    centerPenalty -
                    introDistancePenalty +
                    rnd() * 0.04
                if (score > bestScore) {
                    bestScore = score
                    bestX = px
                    bestY = py
                }
            }

            card.x = bestX
            card.y = bestY
            card.vx = (rnd() - 0.5) * 5
            card.vy = (rnd() - 0.5) * 5
            card.driftX = (rnd() - 0.5) * 1.8
            card.driftY = (rnd() - 0.5) * 1.8
            card.driftPhase = rnd() * Math.PI * 2
            card.rotation = card.baseRotation
            card.rotationVelocity = 0
            card.rotationTarget = card.baseRotation
            card.scale = card.targetScale = card.prevScale = card.baseScale
            card.prevRotation = card.baseRotation
            card.placed = true
            placed.push(card)
        })

        layoutW = w
        layoutH = hostRect.height

        if (materialChange) {
            if (isInteractionLocked()) {
                pendingRepair = true
            } else {
                repairLayout(hostRect, safeMargin)
                pendingRepair = false
            }
        }
        oneShotDraw(pointer.down || !shouldAnimate())
        startLoop()
    }

    // Layout / repair work is postponed while the user is interacting, so a
    // card never jumps out from under the cursor.
    function flushPendingWork() {
        if (isInteractionLocked()) return
        if (pendingRelayout) {
            pendingRelayout = false
            layoutCards()
            return
        }
        if (pendingRepair) {
            var rect = host.getBoundingClientRect()
            repairLayout(rect, rect.width <= 520 ? 14 : 26)
            pendingRepair = false
            oneShotDraw(false)
        }
    }

    function requestDeferredFlush() {
        if (flushRaf != null) return
        flushRaf = window.requestAnimationFrame(function () {
            flushRaf = null
            flushPendingWork()
        })
    }

    function scheduleRelayout() {
        if (isInteractionLocked()) {
            pendingRelayout = true
            return
        }
        if (relayoutRaf != null || pendingRelayout) return
        relayoutRaf = window.requestAnimationFrame(function () {
            relayoutRaf = null
            layoutCards()
        })
    }

    // ------------------------------------------------------------- cards
    function createCard(project) {
        var root = HG.createProjectCard(project)
        host.appendChild(root)

        var card = {
            key: project.slug,
            root: root,
            img: root.querySelector('img'),
            cover: root.querySelector('.project-cover'),
            caption: root.querySelector('.project-caption'),
            ratio: project.ratio || 1,
            placed: false,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            driftX: 0,
            driftY: 0,
            driftPhase: 0,
            rotation: 0,
            rotationVelocity: 0,
            rotationTarget: 0,
            baseRotation: 0,
            scale: 1,
            baseScale: 1,
            targetScale: 1,
            prevScale: 1,
            prevRotation: 0,
            width: 0,
            height: 0,
            hover: false,
            focused: false,
            z: 1,
        }

        root.addEventListener('pointerenter', function (event) {
            if (touchLike) return
            var p = stagePoint(event)
            pointer.x = p.x
            pointer.y = p.y
            pointer.active = true
            setCaptionSide(card)
            cards.forEach(function (c) {
                c.hover = false
                if (!c.focused) setZ(c, 1)
            })
            card.hover = true
            setZ(card, 20)
            syncActiveSelection()
            oneShotDraw(pointer.down)
            startLoop()
        })
        root.addEventListener('pointerleave', function () {
            card.hover = false
            if (!card.focused) setZ(card, 1)
            syncActiveSelection()
            oneShotDraw(pointer.down)
            startLoop()
            if (!isInteractionLocked()) requestDeferredFlush()
        })
        root.addEventListener('focus', function () {
            setCaptionSide(card)
            cards.forEach(function (c) {
                c.focused = false
                setZ(c, 1)
            })
            card.focused = true
            setZ(card, 20)
            syncActiveSelection()
            oneShotDraw(pointer.down)
            startLoop()
        })
        root.addEventListener('blur', function () {
            card.focused = false
            if (!card.hover) setZ(card, 1)
            syncActiveSelection()
            oneShotDraw(pointer.down)
            startLoop()
            if (!isInteractionLocked()) requestDeferredFlush()
        })

        // Once the real image shape is known, re-measure.
        var img = card.img
        var onImageLoad = function () {
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                card.ratio = img.naturalWidth / img.naturalHeight
                card.cover.style.aspectRatio = String(card.ratio)
            }
            scheduleRelayout()
        }
        if (img.complete) onImageLoad()
        else img.addEventListener('load', onImageLoad, { once: true })

        return card
    }

    // ------------------------------------------------------ pointer input
    function stagePoint(event) {
        var rect = host.getBoundingClientRect()
        return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    function onPointerMove(event) {
        var p = stagePoint(event)
        pointer.active = true
        pointer.x = p.x
        pointer.y = p.y

        if (!drag.active || drag.pointerId !== event.pointerId) return

        if (!drag.dragging && Math.hypot(p.x - drag.startX, p.y - drag.startY) >= DRAG.threshold) {
            drag.dragging = true
            dragSvg.style.transition = 'none'
            dragSvg.style.opacity = '1'
            // Capture only once it is a real drag. Capturing on pointer-down
            // would steal the click from the project link.
            try {
                host.setPointerCapture(event.pointerId)
            } catch (e) {}
            // A real drag cancels the selected-card state so every project
            // stays visible while the composition moves.
            clearActive()
            document.documentElement.classList.add('is-dragging')
            markDrawn()
        }
        if (!drag.dragging) return

        var dx = clamp(p.x - drag.lastX, -DRAG.maxPointerStep, DRAG.maxPointerStep)
        var dy = clamp(p.y - drag.lastY, -DRAG.maxPointerStep, DRAG.maxPointerStep)

        if (!reducedMotionMedia.matches) {
            cards.forEach(function (card, i) {
                // Each card gets its own "depth", which gives the parallax.
                var seed = (hashString(card.key) % 1000) / 1000
                var depth = DRAG.movementMin + seed * (DRAG.movementMax - DRAG.movementMin)
                card.x += dx * depth
                card.y += dy * depth
                card.vx = clamp(card.vx + dx * depth * 0.25, -PHYSICS.maxSpeed, PHYSICS.maxSpeed)
                card.vy = clamp(card.vy + dy * depth * 0.25, -PHYSICS.maxSpeed, PHYSICS.maxSpeed)
                var tilt = clamp(dx * (0.016 + depth * 0.065), -2, 2)
                card.rotation = clamp(
                    card.rotation + (i % 2 === 0 ? tilt : -tilt * 0.72),
                    card.baseRotation - 14,
                    card.baseRotation + 14
                )
                card.rotationTarget = card.rotation
                card.rotationVelocity = 0
            })
        }

        var last = drag.points[drag.points.length - 1]
        if (!last || Math.hypot(p.x - last.x, p.y - last.y) >= DRAG.sampleDistance) {
            drag.points.push({ x: p.x, y: p.y, t: performance.now() })
            if (drag.points.length > 120) drag.points.shift()
        }
        drag.lastX = p.x
        drag.lastY = p.y
        updateDragGeometry(p.x, p.y)
        oneShotDraw(true)
    }

    function onPointerDown(event) {
        if (event.button !== 0) return
        var p = stagePoint(event)

        if (drag.fadeTimer != null) {
            window.clearTimeout(drag.fadeTimer)
            drag.fadeTimer = null
        }
        // A new press is a new gesture: clear click suppression left over from
        // the previous drag so project links stay clickable.
        drag.suppressClickUntil = 0
        drag.active = true
        drag.dragging = false
        drag.pointerId = event.pointerId
        drag.startX = drag.lastX = p.x
        drag.startY = drag.lastY = p.y
        cancelGhost()
        clearDragGeometry()
        drag.points = [{ x: p.x, y: p.y, t: performance.now() }]
        dragSvg.style.transition = 'none'
        dragSvg.style.opacity = '0'

        pointer.down = true
        stopLoop()
        oneShotDraw(true)
    }

    function onPointerUp(event) {
        if (drag.active && drag.pointerId === event.pointerId) {
            if (drag.dragging) {
                // The click that follows a drag must not open a project.
                drag.suppressClickUntil = performance.now() + 360
                dragSvg.style.transition = 'opacity ' + DRAG.fadeMs + 'ms ease'
                dragSvg.style.opacity = '0'
                drag.fadeTimer = window.setTimeout(function () {
                    clearDragGeometry()
                    drag.fadeTimer = null
                }, DRAG.fadeMs + 40)
            } else {
                clearDragGeometry()
            }
            drag.active = false
            drag.dragging = false
            drag.pointerId = null
            document.documentElement.classList.remove('is-dragging')
            try {
                if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId)
            } catch (e) {}
        }
        pointer.down = false
        oneShotDraw(true)
        requestDeferredFlush()
        startLoop()
    }

    host.addEventListener('pointermove', onPointerMove)
    host.addEventListener('pointerleave', function () {
        if (!drag.dragging) pointer.active = false
        requestDeferredFlush()
    })
    host.addEventListener('pointerdown', onPointerDown)
    host.addEventListener(
        'click',
        function (event) {
            if (performance.now() < drag.suppressClickUntil) {
                event.preventDefault()
                event.stopPropagation()
            }
        },
        true
    )
    // Stop the browser's own image / link drag ghost fighting the custom drag.
    host.addEventListener('dragstart', function (event) {
        event.preventDefault()
    })
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    document.addEventListener('visibilitychange', function () {
        docVisible = !document.hidden
        if (!docVisible) {
            stopLoop()
        } else {
            oneShotDraw(pointer.down || !shouldAnimate())
            startLoop()
        }
    })

    reducedMotionMedia.addEventListener('change', function () {
        stopLoop()
        oneShotDraw(pointer.down || !shouldAnimate())
        startLoop()
    })

    // Coming back with the browser's back button can restore the page with a
    // card still "selected" (everything else hidden) — reset that.
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            pointer.down = false
            clearActive()
            oneShotDraw(false)
            startLoop()
        }
    })

    // PAUSE / RESUME.
    HG.motion.subscribe(function (state) {
        paused = state.paused
        if (!ready) return
        oneShotDraw(pointer.down || paused)
        if (paused) stopLoop()
        else startLoop()
    })

    // -------------------------------------------------------------- start
    host.appendChild(dragSvg)
    cards = HG.homeCards().map(createCard)
    layoutCards()
    ready = true
    startLoop()
    scheduleGhost(GHOST.firstDelay)

    if (typeof ResizeObserver !== 'undefined') {
        var resizeObserver = new ResizeObserver(scheduleRelayout)
        resizeObserver.observe(host)
        resizeObserver.observe(intro)
    } else {
        window.addEventListener('resize', scheduleRelayout)
    }
    if (document.fonts) {
        document.fonts.addEventListener('loadingdone', scheduleRelayout)
        document.fonts.ready.then(scheduleRelayout)
    }
})()
