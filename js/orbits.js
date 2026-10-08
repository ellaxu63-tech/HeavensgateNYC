/*
 * The orbits. When the home page opens, big white rings are drawn across it one
 * after another, like the white swooshes on the "the sin : vanish" poster: long
 * ellipses tilted at different angles that cross each other and run off the
 * edges of the window, in the same flat white stroke with a soft shadow that you
 * draw with (js/ribbon.js).
 *
 * They move: a pen travels round each ring, drawing it. With all the rings in
 * place they are left up for a moment, then each is rubbed out (its
 * tail runs along it) and the page is clear to draw on, which is the point.
 *
 * Nothing starts until the page has loaded and is on screen, so the drawing is
 * never spent on a blank window. With reduced motion nothing is drawn. They sit
 * over the images but under the sentence (so it stays readable), and never take
 * clicks or hovers.
 *
 * The numbers to play with are at the top: where each ring is, how big, how
 * tilted, how thick, which way the pen goes, and the timing.
 */
(function () {
    'use strict'

    var HG = window.HG
    if (!HG || !HG.ribbon || document.body.getAttribute('data-page') !== 'home') return
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return

    // One entry per ring, placed like the rings on the poster.
    // cx / cy: its centre as a fraction of the window.
    // rx / ry: half its long / short side, as a fraction of half the window's diagonal.
    // tilt: degrees, clockwise. width: how thick, 1 is the usual. from: where on the
    // ring the pen starts (degrees round it). dir: 1 or -1, which way the pen goes.
    // thick: where on the ring the line is widest (degrees).
    var RINGS = [
        { cx: 0.47, cy: 0.4, rx: 0.3, ry: 0.62, tilt: 22, width: 1, from: 250, dir: 1, thick: 20 },
        { cx: 0.5, cy: 0.47, rx: 0.88, ry: 0.17, tilt: -33, width: 1.6, from: 200, dir: -1, thick: 300 },
        { cx: 0.66, cy: 0.52, rx: 0.3, ry: 0.63, tilt: 33, width: 1, from: 70, dir: 1, thick: 150 },
        { cx: 0.12, cy: 0.28, rx: 0.62, ry: 0.27, tilt: 20, width: 0.8, from: 330, dir: -1, thick: 60 },
    ]

    // Seconds. Ring number n starts n * STAGGER after the first and takes DRAW to go
    // round. Once the last is drawn they stay HOLD, then ring n starts to be rubbed
    // out n * STAGGER_OUT after the first, taking RUB.
    var STAGGER = 0.12
    var DRAW = 1.0
    var HOLD = 1.0
    var STAGGER_OUT = 0.06
    var RUB = 0.7

    var SAMPLES = 240 // points round one ring

    var SVG_NS = 'http://www.w3.org/2000/svg'
    var svg = null
    var rings = []
    var raf = null
    var began = 0
    var waiting = []

    // Other scripts can wait for the rings to be gone (the draw-here flourish does).
    HG.opening = {
        done: false,
        onDone: function (fn) {
            if (HG.opening.done) fn()
            else waiting.push(fn)
        },
    }

    function ease(t) {
        t = Math.max(0, Math.min(1, t))
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    }

    // Every ring as points [{ x, y, w }] going once round (the last equals the first).
    function build() {
        var w = window.innerWidth
        var h = window.innerHeight
        var unit = Math.hypot(w, h) / 2
        var widest = Math.max(5, Math.min(13, unit * 0.011))

        svg = document.createElementNS(SVG_NS, 'svg')
        svg.setAttribute('class', 'orbits')
        svg.setAttribute('aria-hidden', 'true')
        svg.setAttribute('focusable', 'false')
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h)
        // Inside the stage, between the images and the sentence, but laid out over the whole window.
        var stage = document.getElementById('main') || document.body
        var box = stage.getBoundingClientRect()
        svg.style.left = -box.left + 'px'
        svg.style.top = -box.top + 'px'
        svg.style.width = w + 'px'
        svg.style.height = h + 'px'
        stage.appendChild(svg)

        var last = RINGS.length - 1
        rings = RINGS.map(function (ring, n) {
            var tilt = (ring.tilt * Math.PI) / 180
            var points = []
            for (var i = 0; i <= SAMPLES; i++) {
                var deg = ring.from + ring.dir * (i / SAMPLES) * 360
                var t = (deg * Math.PI) / 180
                var x = ring.rx * unit * Math.cos(t)
                var y = ring.ry * unit * Math.sin(t)
                // A little wider on one side of the ring than the other, like a band seen at an angle.
                var side = (1 + Math.cos(((deg - ring.thick) * Math.PI) / 180)) / 2
                points.push({
                    x: ring.cx * w + x * Math.cos(tilt) - y * Math.sin(tilt),
                    y: ring.cy * h + x * Math.sin(tilt) + y * Math.cos(tilt),
                    w: widest * ring.width * (0.5 + 0.5 * Math.pow(side, 1.2)),
                })
            }
            var drawn = last * STAGGER + DRAW
            return {
                start: n * STAGGER,
                rub: drawn + HOLD + n * STAGGER_OUT,
                points: points,
                stroke: HG.ribbon.create(svg),
                shown: false,
                unit: unit,
            }
        })
    }

    // The point a fraction f (0..1) of the way round the ring.
    function pointAt(points, f) {
        var at = f * (points.length - 1)
        var i = Math.min(points.length - 2, Math.floor(at))
        var m = at - i
        var a = points[i]
        var b = points[i + 1]
        return { x: a.x + (b.x - a.x) * m, y: a.y + (b.y - a.y) * m, w: a.w + (b.w - a.w) * m }
    }

    // The part of the ring between the tail (fraction `from`) and the pen (fraction `to`).
    // The pen's end is pointed while it is travelling and square once it has gone all the way
    // round, and the tail is square until it starts to be rubbed out, so a finished ring is
    // one even line with no seam.
    function piece(ring, from, to) {
        var points = ring.points
        var path = [pointAt(points, from)]
        var first = Math.floor(from * (points.length - 1)) + 1
        var last = Math.floor(to * (points.length - 1))
        for (var i = first; i <= last; i++) path.push({ x: points[i].x, y: points[i].y, w: points[i].w })
        path.push(pointAt(points, to))
        var penTip = ring.unit * 0.1 * (1 - HG.ribbon.smoothstep((to - 0.88) / 0.12))
        var tailTip = ring.unit * 0.14 * HG.ribbon.smoothstep(from / 0.1)
        return HG.ribbon.taper(path, tailTip, penTip)
    }

    function finish() {
        if (raf !== null) window.cancelAnimationFrame(raf)
        raf = null
        if (svg && svg.parentNode) svg.parentNode.removeChild(svg)
        svg = null
        rings = []
        window.removeEventListener('resize', finish)
        HG.opening.done = true
        waiting.splice(0).forEach(function (fn) {
            fn()
        })
    }

    function frame(now) {
        raf = null
        var seconds = (now - began) / 1000
        var live = false
        rings.forEach(function (ring) {
            var head = ease((seconds - ring.start) / DRAW)
            var tail = ease((seconds - ring.rub) / RUB)
            if (seconds < ring.start || tail >= 1) {
                if (ring.shown) ring.stroke.clear()
                ring.shown = false
                if (seconds < ring.start) live = true
                return
            }
            live = true
            ring.shown = true
            ring.stroke.set(piece(ring, tail, Math.max(head, tail + 0.002)))
        })
        if (live) raf = window.requestAnimationFrame(frame)
        else finish()
    }

    function begin() {
        build()
        began = performance.now()
        raf = window.requestAnimationFrame(frame)
        // A resized window moves every ring: they are only a hello, so just end them.
        window.addEventListener('resize', finish)
    }

    // Wait until the page is really there: loaded (but not for ever), fonts in, and on screen.
    var started = false
    function ready() {
        if (started) return
        started = true
        var fonts = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(function (r) { window.setTimeout(r, 1500) })]) : Promise.resolve()
        fonts.then(function () {
            window.requestAnimationFrame(function () {
                window.requestAnimationFrame(function () {
                    if (!document.hidden) return begin()
                    document.addEventListener('visibilitychange', function onShow() {
                        if (document.hidden) return
                        document.removeEventListener('visibilitychange', onShow)
                        begin()
                    })
                })
            })
        })
    }

    if (document.readyState === 'complete') ready()
    else {
        window.addEventListener('load', ready)
        window.setTimeout(ready, 5000)
    }
})()
