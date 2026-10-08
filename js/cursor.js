/*
 * Custom cursor: a star (the one in the reference, see HG.STAR_PATH) that
 * inverts against whatever is under it, turning into a white OPEN pill over
 * anything marked data-cursor="open" (project cards; "play" for the video). On the home page the star
 * slowly spins over the stage with a tiny DRAG TO DRAW label beside it, to say
 * "you can draw here". Only on devices with a real mouse; touch devices and
 * keyboard users are unaffected.
 *
 * The home page physics adds the class `is-dragging` to <html> while the
 * stage is being dragged: the star grows and spins faster, the label goes away
 * and the OPEN pill is hidden (see styles.css).
 */
(function () {
    'use strict'

    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    var HG = window.HG
    var root = document.documentElement
    var cursor = document.createElement('div')
    cursor.id = 'hg-cursor'
    cursor.setAttribute('aria-hidden', 'true')
    cursor.innerHTML =
        '<div class="cursor-star">' + HG.starSvg('star') + '</div>' +
        '<div class="cursor-label">DRAG TO DRAW</div>' +
        '<div class="cursor-open">OPEN</div>'
    document.body.appendChild(cursor)
    root.classList.add('cursor-enabled')

    var openLabel = cursor.querySelector('.cursor-open')
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
        var marked = target && target.closest ? target.closest('[data-cursor]') : null
        var overProject = !!marked
        // OPEN over a project, PLAY over the video.
        if (marked) {
            var word = (marked.getAttribute('data-cursor') || 'open').toUpperCase()
            if (openLabel.textContent !== word) openLabel.textContent = word
        }
        cursor.classList.toggle('project-hover', overProject)
        cursor.classList.toggle('over-stage', !overProject && !!(target && target.closest && target.closest('.stage')))
        // Near the right edge the little label goes on the left of the star.
        cursor.classList.toggle('label-left', x > window.innerWidth - 120)
        if (frame === null) frame = window.requestAnimationFrame(place)
    })

    root.addEventListener('mouseleave', function () {
        cursor.classList.remove('active')
    })
})()
