/*
 * Renderers for the content pages. Each runs only on its own page, chosen by
 * <body data-page="...">. All content comes from js/data.js.
 */
(function () {
    'use strict'

    var HG = window.HG
    var data = HG.data
    var esc = HG.esc
    var page = document.body.getAttribute('data-page')
    var main = document.getElementById('main')
    if (!main) return

    // ------------------------------------------------------------- gallery
    function renderGallery() {
        var grid = main.querySelector('.gallery-grid')
        data.projects.forEach(function (project) {
            grid.appendChild(HG.createProjectCard(project))
        })
    }

    // ------------------------------------------------------ project detail
    function renderProject() {
        var slug = new URLSearchParams(location.search).get('slug')
        var index = data.projects.findIndex(function (p) {
            return p.slug === slug
        })
        var holder = main.querySelector('.project-page')

        if (index === -1) {
            document.title = 'Project not found — ' + data.siteName
            holder.innerHTML =
                '<h1 class="page-title">Project not found</h1>' +
                '<p class="page-lede"><a class="text-link" href="gallery.html">Back to the gallery</a></p>'
            return
        }

        var project = data.projects[index]
        var prev = data.projects[(index - 1 + data.projects.length) % data.projects.length]
        var next = data.projects[(index + 1) % data.projects.length]
        document.title = project.title + ' — ' + data.siteName

        var images = project.images && project.images.length ? project.images : [project.image]
        var bio = String(project.summary)
            .split(/\n\s*\n/)
            .map(function (paragraph) {
                return '<p class="page-lede">' + HG.linkHandles(paragraph.trim()) + '</p>'
            })
            .join('')
        var credits = (project.credits || [])
            .map(function (credit) {
                return (
                    '<div class="credit">' +
                        '<dt>' + esc(credit.role) + '</dt>' +
                        '<dd>' + credit.names.map(function (name) { return '<span>' + HG.linkHandles(name) + '</span>' }).join('') + '</dd>' +
                    '</div>'
                )
            })
            .join('')

        holder.innerHTML =
            '<a class="back-link" href="gallery.html">← Gallery</a>' +
            '<div class="project-layout">' +
                '<div class="project-images">' +
                    images
                        .map(function (item, i) {
                            var src = typeof item === 'string' ? item : item.src
                            var alt = (typeof item === 'string' ? '' : item.alt) || project.title
                            return (
                                '<img class="project-hero" src="' + esc(src) + '" alt="' + esc(alt) + '"' +
                                (i > 0 ? ' loading="lazy"' : '') + ' decoding="async">'
                            )
                        })
                        .join('') +
                '</div>' +
                '<div class="project-info">' +
                    '<p class="eyebrow">' + esc(HG.projectMeta(project)) + '</p>' +
                    '<h1 class="page-title">' + esc(project.title) + '</h1>' +
                    bio +
                    (credits ? '<dl class="credits">' + credits + '</dl>' : '') +
                '</div>' +
            '</div>' +
            '<nav class="project-pager" aria-label="More projects">' +
                '<a href="' + esc(HG.projectUrl(prev)) + '" data-cursor="open"><span>Previous</span>' + esc(prev.title) + '</a>' +
                '<a href="' + esc(HG.projectUrl(next)) + '" data-cursor="open"><span>Next</span>' + esc(next.title) + '</a>' +
            '</nav>'
    }

    // --------------------------------------------------------------- press
    function renderPress() {
        main.querySelector('.press-list').innerHTML = data.press
            .map(function (item) {
                var tag = item.href ? 'a' : 'div'
                var href = item.href ? ' href="' + esc(item.href) + '"' : ''
                return (
                    '<' + tag + ' class="press-item"' + href + '>' +
                        '<span class="press-item-title">' + esc(item.title) + '</span>' +
                        '<span class="press-item-pub">' + esc(item.pub) + '</span>' +
                        '<span class="press-item-right">' +
                            '<span class="press-item-date">' + esc(item.date) + '</span>' +
                            (item.href ? '<span class="press-item-arrow" aria-hidden="true">↗</span>' : '') +
                        '</span>' +
                    '</' + tag + '>'
                )
            })
            .join('')
    }

    // ------------------------------------------------------ events / shows
    function renderEvents(filter) {
        var list = data.events.filter(filter || function () { return true })
        main.querySelector('.events-grid').innerHTML = list
            .map(function (ev) {
                var tag = ev.href ? 'a' : 'article'
                var href = ev.href ? ' href="' + esc(ev.href) + '"' : ''
                return (
                    '<' + tag + ' class="events-card"' + href + '>' +
                        '<span class="events-card-tag' + (ev.tag === 'Upcoming' ? ' upcoming' : '') + '">' + esc(ev.tag) + '</span>' +
                        '<span class="events-card-date">' + esc(ev.date) + '</span>' +
                        '<h2 class="events-card-title">' + esc(ev.title) + '</h2>' +
                        '<div class="events-card-meta"><span>' + esc(ev.location) + '</span><span>' + esc(ev.type) + '</span></div>' +
                        (ev.href ? '<span class="events-card-arrow" aria-hidden="true">↗</span>' : '') +
                    '</' + tag + '>'
                )
            })
            .join('')
    }

    // ---------------------------------------------------------- email links
    function fillContactEmail() {
        main.querySelectorAll('[data-contact-email]').forEach(function (a) {
            a.href = 'mailto:' + data.contactEmail
            a.textContent = data.contactEmail
        })
    }

    switch (page) {
        case 'gallery':
            renderGallery()
            break
        case 'project':
            renderProject()
            break
        case 'press':
            renderPress()
            break
        case 'events':
            renderEvents()
            break
        case 'shows':
            renderEvents(function (ev) {
                return ev.type === 'Show'
            })
            break
        case 'connect':
            fillContactEmail()
            break
    }

    // Content was just rendered: keep the name in capitals there too.
    HG.capsBrand(main)
})()
