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

    HG.projectUrl = function (project) {
        return 'project.html?slug=' + encodeURIComponent(project.slug)
    }

    /*
     * The star: an eight-pointed sparkle, traced from the reference image. Used
     * for the cursor, the sparkles in the drawing and the DRAG hint. Normalised:
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
        card.href = HG.projectUrl(project)
        card.setAttribute('data-cursor', 'open')
        card.setAttribute('aria-label', [project.title, project.category, project.year].filter(Boolean).join(', '))
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

        var caption = document.createElement('span')
        caption.className = 'project-caption'
        caption.innerHTML =
            '<span class="project-title">' + HG.esc(project.title) + '</span>' +
            '<span class="project-meta">' + HG.esc(HG.projectMeta(project)) + '</span>'

        card.appendChild(cover)
        card.appendChild(caption)
        return card
    }
})()
