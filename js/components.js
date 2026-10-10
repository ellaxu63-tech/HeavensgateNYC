/*
 * Small shared builders used by more than one page.
 */
(function () {
    'use strict'

    var HG = (window.HG = window.HG || {})

    HG.esc = function (value) {
        return String(value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
        })
    }

    HG.isEmail = function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
    }

    /*
     * Sends `fields` ({ name: value }) to a form address (the mailing list and
     * the application form both use this). The reply of another site can't be
     * read, so any answer counts as sent; only a network failure rejects.
     * The address `preview` sends nothing: it lets you try a form before it is
     * connected (the promise says { preview: true }).
     */
    HG.post = function (action, fields) {
        if (action === 'preview') {
            return new Promise(function (resolve) {
                window.setTimeout(function () {
                    resolve({ preview: true })
                }, 600)
            })
        }
        var body = new URLSearchParams()
        Object.keys(fields).forEach(function (name) {
            body.set(name, fields[name])
        })
        return fetch(action, { method: 'POST', mode: 'no-cors', body: body }).then(function () {
            return { preview: false }
        })
    }

    HG.projectUrl = function (project) {
        return 'project.html?slug=' + encodeURIComponent(project.slug)
    }

    /*
     * The star: an eight-pointed sparkle, traced from the reference image. Used
     * for the cursor. Normalised:
     * the points are 1 unit from the centre (0,0), so draw it in a
     * viewBox="-1 -1 2 2".
     */
    HG.STAR_PATH = 'M1 0 L0.129 0.054 L0.707 0.707 L0.054 0.129 L0 1 L-0.054 0.129 L-0.707 0.707 L-0.129 0.054 L-1 0 L-0.129 -0.054 L-0.707 -0.707 L-0.054 -0.129 L0 -1 L0.054 -0.129 L0.707 -0.707 L0.129 -0.054 Z'

    HG.starSvg = function (className) {
        return (
            '<svg class="' + (className || 'star') + '" viewBox="-1 -1 2 2" aria-hidden="true" focusable="false">' +
                '<path d="' + HG.STAR_PATH + '"/>' +
            '</svg>'
        )
    }

    HG.eventUrl = function (event) {
        return 'event.html?slug=' + encodeURIComponent(event.slug)
    }

    /*
     * Everything that floats on the home page: the projects, plus every poster
     * (image) of the events that have a page, each linking to its event. The
     * items are project-shaped (slug, title, image, ratio) with an optional
     * `href` and `meta` line. An event image can have a `label` (its caption,
     * e.g. a designer's name) and a `thumb` (a small version, used here).
     */
    HG.homeCards = function () {
        var cards = HG.data.projects.slice()
        var v = HG.data.homeVideo
        // The video goes first, so it gets a good spot.
        if (v) {
            cards.unshift({
                slug: 'home-video',
                title: v.title,
                meta: v.meta,
                image: v.poster,
                ratio: v.ratio || 0.5625,
                href: '#',
                homeVideo: true, // the card that opens the home video player (not just a project that has a video)
            })
        }
        // Photos of a project marked `home: 'left' | 'right'` float too, beside the sentence, and link to the project.
        HG.data.projects.forEach(function (project) {
            ;(project.images || []).forEach(function (img, i) {
                if (!img || typeof img === 'string' || !img.home) return
                cards.push({
                    slug: 'photo-' + project.slug + '-' + (i + 1),
                    title: project.title,
                    meta: HG.projectMeta(project),
                    image: img.thumb || img.src,
                    ratio: img.ratio || 0.75,
                    href: HG.projectUrl(project),
                    side: img.home,
                })
            })
        })
        HG.data.events.forEach(function (ev) {
            var list = ev.images || (ev.image ? [ev.image] : null)
            if (!ev.slug || !list) return
            list.forEach(function (item, i) {
                var img = typeof item === 'string' ? { src: item } : item
                cards.push({
                    slug: 'event-' + ev.slug + '-' + (i + 1),
                    title: img.label || ev.title,
                    meta: img.label ? ev.title : [ev.type, ev.date].filter(Boolean).join(' — '),
                    image: img.thumb || img.src,
                    ratio: img.ratio || 0.8,
                    href: HG.eventUrl(ev),
                })
            })
        })
        return cards
    }

    // "Category — Year"; the year is optional.
    HG.projectMeta = function (project) {
        return [project.category, project.year].filter(Boolean).join(' — ')
    }

    /*
     * The name is always written in capitals, even inside the lowercase serif
     * text: wraps every "HEAVENSGATE" / "HEAVENSGATE NYC" under `root` in
     * <span class="caps"> (see styles.css). "@heavensgatenyc" handles are left
     * alone. Safe to run again on the same content.
     */
    HG.capsBrand = function (root) {
        var pattern = /(^|[^@\w])(heavensgate(?:\s+nyc)?)(?!\w)/gi
        var skip = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1 }
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                var parent = node.parentNode
                if (!parent || skip[parent.nodeName] || (parent.classList && parent.classList.contains('caps'))) {
                    return NodeFilter.FILTER_REJECT
                }
                return /heavensgate/i.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
            },
        })
        var nodes = []
        while (walker.nextNode()) nodes.push(walker.currentNode)

        nodes.forEach(function (node) {
            var text = node.nodeValue
            var fragment = document.createDocumentFragment()
            var last = 0
            var found = false
            text.replace(pattern, function (match, before, name, offset) {
                var start = offset + before.length
                if (start > last) fragment.appendChild(document.createTextNode(text.slice(last, start)))
                var span = document.createElement('span')
                span.className = 'caps'
                span.textContent = name
                fragment.appendChild(span)
                last = start + name.length
                found = true
                return match
            })
            if (!found) return
            if (last < text.length) fragment.appendChild(document.createTextNode(text.slice(last)))
            node.parentNode.replaceChild(fragment, node)
        })
    }

    /*
     * A video for a project page. `item` is a path to a video file (mp4 / webm /
     * mov), a YouTube or Vimeo link, or an object:
     *   { src, poster, ratio, autoplay, title }
     * `ratio` is width ÷ height (default 16:9; 9:16 for YouTube Shorts). For
     * files it is corrected from the video itself once it loads. `autoplay`
     * plays the clip silently on a loop while it is on screen (the viewer can
     * still unmute and use the controls).
     */
    HG.videoHtml = function (item, projectTitle) {
        var v = typeof item === 'string' ? { src: item } : item || {}
        var src = String(v.src || '')
        var label = HG.esc(v.title || projectTitle + ' (video)')
        var youtube = src.match(/(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
        var vimeo = src.match(/vimeo\.com\/(?:video\/)?(\d+)/)
        var vertical = /youtube\.com\/shorts\//.test(src)
        var ratio = Number(v.ratio) || (vertical ? 9 / 16 : 16 / 9)
        var box = '<div class="project-video" style="--ratio:' + ratio.toFixed(4) + '">'

        if (youtube || vimeo) {
            var url = youtube
                ? 'https://www.youtube-nocookie.com/embed/' + youtube[1] + '?rel=0'
                : 'https://player.vimeo.com/video/' + vimeo[1]
            // A big title that links to the video on its own site, always under the player. If the player can't
            // be shown (YouTube can't be reached, see HG.checkEmbeds) the title is all that is left.
            var watch = youtube ? 'https://www.youtube.com/watch?v=' + youtube[1] : 'https://vimeo.com/' + vimeo[1]
            var site = youtube ? 'YouTube' : 'Vimeo'
            return (
                '<div class="video-embed" style="--ratio:' + ratio.toFixed(4) + '"' +
                (youtube ? ' data-probe="https://i.ytimg.com/vi/' + youtube[1] + '/default.jpg"' : '') + '>' +
                box +
                '<iframe src="' + url + '" title="' + label + '" loading="lazy" allowfullscreen ' +
                'allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe>' +
                '</div>' +
                '<a class="video-link" href="' + HG.esc(watch) + '" target="_blank" rel="noopener noreferrer">' +
                '<span class="video-link-title">' + HG.esc(v.title || projectTitle) + '</span>' +
                '<span class="video-link-note">Watch on ' + site + ' \u2197</span>' +
                '</a></div>'
            )
        }
        return (
            box +
            '<video src="' + HG.esc(src) + '" controls playsinline preload="metadata" aria-label="' + label + '"' +
            (v.poster ? ' poster="' + HG.esc(v.poster) + '"' : '') +
            (v.autoplay ? ' autoplay muted loop' : '') +
            '></video></div>'
        )
    }

    // A YouTube player can't tell us when it is blocked, so check that YouTube can be reached at all (the
    // video's own thumbnail loads). If not, the player is hidden and only the big title link is left.
    HG.checkEmbeds = function (root) {
        root.querySelectorAll('.video-embed[data-probe]').forEach(function (box) {
            var probe = new Image()
            probe.onerror = function () {
                box.classList.add('is-blocked')
            }
            probe.src = box.getAttribute('data-probe')
        })
    }

    // Text with **bold** parts: escaped first, then **x** becomes <strong>x</strong>.
    HG.boldText = function (text) {
        return HG.esc(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    }

    // Turns every @handle in a (plain) string into an Instagram link.
    HG.linkHandles = function (text) {
        return HG.esc(text).replace(/@([A-Za-z0-9._]*[A-Za-z0-9_])/g, function (match, handle) {
            // The name is always shown in capitals, handles included (they aren't case-sensitive).
            var caps = /^heavensgate/i.test(handle) ? ' class="caps"' : ''
            return '<a' + caps + ' href="https://www.instagram.com/' + handle + '/" target="_blank" rel="noopener">' + match + '</a>'
        })
    }

    /*
     * One project card: cover image + caption (title, category, year).
     * The same markup is used on the home page (floating, caption shown on
     * hover) and in the gallery (static grid, caption always shown).
     */
    HG.createProjectCard = function (project) {
        var card = document.createElement('a')
        card.className = 'project-card'
        card.href = project.href || HG.projectUrl(project)
        card.setAttribute('data-cursor', project.homeVideo ? 'play' : 'open')
        if (project.homeVideo) {
            card.setAttribute('data-video', '')
            card.setAttribute('role', 'button')
        }
        card.setAttribute('aria-label', (project.homeVideo ? 'Play video: ' : '') + (project.meta ? project.title + ', ' + project.meta : [project.title, project.category, project.year].filter(Boolean).join(', ')))
        card.draggable = false

        var cover = document.createElement('span')
        cover.className = 'project-cover'
        cover.style.aspectRatio = String(project.ratio || 1)

        var img = document.createElement('img')
        img.src = project.image
        img.alt = ''
        img.draggable = false
        img.decoding = 'async'
        cover.appendChild(img)
        // A play badge on anything with a video; only the home video card plays it right here.
        if (project.homeVideo || project.video || project.videos) cover.insertAdjacentHTML('beforeend', '<span class="project-play" aria-hidden="true"></span>')

        var caption = document.createElement('span')
        caption.className = 'project-caption'
        caption.innerHTML =
            '<span class="project-title">' + HG.esc(project.title) + '</span>' +
            '<span class="project-meta">' + HG.esc(project.meta || HG.projectMeta(project)) + '</span>'

        card.appendChild(cover)
        card.appendChild(caption)
        return card
    }
})()
