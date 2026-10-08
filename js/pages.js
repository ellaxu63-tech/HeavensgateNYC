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

    // ----------------------------------------- shared by project / event pages
    // The bio: a blank line starts a new paragraph; @handles become links.
    function bioHtml(summary) {
        return String(summary || '')
            .split(/\n\s*\n/)
            .filter(function (paragraph) {
                return paragraph.trim()
            })
            .map(function (paragraph) {
                return '<p class="page-lede">' + HG.linkHandles(paragraph.trim()) + '</p>'
            })
            .join('')
    }

    // Role on the left, names on the right (@handles link to Instagram).
    function creditsHtml(credits) {
        if (!credits || !credits.length) return ''
        return (
            '<dl class="credits">' +
            credits
                .map(function (credit) {
                    return (
                        '<div class="credit">' +
                            '<dt>' + esc(credit.role) + '</dt>' +
                            '<dd>' + credit.names.map(function (name) { return '<span>' + HG.linkHandles(name) + '</span>' }).join('') + '</dd>' +
                        '</div>'
                    )
                })
                .join('') +
            '</dl>'
        )
    }

    // Each item is a path or { src, alt }. Everything after the first loads lazily.
    function imagesHtml(items, fallbackAlt) {
        return items
            .map(function (item, i) {
                var src = typeof item === 'string' ? item : item.src
                var alt = (typeof item === 'string' ? '' : item.alt) || fallbackAlt
                return (
                    '<img class="project-hero" src="' + esc(src) + '" alt="' + esc(alt) + '"' +
                    (i > 0 ? ' loading="lazy"' : '') + ' decoding="async">'
                )
            })
            .join('')
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
        var videoItems = project.videos || (project.video ? [project.video] : [])
        var videos = videoItems
            .map(function (item) {
                return HG.videoHtml(item, project.title)
            })
            .join('')
        var bio = bioHtml(project.summary)
        var credits = creditsHtml(project.credits)

        holder.innerHTML =
            '<a class="back-link" href="gallery.html">← Gallery</a>' +
            '<div class="project-layout">' +
                '<div class="project-images">' +
                    videos +
                    imagesHtml(images, project.title) +
                '</div>' +
                '<div class="project-info">' +
                    '<p class="eyebrow">' + esc(HG.projectMeta(project)) + '</p>' +
                    '<h1 class="page-title">' + esc(project.title) + '</h1>' +
                    bio +
                    credits +
                '</div>' +
            '</div>' +
            '<nav class="project-pager" aria-label="More projects">' +
                '<a href="' + esc(HG.projectUrl(prev)) + '" data-cursor="open"><span>Previous</span>' + esc(prev.title) + '</a>' +
                '<a href="' + esc(HG.projectUrl(next)) + '" data-cursor="open"><span>Next</span>' + esc(next.title) + '</a>' +
            '</nav>'

        initVideos(holder)
    }

    // Video files: take the real shape from the file, and keep clips that
    // autoplay (silently) running only while they are on screen.
    function initVideos(root) {
        var observer =
            'IntersectionObserver' in window
                ? new IntersectionObserver(
                      function (entries) {
                          entries.forEach(function (entry) {
                              if (entry.isIntersecting) entry.target.play().catch(function () {})
                              else entry.target.pause()
                          })
                      },
                      { threshold: 0.25 }
                  )
                : null
        root.querySelectorAll('.project-video video').forEach(function (video) {
            video.addEventListener('loadedmetadata', function () {
                if (video.videoWidth && video.videoHeight) {
                    video.parentNode.style.setProperty('--ratio', (video.videoWidth / video.videoHeight).toFixed(4))
                }
            })
            if (video.hasAttribute('autoplay') && observer) {
                video.pause()
                observer.observe(video)
            }
        })
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

    // --------------------------------------------------------- event detail
    function renderEvent() {
        var slug = new URLSearchParams(location.search).get('slug')
        var ev = data.events.filter(function (e) {
            return e.slug === slug
        })[0]
        var holder = main.querySelector('.project-page')

        if (!ev) {
            document.title = 'Event not found — ' + data.siteName
            holder.innerHTML =
                '<h1 class="page-title">Event not found</h1>' +
                '<p class="page-lede"><a class="text-link" href="events.html">Back to the events</a></p>'
            return
        }

        document.title = ev.title + ' — ' + data.siteName
        // An event can borrow its text from a project (the same night, shown in both places).
        var proj = ev.project
            ? data.projects.filter(function (p) {
                  return p.slug === ev.project
              })[0]
            : null
        var photosLink = proj
            ? '<p class="page-lede"><a class="text-link" href="' + esc(HG.projectUrl(proj)) + '">See the photos →</a></p>'
            : ''
        var images = ev.images && ev.images.length ? ev.images : ev.image ? [ev.image] : []
        holder.innerHTML =
            '<a class="back-link" href="events.html">← Events</a>' +
            '<div class="project-layout">' +
                '<div class="project-images">' + imagesHtml(images, ev.title) + '</div>' +
                '<div class="project-info">' +
                    '<p class="eyebrow">' + esc([ev.type, ev.date, ev.location].filter(Boolean).join(' — ')) + '</p>' +
                    '<h1 class="page-title">' + esc(ev.title) + '</h1>' +
                    bioHtml(ev.summary || (proj && proj.summary)) +
                    photosLink +
                    creditsHtml(ev.credits || (proj && proj.credits)) +
                '</div>' +
            '</div>'
    }

    // ------------------------------------------------------ events / shows
    function renderEvents(filter) {
        var list = data.events.filter(filter || function () { return true })
        main.querySelector('.events-grid').innerHTML = list
            .map(function (ev) {
                var link = ev.href || (ev.slug ? HG.eventUrl(ev) : '')
                var tag = link ? 'a' : 'article'
                var href = link ? ' href="' + esc(link) + '"' : ''
                var body =
                    '<span class="events-card-tag' + (ev.tag === 'Upcoming' ? ' upcoming' : '') + '">' + esc(ev.tag) + '</span>' +
                    '<span class="events-card-date">' + esc(ev.date) + '</span>' +
                    '<h2 class="events-card-title">' + esc(ev.title) + '</h2>' +
                    '<div class="events-card-meta"><span>' + esc(ev.location) + '</span><span>' + esc(ev.type) + '</span></div>' +
                    (link ? '<span class="events-card-arrow" aria-hidden="true">↗</span>' : '')
                if (!ev.image) return '<' + tag + ' class="events-card"' + href + '>' + body + '</' + tag + '>'
                // With a poster: the poster on the left, the text beside it.
                return (
                    '<' + tag + ' class="events-card events-card--poster"' + href + '>' +
                        '<span class="events-card-poster"><img src="' + esc(ev.image) + '" alt="" loading="lazy" decoding="async"></span>' +
                        '<span class="events-card-body">' + body + '</span>' +
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
        case 'event':
            renderEvent()
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
