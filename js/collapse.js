/*
 * The fall. While an image is hovered / focused on the home page, the writing
 * around it drops to the floor: the nav pills, MENU, the wordmark, the logo, the
 * ABOUT / SHOWS / PAUSE bar and every word of the intro sentence fall with
 * gravity, bounce, tumble and pile up along the bottom edge of the window. When
 * the pointer leaves, they spring back to where they were.
 *
 * It works on copies: each piece is cloned onto a layer fixed over the page and
 * the clone is animated, while the original stays in place (hidden with
 * `html.fall-on`, see styles.css). So the page layout never changes, and nothing
 * the pointer touches is moving. With reduced motion nothing falls; styles.css
 * just fades the writing out instead.
 *
 * The numbers to play with are at the top.
 */
(function () {
    'use strict'

    var HG = window.HG
    if (!HG || !HG.motion || document.body.getAttribute('data-page') !== 'home') return

    var GRAVITY = 2600 // px per second per second
    var BOUNCE = 0.24 // how much speed a piece keeps when it hits the floor
    var MAX_TILT = 26 // degrees: most pieces land tilted by up to this much
    var FLIP_CHANCE = 0.14 // chance that a piece lands (nearly) upside down
    var STAGGER = 0.22 // seconds: pieces start falling at random times within this
    var FLOOR_GAP = 6 // px between the pile and the bottom edge of the window
    var PILE_FILL = 0.78 // how tall a piece counts when others land on it (tilted pieces overlap a little)
    var SIDEWAYS = 5 // how far a piece will slide sideways to avoid landing on a pile (px per px of pile height)
    var RETURN_STAGGER = 0.14
    var SPRING = 140 // how fast they spring back (higher = snappier)

    var root = document.documentElement
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    var layer = null
    var items = []
    var raf = null
    var lastTime = 0

    function rand(min, max) {
        return min + Math.random() * (max - min)
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value))
    }

    // ------------------------------------------------------------- building
    function place(node, rect) {
        var style = node.style
        style.left = rect.left + 'px'
        style.top = rect.top + 'px'
        style.width = rect.width + 'px'
        style.height = rect.height + 'px'
        layer.appendChild(node)
        items.push({
            el: node,
            ox: rect.left,
            oy: rect.top,
            w: rect.width,
            h: rect.height,
            x: 0,
            y: 0,
            rot: 0,
            vx: 0,
            vy: 0,
            vr: 0,
            tx: 0,
            ty: 0,
            trot: 0,
            phase: 'home',
            t: 0,
            delay: 0,
        })
    }

    // A copy of a real element (a pill, the wordmark, the logo).
    function cloneOf(el) {
        var rect = el.getBoundingClientRect()
        if (rect.width < 2 || rect.height < 2) return
        var node = el.cloneNode(true)
        ;['id', 'href', 'aria-pressed', 'aria-label', 'aria-expanded', 'aria-controls', 'aria-current', 'data-nav-collapse'].forEach(function (name) {
            node.removeAttribute(name)
        })
        node.setAttribute('aria-hidden', 'true')
        node.tabIndex = -1
        node.style.boxSizing = 'border-box'
        place(node, rect)
    }

    // One copy per word of the intro sentence, measured where the word really is
    // (so bold words and line breaks come out right).
    function wordsOf(container) {
        var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
        var textNode
        while ((textNode = walker.nextNode())) {
            var text = textNode.nodeValue
            var style = window.getComputedStyle(textNode.parentNode)
            var pattern = /\S+/g
            var match
            while ((match = pattern.exec(text))) {
                var range = document.createRange()
                range.setStart(textNode, match.index)
                range.setEnd(textNode, match.index + match[0].length)
                var rect = range.getBoundingClientRect()
                if (rect.width < 1) continue
                var node = document.createElement('span')
                node.textContent = match[0]
                node.setAttribute('aria-hidden', 'true')
                node.style.fontFamily = style.fontFamily
                node.style.fontSize = style.fontSize
                node.style.fontWeight = style.fontWeight
                node.style.fontStyle = style.fontStyle
                node.style.letterSpacing = style.letterSpacing
                node.style.textTransform = style.textTransform
                node.style.lineHeight = rect.height + 'px' // the box is exactly the text's own height, so the baseline lands where it was
                node.style.color = style.color
                node.style.textShadow = style.textShadow
                place(node, rect)
            }
        }
    }

    function build() {
        layer = document.createElement('div')
        layer.className = 'fall-layer'
        layer.setAttribute('aria-hidden', 'true')
        document.body.appendChild(layer)
        items = []

        document.querySelectorAll('.site-nav .pill, .site-footer--fixed .pill').forEach(cloneOf)
        document.querySelectorAll('.brand-name, .brand-logo').forEach(cloneOf)
        var intro = document.querySelector('.stage-intro')
        if (intro) wordsOf(intro)

        planPile()
        root.classList.add('fall-on')
    }

    // Where each piece ends up. It lands where the floor is lowest, near where it
    // started if it can, so the pile spreads out along the whole bottom edge
    // instead of heaping up under the image. The lowest pieces land first, so the
    // pile builds up from the bottom.
    function planPile() {
        var width = window.innerWidth
        var floor = window.innerHeight - FLOOR_GAP
        var BUCKET = 8
        var heights = []
        var count = Math.ceil(width / BUCKET) + 2
        for (var i = 0; i < count; i++) heights.push(0)

        function highestUnder(left, right) {
            var top = 0
            for (var b = Math.floor(left / BUCKET); b <= Math.floor(right / BUCKET); b++) top = Math.max(top, heights[b] || 0)
            return top
        }

        items
            .slice()
            .sort(function (a, b) {
                return b.oy + b.h - (a.oy + a.h)
            })
            .forEach(function (it) {
                var maxLeft = Math.max(4, width - it.w - 4)
                var best = null
                for (var left = 4; left <= maxLeft; left += BUCKET) {
                    var cost = highestUnder(left, left + it.w) * SIDEWAYS + Math.abs(left - it.ox)
                    if (!best || cost < best.cost) best = { left: left, cost: cost }
                }
                var left2 = clamp((best ? best.left : it.ox) + rand(-10, 10), 4, maxLeft)
                var under = highestUnder(left2, left2 + it.w)
                for (var b = Math.floor(left2 / BUCKET); b <= Math.floor((left2 + it.w) / BUCKET); b++) heights[b] = under + it.h * PILE_FILL
                it.tx = left2 - it.ox
                it.ty = Math.max(0, floor - under - it.h - it.oy)
                var sign = Math.random() < 0.5 ? -1 : 1
                it.trot = Math.random() < FLIP_CHANCE ? sign * rand(150, 200) : rand(-MAX_TILT, MAX_TILT)
            })
    }

    function cleanup() {
        if (raf !== null) window.cancelAnimationFrame(raf)
        raf = null
        if (layer && layer.parentNode) layer.parentNode.removeChild(layer)
        layer = null
        items = []
        root.classList.remove('fall-on')
    }

    // ----------------------------------------------------------- the physics
    function draw(it) {
        it.el.style.transform = 'translate3d(' + it.x.toFixed(2) + 'px,' + it.y.toFixed(2) + 'px,0) rotate(' + it.rot.toFixed(2) + 'deg)'
    }

    function step(it, dt) {
        if (it.phase === 'rest' || it.phase === 'home') return false
        it.t += dt
        if (it.t < it.delay) return true

        if (it.phase === 'fall') {
            it.vy += GRAVITY * dt
            it.y += it.vy * dt
            it.x += (it.tx - it.x) * (1 - Math.exp(-6 * dt))
            it.rot += (it.trot - it.rot) * (1 - Math.exp(-8 * dt))
            if (it.y >= it.ty) {
                it.y = it.ty
                if (Math.abs(it.vy) > 240) {
                    it.vy = -it.vy * BOUNCE
                } else {
                    it.vy = 0
                    it.x = it.tx
                    it.rot = it.trot
                    it.phase = 'rest'
                }
            }
            draw(it)
            return it.phase === 'fall'
        }

        // 'return': a critically damped spring back to where it started.
        var damping = 2 * Math.sqrt(SPRING)
        it.vx += (-SPRING * it.x - damping * it.vx) * dt
        it.vy += (-SPRING * it.y - damping * it.vy) * dt
        it.vr += (-SPRING * it.rot - damping * it.vr) * dt
        it.x += it.vx * dt
        it.y += it.vy * dt
        it.rot += it.vr * dt
        var settled =
            Math.abs(it.x) < 0.3 && Math.abs(it.y) < 0.3 && Math.abs(it.rot) < 0.2 &&
            Math.abs(it.vx) < 6 && Math.abs(it.vy) < 6 && Math.abs(it.vr) < 4
        if (settled) {
            it.x = it.y = it.rot = 0
            it.phase = 'home'
        }
        draw(it)
        return !settled
    }

    function frame(now) {
        raf = null
        var dt = Math.min(0.033, (now - lastTime) / 1000 || 0.016)
        lastTime = now
        var busy = false
        items.forEach(function (it) {
            if (step(it, dt)) busy = true
        })
        if (busy) {
            raf = window.requestAnimationFrame(frame)
            return
        }
        // Everything has come to rest. If it is all back home, put the originals back.
        if (items.length && items.every(function (it) { return it.phase === 'home' })) cleanup()
    }

    function run() {
        if (raf !== null) return
        lastTime = performance.now()
        raf = window.requestAnimationFrame(frame)
    }

    // ------------------------------------------------------------- start / stop
    function start() {
        if (reduced.matches) return
        if (!layer) build()
        items.forEach(function (it) {
            // Already on the floor (or falling): leave it. Coming back: fall again.
            if (it.phase === 'return' || it.phase === 'home') {
                it.phase = 'fall'
                it.t = 0
                it.delay = rand(0, STAGGER)
                it.vx = it.vy = it.vr = 0
            }
        })
        run()
    }

    function stop() {
        if (!layer) return
        items.forEach(function (it) {
            if (it.phase === 'home') return
            it.phase = 'return'
            it.t = 0
            it.delay = rand(0, RETURN_STAGGER)
            it.vx = it.vy = it.vr = 0
        })
        run()
    }

    var wasActive = false
    HG.motion.subscribe(function (state) {
        if (state.projectActive === wasActive) return
        wasActive = state.projectActive
        if (wasActive) start()
        else stop()
    })

    // A resized window moves everything: start over (and fall again if still hovering).
    var resizeTimer = null
    window.addEventListener('resize', function () {
        if (!layer) return
        window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(function () {
            cleanup()
            if (wasActive) start()
        }, 150)
    })

    // For testing: copies at rest in place (no movement), and the way back out.
    HG.collapse = { start: start, stop: stop, _build: build, _cleanup: cleanup }
})()
