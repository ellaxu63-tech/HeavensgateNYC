/*
 * The photo viewer on project and event pages: a click (or tap) on a photo opens it full size over the page. Left and
 * right arrow keys, the PREV and NEXT buttons, or a swipe go through all the photos on the page; Esc, CLOSE or a click on
 * the dark area closes it and gives focus back to the photo. A photo is never shown larger than its own size.
 * The photos are the links marked data-photo (js/pages.js); without this script they just open the picture.
 */
(function () {
    'use strict'

    var HG = window.HG
    var overlay = null
    var opener = null
    var list = []
    var index = 0
    var behind = '#main, .site-header, .site-footer'

    function setBehindInert(on) {
        document.querySelectorAll(behind).forEach(function (el) {
            el.inert = on
        })
    }

    function show(next) {
        index = (next + list.length) % list.length
        var link = list[index]
        var img = overlay.querySelector('.photo-viewer-img')
        img.src = link.getAttribute('href')
        img.alt = link.getAttribute('data-alt') || ''
        overlay.querySelector('.photo-count').textContent = index + 1 + ' / ' + list.length
        // Have the neighbours ready.
        ;[index - 1, index + 1].forEach(function (i) {
            if (list.length > 1) new Image().src = list[(i + list.length) % list.length].getAttribute('href')
        })
    }

    function close() {
        if (!overlay) return
        overlay.remove()
        overlay = null
        document.documentElement.classList.remove('lightbox-open')
        setBehindInert(false)
        if (opener) opener.focus({ preventScroll: true })
        opener = null
    }

    function open(from) {
        if (overlay) return
        list = Array.prototype.slice.call(document.querySelectorAll('.project-page a[data-photo]'))
        var start = list.indexOf(from)
        if (start === -1) return
        opener = from
        overlay = document.createElement('div')
        overlay.className = 'lightbox photo-viewer'
        overlay.setAttribute('role', 'dialog')
        overlay.setAttribute('aria-modal', 'true')
        overlay.setAttribute('aria-label', 'Photo')
        overlay.innerHTML =
            '<button type="button" class="pill lightbox-close">CLOSE</button>' +
            '<figure class="lightbox-figure photo-viewer-figure">' +
                '<img class="photo-viewer-img" alt="" decoding="async">' +
                '<div class="photo-controls">' +
                    (list.length > 1 ? '<button type="button" class="pill photo-prev" aria-label="Previous photo">PREV</button>' : '') +
                    '<span class="photo-count" aria-live="polite"></span>' +
                    (list.length > 1 ? '<button type="button" class="pill photo-next" aria-label="Next photo">NEXT</button>' : '') +
                '</div>' +
            '</figure>'
        document.body.appendChild(overlay)
        document.documentElement.classList.add('lightbox-open')
        setBehindInert(true)
        show(start)
        overlay.querySelector('.lightbox-close').focus({ preventScroll: true })

        overlay.addEventListener('click', function (event) {
            if (event.target.closest('.lightbox-close')) close()
            else if (event.target.closest('.photo-prev')) show(index - 1)
            else if (event.target.closest('.photo-next')) show(index + 1)
            else if (!event.target.closest('.photo-viewer-img, .photo-controls')) close()
        })

        // A swipe on a touch screen.
        var startX = null
        overlay.addEventListener('pointerdown', function (event) {
            if (event.pointerType === 'touch') startX = event.clientX
        })
        overlay.addEventListener('pointerup', function (event) {
            if (startX === null) return
            var dx = event.clientX - startX
            startX = null
            if (Math.abs(dx) > 50 && list.length > 1) show(dx < 0 ? index + 1 : index - 1)
        })
    }

    document.addEventListener('click', function (event) {
        var link = event.target.closest && event.target.closest('a[data-photo]')
        if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey) return
        event.preventDefault()
        open(link)
    })

    document.addEventListener('keydown', function (event) {
        if (!overlay) return
        if (event.key === 'Escape') close()
        else if (event.key === 'ArrowRight' && list.length > 1) show(index + 1)
        else if (event.key === 'ArrowLeft' && list.length > 1) show(index - 1)
    })
})()
