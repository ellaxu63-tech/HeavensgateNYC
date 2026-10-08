/*
 * The stroke. Everything drawn on the home page (what you draw with the pointer,
 * the self-drawing flourish and the rings that sweep across when the page opens)
 * is the same kind of line: a flat white band that is thick in places and thin in
 * others, pointed at both ends, with a soft shadow under it so it looks pressed
 * into the page, like the white swooshes on the "the sin : vanish" poster.
 *
 * This file turns a centre line into that band (two SVG polygons: the shadow,
 * blurred, and the white body). The numbers to play with are in STYLE.
 */
(function () {
    'use strict'

    var HG = (window.HG = window.HG || {})
    var SVG_NS = 'http://www.w3.org/2000/svg'

    var STYLE = {
        color: '#ffffff',
        // The shadow: pushed down and to the left, soft, and dark enough to show
        // on the images (on the black page it is not visible, as on a dark poster).
        shadowX: -3,
        shadowY: 5,
        blur: 3.5,
        shadowAlpha: 0.6,
    }

    function el(tag, attrs) {
        var node = document.createElementNS(SVG_NS, tag)
        Object.keys(attrs || {}).forEach(function (name) {
            node.setAttribute(name, attrs[name])
        })
        return node
    }

    function smoothstep(t) {
        t = Math.max(0, Math.min(1, t))
        return t * t * (3 - 2 * t)
    }

    // The polygon round a centre line [{ x, y, w }]: half the width to each side,
    // optionally moved by (dx, dy) (for the shadow).
    function outline(path, dx, dy) {
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
            var half = path[i].w / 2
            var cx = path[i].x + dx
            var cy = path[i].y + dy
            left.push((cx + nx * half).toFixed(1) + ',' + (cy + ny * half).toFixed(1))
            right.push((cx - nx * half).toFixed(1) + ',' + (cy - ny * half).toFixed(1))
        }
        return left.concat(right.reverse()).join(' ')
    }

    // A smooth centre line through points [{ x, y }] (Catmull-Rom spline), with a
    // width for each point: [{ x, y, w }].
    function spline(points, widths, steps) {
        var path = []
        for (var i = 0; i < points.length - 1; i++) {
            var p0 = points[Math.max(0, i - 1)]
            var p1 = points[i]
            var p2 = points[i + 1]
            var p3 = points[Math.min(points.length - 1, i + 2)]
            for (var k = 0; k < steps; k++) {
                var t = k / steps
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
        return path
    }

    // Points both ends: the width eases to nothing over `tail` px at the start
    // and `head` px at the end (less, if the line is short).
    function taper(path, tail, head) {
        var total = 0
        path[0].s = 0
        for (var j = 1; j < path.length; j++) {
            total += Math.hypot(path[j].x - path[j - 1].x, path[j].y - path[j - 1].y)
            path[j].s = total
        }
        var tailLen = Math.max(1, Math.min(tail, total * 0.5))
        var headLen = Math.max(1, Math.min(head, total * 0.5))
        path.forEach(function (p) {
            p.w = Math.max(0.6, p.w * smoothstep(p.s / tailLen) * smoothstep((total - p.s) / headLen))
        })
        return path
    }

    var count = 0

    // Adds one stroke to an <svg>; returns { set(path), clear() }.
    function create(svg) {
        var id = 'hg-soft-' + count++
        var filter = el('filter', { id: id, x: '-60%', y: '-60%', width: '220%', height: '220%' })
        filter.appendChild(el('feGaussianBlur', { stdDeviation: STYLE.blur }))
        var defs = el('defs')
        defs.appendChild(filter)

        var shadow = el('polygon', { fill: 'rgba(0,0,0,' + STYLE.shadowAlpha + ')', filter: 'url(#' + id + ')' })
        var body = el('polygon', { fill: STYLE.color })
        svg.append(defs, shadow, body)

        return {
            set: function (path) {
                shadow.setAttribute('points', outline(path, STYLE.shadowX, STYLE.shadowY))
                body.setAttribute('points', outline(path, 0, 0))
            },
            clear: function () {
                shadow.setAttribute('points', '')
                body.setAttribute('points', '')
            },
        }
    }

    HG.ribbon = { STYLE: STYLE, create: create, spline: spline, taper: taper, smoothstep: smoothstep }
})()
