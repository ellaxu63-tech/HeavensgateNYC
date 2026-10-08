/*
 * The home page video (HG.data.homeVideo): clicking its floating thumbnail
 * opens the clip in a full-screen player. Esc, the CLOSE button or a click on
 * the dark area closes it and gives focus back to the thumbnail.
 */
(function () {
    'use strict'

    var HG = window.HG
    var v = HG.data && HG.data.homeVideo
    if (!v) return

    var overlay = null
    var opener = null
    var behind = '#main, .site-header, .site-footer'

    function setBehindInert(on) {
        document.querySelectorAll(behind).forEach(function (el) {
            el.inert = on
        })
    }

    function close() {
        if (!overlay) return
        var video = overlay.querySelector('video')
        if (video) video.pause()
        overlay.remove()
        overlay = null
        document.documentElement.classList.remove('lightbox-open')
        setBehindInert(false)
        if (opener) opener.focus({ preventScroll: true })
        opener = null
    }

    function open(from) {
        if (overlay) return
        opener = from
        overlay = document.createElement('div')
        overlay.className = 'lightbox'
        overlay.setAttribute('role', 'dialog')
        overlay.setAttribute('aria-modal', 'true')
        overlay.setAttribute('aria-label', v.title)
        overlay.innerHTML =
            '<button type="button" class="pill lightbox-close">CLOSE</button>' +
            '<figure class="lightbox-figure">' +
                '<div class="project-video" style="--ratio:' + (v.ratio || 0.5625) + '">' +
                    '<video src="' + HG.esc(v.src) + '" poster="' + HG.esc(v.poster) + '" controls autoplay playsinline aria-label="' + HG.esc(v.title) + '"></video>' +
                '</div>' +
                (v.caption ? '<figcaption>' + HG.esc(v.caption) + '</figcaption>' : '') +
            '</figure>'
        document.body.appendChild(overlay)
        document.documentElement.classList.add('lightbox-open')
        setBehindInert(true)

        var video = overlay.querySelector('video')
        // Use the file's real shape, and ignore a browser that blocks sound-on autoplay.
        video.addEventListener('loadedmetadata', function () {
            if (video.videoWidth && video.videoHeight) {
                video.parentNode.style.setProperty('--ratio', (video.videoWidth / video.videoHeight).toFixed(4))
            }
        })
        var started = video.play()
        if (started && started.catch) started.catch(function () {})
        overlay.querySelector('.lightbox-close').focus({ preventScroll: true })

        overlay.addEventListener('click', function (event) {
            if (event.target === overlay || event.target.classList.contains('lightbox-figure')) close()
            else if (event.target.closest('.lightbox-close')) close()
        })
    }

    document.addEventListener('click', function (event) {
        var card = event.target.closest && event.target.closest('[data-video]')
        if (!card) return
        event.preventDefault()
        open(card)
    })
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') close()
    })
})()
