/*
 * The orbits. When the home page opens, a few big white rings are drawn across
 * it, one after another, like the white swooshes on the "the sin : vanish"
 * poster: long ellipses tilted at different angles that run off the edges of
 * the window, in the same flat white stroke with a soft shadow that you draw
 * with (js/ribbon.js).
 *
 * They move: each ring is a stroke whose pen travels round it while its tail is
 * rubbed out behind, so about two seconds after a ring starts it is gone. When
 * the last one has gone the page is clear and ready to draw on, which is the
 * point. With reduced motion nothing is drawn.
 *
 * They sit over the images but never take clicks or hovers. The numbers to play
 * with are at the top: where each ring is, how big, how tilted, which way the
 * pen goes, and when it starts.
 */
(function () {
    'use strict'

    var HG = window.HG
    if (!HG || !HG.ribbon || document.body.getAttribute('data-page') !== 'home') return
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return

    // One entry per ring. cx / cy: its centre as a fraction of the window.
    // rx / ry: half its long / short side, as a fraction of half the window's
    // diagonal. tilt: degrees, clockwise. from: where on the ring the pen starts
    // (degrees round the ring). dir: 1 or -1, which way the pen goes. thick: where
    // on the ring the stroke is widest (degrees). start: seconds after the page
    // opens.
    var RINGS = [
        { cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.78, tilt: 24, from: 250, dir: 1, thick: 20, start: 0.3 },
        { cx: 0.3, cy: 0.99, rx: 0.76, ry: 0.19, tilt: -27, from: 200, dir: -1, thick: 300, start: 0.65 },
        { cx: 0.81, cy: 0.9, rx: 0.25, ry: 0.41, tilt: 28, from: 70, dir: 1, thick: 150, start: 1.0 },
        { cx: 0.18, cy: -0.06, rx: 0.75, ry: 0.29, tilt: 23, from: 330, dir: -1, thick: 60, start: 1.35 },
    ]

    // Per ring: the pen takes DRAW seconds to go round; its tail starts to be rubbed
    // out LAG seconds after it set off and takes RUB seconds, so a ring is on the
    // page for LAG + RUB seconds.
    var DRAW = 1.5
    var LAG = 0.5
    var RUB = 1.5

    var SAMPLES = 240 // points round one ring

    var SVG_NS = 'http://www.w3.org/2000/svg'
    var svg = null
    var rings = []
    var raf = null
    var began = 0

    function ease(t) {
        t = Math.max(0, Math.min(1, t))
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    }

    // Every ring as points [{ x, y, w }] going once round (the last equals the first).
    function build() {
        var w = window.innerWidth
        var h = window.innerHeight
        var unit = Math.hypot(w, h) / 2
        var widest = Math.max(6, Math.min(15, unit * 0.013))

        svg = document.createElementNS(SVG_NS, 'svg')
        svg.setAttribute('class', 'orbits')
        svg.setAttribute('aria-hidden', 'true')
        svg.setAttribute('focusable', 'false')
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h)
        document.body.appendChild(svg)

        rings = RINGS.map(function (ring) {
            var tilt = (ring.tilt * Math.PI) / 180
            var points = []
            for (var i = 0; i <= SAMPLES; i++) {
                var deg = ring.from + ring.dir * (i / SAMPLES) * 360
                var t = (deg * Math.PI) / 180
                var x = ring.rx * unit * Math.cos(t)
                var y = ring.ry * unit * Math.sin(t)
                // Wider on one side of the ring than the other, like a band seen at an angle.
                var side = (1 + Math.cos(((deg - ring.thick) * Math.PI) / 180)) / 2
                points.push({
                    x: ring.cx * w + x * Math.cos(tilt) - y * Math.sin(tilt),
                    y: ring.cy * h + x * Math.sin(tilt) + y * Math.cos(tilt),
                    w: widest * (0.32 + 0.68 * Math.pow(side, 1.3)),
                })
            }
            return { start: ring.start, points: points, stroke: HG.ribbon.create(svg), shown: false, unit: unit }
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
    function piece(ring, from, to) {
        var points = ring.points
        var path = [pointAt(points, from)]
        var first = Math.floor(from * (points.length - 1)) + 1
        var last = Math.floor(to * (points.length - 1))
        for (var i = first; i <= last; i++) path.push({ x: points[i].x, y: points[i].y, w: points[i].w })
        path.push(pointAt(points, to))
        return HG.ribbon.taper(path, ring.unit * 0.14, ring.unit * 0.1)
    }

    function finish() {
        if (raf !== null) window.cancelAnimationFrame(raf)
        raf = null
        if (svg && svg.parentNode) svg.parentNode.removeChild(svg)
        svg = null
        rings = []
    }

    function frame(now) {
        raf = null
        var seconds = (now - began) / 1000
        var live = false
        rings.forEach(function (ring) {
            var head = ease((seconds - ring.start) / DRAW)
            var tail = ease((seconds - ring.start - LAG) / RUB)
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

    build()
    began = performance.now()
    raf = window.requestAnimationFrame(frame)

    // A resized window moves every ring: they are only a hello, so just end them.
    window.addEventListener('resize', finish)
})()
