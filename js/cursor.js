/*
 * Custom cursor: a small contrast dot everywhere, turning into a white OPEN
 * pill over anything marked data-cursor="open" (project cards). Only on
 * devices with a real mouse; touch devices and keyboard users are unaffected.
 *
 * The home page physics adds the class `is-dragging` to <html> while the
 * stage is being dragged, which hides the OPEN pill (see styles.css).
 */
(function () {
    'use strict'

    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    var root = document.documentElement
    var cursor = document.createElement('div')
    cursor.id = 'hg-cursor'
    cursor.setAttribute('aria-hidden', 'true')
    cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-open">OPEN</div>'
    document.body.appendChild(cursor)
    root.classList.add('cursor-enabled')

    var x = 0
    var y = 0
    var frame = null

    function place() {
        frame = null
        cursor.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'
    }

    document.addEventListener('pointermove', function (event) {
        if (event.pointerType === 'touch') {
            cursor.classList.remove('active')
            return
        }
        x = event.clientX
        y = event.clientY
        cursor.classList.add('active')
        var target = event.target
        cursor.classList.toggle(
            'project-hover',
            !!(target && target.closest && target.closest('[data-cursor="open"]'))
        )
        if (frame === null) frame = window.requestAnimationFrame(place)
    })

    root.addEventListener('mouseleave', function () {
        cursor.classList.remove('active')
    })
})()
