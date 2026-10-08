/*
 * The orbits. When the home page opens, a few big, thin white rings are drawn
 * across it, one after another, like the white swooshes on the "the sin :
 * vanish" poster: long ellipses tilted at different angles that run off the
 * edges of the window, each with a soft shadow beside it so it looks pressed
 * into the page.
 *
 * They sit behind everything (the same layer as the grid lines), so images,
 * text and the pointer are not affected. They stay once drawn. With reduced
 * motion they are simply there.
 *
 * The numbers to play with are at the top: where each ring is, how big, how
 * tilted, and when it starts drawing.
 */
(function () {
    'use strict'

    if (document.body.getAttribute('data-page') !== 'home') return

    // One entry per ring. cx / cy: its centre as a fraction of the window.
    // rx / ry: half its long / short side, as a fraction of half the window's
    // diagonal. tilt: degrees, clockwise. from: where on the ring the pen starts
    // (degrees round the ring). delay / ms: when it starts and how long it takes.
    var RINGS = [
        { cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.78, tilt: 24, from: 250, delay: 0.45, ms: 2600 },
        { cx: 0.3, cy: 0.99, rx: 0.76, ry: 0.19, tilt: -27, from: 200, delay: 0.95, ms: 2400 },
        { cx: 0.81, cy: 0.9, rx: 0.25, ry: 0.41, tilt: 28, from: 70, delay: 1.45, ms: 2200 },
        { cx: 0.18, cy: -0.06, rx: 0.75, ry: 0.29, tilt: 23, from: 330, delay: 1.9, ms: 2200 },
    ]

    // How the line looks: the line itself, and two wider, fainter copies a little
    // down and to the right of it (the shadow).
    var LINE = [
        { width: 9, alpha: 0.05, dx: 2.5, dy: 3.5 },
        { width: 4.4, alpha: 0.12, dx: 1.5, dy: 2 },
        { width: 1.8, alpha: 0.95, dx: 0, dy: 0 },
    ]

    var SVG_NS = 'http://www.w3.org/2000/svg'
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    var svg = null
    var size = { w: 0, h: 0 }

    function el(tag, attrs) {
        var node = document.createElementNS(SVG_NS, tag)
        Object.keys(attrs).forEach(function (name) {
            node.setAttribute(name, attrs[name])
        })
        return node
    }

    // A ring as a path that starts where the pen starts: two half turns round an
    // ellipse of radii rx, ry tilted by `tilt` degrees about (cx, cy).
    function ringPath(cx, cy, rx, ry, tilt, from) {
        var rad = (tilt * Math.PI) / 180
        function at(deg) {
            var t = (deg * Math.PI) / 180
            var x = rx * Math.cos(t)
            var y = ry * Math.sin(t)
            return (
                (cx + x * Math.cos(rad) - y * Math.sin(rad)).toFixed(2) + ' ' +
                (cy + x * Math.sin(rad) + y * Math.cos(rad)).toFixed(2)
            )
        }
        var arc = 'A' + rx.toFixed(2) + ' ' + ry.toFixed(2) + ' ' + tilt + ' 0 1 '
        return 'M' + at(from) + arc + at(from + 180) + arc + at(from)
    }

    function build(animate) {
        if (svg && svg.parentNode) svg.parentNode.removeChild(svg)
        size = { w: window.innerWidth, h: window.innerHeight }
        var unit = Math.hypot(size.w, size.h) / 2

        svg = el('svg', { class: 'orbits', 'aria-hidden': 'true', focusable: 'false' })
        svg.setAttribute('viewBox', '0 0 ' + size.w + ' ' + size.h)
        if (!animate) svg.classList.add('is-static')
        document.body.appendChild(svg)

        RINGS.forEach(function (ring) {
            var d = ringPath(ring.cx * size.w, ring.cy * size.h, ring.rx * unit, ring.ry * unit, ring.tilt, ring.from)
            var group = el('g', {})
            LINE.forEach(function (line) {
                var path = el('path', {
                    d: d,
                    class: 'orbit-line',
                    'stroke-width': line.width,
                    transform: 'translate(' + line.dx + ' ' + line.dy + ')',
                    stroke: 'rgba(var(--fg-rgb),' + line.alpha + ')',
                })
                path.style.setProperty('--delay', ring.delay + 's')
                path.style.setProperty('--ms', ring.ms + 'ms')
                group.appendChild(path)
            })
            svg.appendChild(group)
        })

        // Each path needs its own length: it is how far the line has to be drawn.
        svg.querySelectorAll('.orbit-line').forEach(function (path) {
            path.style.setProperty('--len', Math.ceil(path.getTotalLength()) + 'px')
        })
    }

    build(!reduced.matches)

    // A resized window moves every ring: draw them again in the new place (already drawn).
    var timer = null
    window.addEventListener('resize', function () {
        window.clearTimeout(timer)
        timer = window.setTimeout(function () {
            if (Math.abs(window.innerWidth - size.w) < 3 && Math.abs(window.innerHeight - size.h) < 3) return
            build(false)
        }, 150)
    })
})()
