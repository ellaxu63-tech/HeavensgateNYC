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
     * One project card: cover image + caption (title, category, year).
     * The same markup is used on the home page (floating, caption shown on
     * hover) and in the gallery (static grid, caption always shown).
     */
    HG.createProjectCard = function (project) {
        var card = document.createElement('a')
        card.className = 'project-card'
        card.href = HG.projectUrl(project)
        card.setAttribute('data-cursor', 'open')
        card.setAttribute('aria-label', project.title + ', ' + project.category + ', ' + project.year)
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
            '<span class="project-meta">' + HG.esc(project.category) + ' — ' + HG.esc(project.year) + '</span>'

        card.appendChild(cover)
        card.appendChild(caption)
        return card
    }
})()
