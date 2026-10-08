/*
 * Shared page chrome, built once for every page so the navigation lives in a
 * single place (js/data.js): header (wordmark, link pills, MENU), the
 * full-screen menu and the footer. On the home page the footer is a fixed bar
 * holding the ABOUT / SHOWS links and the PAUSE / RESUME button.
 *
 * Also: when a project is hovered / focused on the home page, the navigation
 * fades out and becomes inert (this replaces the old "nav collapse" override).
 */
(function () {
    'use strict'

    var HG = window.HG
    var data = HG.data
    var esc = HG.esc
    var page = document.body.getAttribute('data-page') || ''
    var isHome = page === 'home'

    function currentFile() {
        var file = location.pathname.split('/').pop()
        return file || 'index.html'
    }

    function isCurrent(href) {
        return href.split(/[?#]/)[0] === currentFile()
    }

    function linkAttrs(item) {
        return 'href="' + esc(item.href) + '"' + (isCurrent(item.href) ? ' aria-current="page"' : '')
    }

    function pillLinks(items, className) {
        return items
            .map(function (item) {
                return '<a class="pill ' + (className || '') + '" ' + linkAttrs(item) + '>' + esc(item.label) + '</a>'
            })
            .join('')
    }

    // ---------------------------------------------------------------- header
    function buildHeader() {
        var header = document.createElement('header')
        header.className = 'site-header'
        header.innerHTML =
            '<a class="brand" href="index.html">' +
                '<img class="brand-logo" src="assets/logo.png" width="64" height="64" alt="">' +
                '<span class="brand-name">' + esc(data.siteName) + '</span>' +
            '</a>' +
            '<div class="site-nav" data-nav-collapse>' +
                '<nav class="pill-links" aria-label="Press and events">' + pillLinks(data.headerPills) + '</nav>' +
                '<button type="button" class="pill pill--accent menu-toggle" aria-expanded="false" aria-controls="menu-overlay">MENU</button>' +
            '</div>'
        return header
    }

    // ------------------------------------------------------------- menu
    function buildMenu() {
        var menu = document.createElement('nav')
        menu.id = 'menu-overlay'
        menu.className = 'menu-overlay'
        menu.setAttribute('aria-label', 'Main menu')
        menu.innerHTML =
            '<ol class="menu-list">' +
                data.nav
                    .map(function (item, i) {
                        var number = String(i + 1).padStart(2, '0')
                        return (
                            '<li><a class="menu-item" ' + linkAttrs(item) + '>' +
                                '<span class="menu-item-left">' +
                                    '<span class="menu-num">' + number + '</span>' +
                                    '<span class="menu-label">' + esc(item.label) + '</span>' +
                                '</span>' +
                                '<span class="menu-arrow" aria-hidden="true">↗</span>' +
                            '</a></li>'
                        )
                    })
                    .join('') +
            '</ol>' +
            '<div class="menu-secondary">' + pillLinks(data.secondary) + '</div>'
        return menu
    }

    function initMenu(toggle, menu) {
        var inertTargets = function () {
            return Array.prototype.slice.call(document.querySelectorAll('#main, .site-footer'))
        }

        function setOpen(open, returnFocus) {
            menu.classList.toggle('is-open', open)
            toggle.setAttribute('aria-expanded', String(open))
            toggle.textContent = open ? 'CLOSE' : 'MENU'
            document.documentElement.classList.toggle('menu-open', open)
            inertTargets().forEach(function (el) {
                el.inert = open
            })
            if (open) {
                var first = menu.querySelector('a')
                if (first) first.focus({ preventScroll: true })
            } else if (returnFocus) {
                toggle.focus({ preventScroll: true })
            }
        }

        toggle.addEventListener('click', function () {
            setOpen(!menu.classList.contains('is-open'), false)
        })
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false, true)
        })
        // Linking to the page you're already on should just close the menu.
        menu.addEventListener('click', function (event) {
            var link = event.target.closest && event.target.closest('a')
            if (link && isCurrent(link.getAttribute('href'))) {
                event.preventDefault()
                setOpen(false, true)
            }
        })
        // Coming back via the browser's back button must not show an open menu.
        window.addEventListener('pageshow', function (event) {
            if (event.persisted) setOpen(false, false)
        })
    }

    // ----------------------------------------------------------- footer
    // Home: a fixed bar with ABOUT / SHOWS on the left and PAUSE / RESUME on
    // the right. Other pages: copyright on the left, links on the right.
    function buildFooter() {
        var footer = document.createElement('footer')
        if (isHome) {
            footer.className = 'site-footer site-footer--fixed'
            footer.innerHTML =
                '<nav class="footer-links" aria-label="About and shows" data-nav-collapse>' +
                    pillLinks(data.secondary) +
                '</nav>' +
                '<button type="button" class="pill motion-toggle" id="motion-toggle" aria-pressed="false" aria-label="Pause motion" data-nav-collapse>PAUSE</button>'
        } else {
            footer.className = 'site-footer'
            footer.innerHTML =
                '<span class="footer-copy">© ' + new Date().getFullYear() + ' ' + esc(data.siteName) + '</span>' +
                '<nav class="footer-links" aria-label="Footer">' +
                    pillLinks(data.secondary) +
                    '<a class="pill" href="mailto:' + esc(data.contactEmail) + '">' + esc(data.contactEmail) + '</a>' +
                '</nav>'
        }
        return footer
    }

    function initMotionToggle(button) {
        button.addEventListener('click', function () {
            HG.motion.set({ paused: !HG.motion.get().paused })
        })
        HG.motion.subscribe(function (state) {
            button.setAttribute('aria-pressed', String(state.paused))
            button.setAttribute('aria-label', state.paused ? 'Resume motion' : 'Pause motion')
            button.textContent = state.paused ? 'RESUME' : 'PAUSE'
        })
    }

    // ------------------------------------------- nav fades while a project is active
    function initNavCollapse() {
        var root = document.documentElement
        HG.motion.subscribe(function (state) {
            root.classList.toggle('project-selected', state.projectActive)
            document.querySelectorAll('[data-nav-collapse]').forEach(function (el) {
                el.inert = state.projectActive
                if (state.projectActive) el.setAttribute('aria-hidden', 'true')
                else el.removeAttribute('aria-hidden')
            })
        })
    }

    // Intro sentence (js/data.js) wherever a page has a [data-intro] slot.
    function fillIntro() {
        document.querySelectorAll('[data-intro]').forEach(function (el) {
            el.innerHTML = HG.boldText(data.intro)
        })
    }

    // -------------------------------------------------------------- init
    fillIntro()

    var skip = document.createElement('a')
    skip.className = 'skip-link'
    skip.href = '#main'
    skip.textContent = 'Skip to content'

    var header = buildHeader()
    var menu = buildMenu()
    document.body.prepend(skip, header, menu)
    initMenu(header.querySelector('.menu-toggle'), menu)

    document.body.appendChild(buildFooter())
    if (isHome) initMotionToggle(document.getElementById('motion-toggle'))
    initNavCollapse()
    HG.capsBrand(document.body)
})()
