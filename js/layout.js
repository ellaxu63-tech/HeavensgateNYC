/*
 * Shared page chrome, built once for every page so the navigation lives in a
 * single place (js/data.js): header (wordmark, link pills, MENU), the
 * full-screen menu and the footer. On the home page the footer is a fixed bar
 * holding the ABOUT / SHOWS links, the PAUSE / RESUME button and the Instagram icon.
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

    // ABOUT / SHOWS, plus APPLY and MAILING LIST once those are connected (js/data.js).
    var secondary = data.secondary.concat(
        HG.formsOn() ? [{ label: data.form.label || 'APPLY', href: 'apply.html', className: 'pill--extra' }] : [],
        HG.mailingListOn() ? [{ label: 'MAILING LIST', href: 'connect.html#list', className: 'pill--extra pill--list' }] : []
    )

    function currentFile() {
        var file = location.pathname.split('/').pop()
        return file || 'index.html'
    }

    function isCurrent(href) {
        return href.split(/[?#]/)[0] === currentFile()
    }

    function linkAttrs(item) {
        // A link to a spot on a page (connect.html#list) is not "the page you are on".
        return 'href="' + esc(item.href) + '"' + (isCurrent(item.href) && item.href.indexOf('#') === -1 ? ' aria-current="page"' : '')
    }

    function pillLinks(items, className) {
        return items
            .map(function (item) {
                return '<a class="pill ' + (className || '') + (item.className ? ' ' + item.className : '') + '" ' + linkAttrs(item) + '>' + esc(item.label) + '</a>'
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
            '<div class="menu-secondary">' + pillLinks(secondary) + '</div>'
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
        // Linking to the page you're already on should just close the menu
        // (and, for a link to a spot on it, scroll there).
        menu.addEventListener('click', function (event) {
            var link = event.target.closest && event.target.closest('a')
            if (link && isCurrent(link.getAttribute('href'))) {
                event.preventDefault()
                setOpen(false, true)
                var spot = link.hash && document.getElementById(link.hash.slice(1))
                if (spot) spot.scrollIntoView()
            }
        })
        // Coming back via the browser's back button must not show an open menu.
        window.addEventListener('pageshow', function (event) {
            if (event.persisted) setOpen(false, false)
        })
    }

    // The Instagram icon, last in the footer on every page (opens in a new tab).
    function instagramLink(collapse) {
        return (
            '<a class="pill pill--icon" href="' + esc(data.instagramUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="HEAVENSGATE NYC on Instagram"' + (collapse ? ' data-nav-collapse' : '') + '>' +
                '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7">' +
                    '<rect x="3" y="3" width="18" height="18" rx="5"/>' +
                    '<circle cx="12" cy="12" r="4.2"/>' +
                    '<circle cx="17.3" cy="6.7" r="1.05" fill="currentColor" stroke="none"/>' +
                '</svg>' +
            '</a>'
        )
    }

    // ----------------------------------------------------------- footer
    // Home: a fixed bar with ABOUT / SHOWS on the left and PAUSE / RESUME on
    // the right. Other pages: copyright on the left, links on the right.
    function buildFooter() {
        var footer = document.createElement('footer')
        if (isHome) {
            footer.className = 'site-footer site-footer--fixed' + (HG.mailingListOn() ? ' site-footer--list' : '')
            footer.innerHTML =
                '<nav class="footer-links" aria-label="About and shows" data-nav-collapse>' +
                    pillLinks(secondary) +
                '</nav>' +
                '<div class="footer-right">' +
                    '<button type="button" class="pill motion-toggle" id="motion-toggle" aria-pressed="false" aria-label="Pause motion" data-nav-collapse>PAUSE</button>' +
                    instagramLink(true) +
                '</div>'
        } else {
            footer.className = 'site-footer'
            footer.innerHTML =
                '<span class="footer-copy">© ' + new Date().getFullYear() + ' ' + esc(data.siteName) + '</span>' +
                '<nav class="footer-links" aria-label="Footer">' +
                    pillLinks(secondary) +
                    '<a class="pill" href="mailto:' + esc(data.contactEmail) + '">' + esc(data.contactEmail) + '</a>' +
                    instagramLink(false) +
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
            // data-intro="short" is the short line on the home page; plain data-intro is the full sentence.
            el.innerHTML = HG.boldText(el.getAttribute('data-intro') === 'short' ? data.introShort : data.intro)
        })
    }

    // ---------------------------------------------------- the JOIN THE LIST popup
    // A small card over the dimmed page with the mailing list sign-up. It opens from the MAILING
    // LIST links and, once, by itself on the home page (js/data.js: popupDelay, popupDays, or a link ending in #join). Not on Connect, which
    // already shows the sign-up. It is built before Sender's script loads, so the script finds the form's place.
    function initListPopup() {
        var cfg = data.newsletter
        if (page === 'connect' || !HG.mailingListOn() || !(cfg.embed || cfg.link || cfg.senderForm)) return

        var root = document.documentElement
        var popup = document.createElement('div')
        popup.className = 'list-popup'
        popup.setAttribute('role', 'dialog')
        popup.setAttribute('aria-modal', 'true')
        popup.setAttribute('aria-labelledby', 'list-popup-title')
        popup.inert = true
        popup.innerHTML =
            '<div class="list-popup-card">' +
                '<div class="list-popup-top">' +
                    '<h2 class="list-popup-title" id="list-popup-title">Mailing list</h2>' +
                    '<button type="button" class="pill pill--accent list-popup-close">CLOSE</button>' +
                '</div>' +
                '<div class="list-embed"></div>' +
                (cfg.consent ? '<p class="list-consent">' + esc(cfg.consent) + '</p>' : '') +
                '<button type="button" class="list-popup-skip">No thanks</button>' +
            '</div>'
        document.body.appendChild(popup)
        HG.mountMailingList(popup.querySelector('.list-embed'))

        var closeButton = popup.querySelector('.list-popup-close')
        var storeKey = 'hg-list-popup'
        var lastFocus = null
        var timer = null

        function isOpen() {
            return popup.classList.contains('is-open')
        }
        function backgrounds() {
            return Array.prototype.slice.call(document.querySelectorAll('#main, .site-header, .site-footer, .menu-overlay'))
        }
        // Remember that it was shown, so it does not come back by itself: for the rest of this visit (this tab),
        // and, if popupDays is above 0, for that many days.
        function days() {
            return cfg.popupDays === undefined ? 0 : Number(cfg.popupDays)
        }
        function remember() {
            try {
                sessionStorage.setItem(storeKey, '1')
            } catch (e) {}
            if (days() > 0) {
                try {
                    localStorage.setItem(storeKey, String(Date.now()))
                } catch (e) {}
            }
        }
        function seenRecently() {
            try {
                if (sessionStorage.getItem(storeKey)) return true
            } catch (e) {}
            if (!(days() > 0)) return false
            try {
                var at = Number(localStorage.getItem(storeKey))
                return !!at && Date.now() - at < days() * 864e5
            } catch (e) {
                return false
            }
        }

        // When the popup comes up as the page opens, the home page's opening animation (the lines drawing, the
        // floating images, the first stroke) waits behind it and plays once it is closed.
        var held = false
        var wasPaused = false
        function holdIntro() {
            if (held || !isHome || !HG.motion) return
            held = true
            wasPaused = HG.motion.get().paused
            root.classList.add('list-hold')
            HG.motion.set({ paused: true })
        }
        function releaseIntro() {
            if (!held) return
            held = false
            root.classList.remove('list-hold')
            if (!wasPaused) HG.motion.set({ paused: false })
        }

        function open(atStart) {
            window.clearTimeout(timer)
            if (isOpen()) return
            if (atStart === true) holdIntro()
            var menuToggle = document.querySelector('.menu-toggle')
            if (root.classList.contains('menu-open') && menuToggle) menuToggle.click()
            lastFocus = document.activeElement
            remember()
            backgrounds().forEach(function (el) {
                el.inert = true
            })
            popup.inert = false
            popup.classList.add('is-open')
            root.classList.add('list-open')
            closeButton.focus({ preventScroll: true })
        }
        function close() {
            if (!isOpen()) return
            popup.classList.remove('is-open')
            popup.inert = true
            root.classList.remove('list-open')
            releaseIntro()
            backgrounds().forEach(function (el) {
                el.inert = false
            })
            if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true })
        }

        closeButton.addEventListener('click', close)
        popup.addEventListener('click', function (event) {
            if (event.target === popup) close()
        })
        popup.querySelector('.list-popup-skip').addEventListener('click', close)
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && isOpen()) close()
        })
        // The MAILING LIST pills (menu, footers) open it instead of going to Connect.
        document.addEventListener('click', function (event) {
            var link = event.target.closest && event.target.closest('a[href="connect.html#list"]')
            if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey) return
            event.preventDefault()
            open()
        })

        // By itself, on the home page, right as it opens (popupDelay 0) or after popupDelay seconds. Later on it
        // waits while someone is drawing or has the menu or a photo open.
        function later(ms) {
            timer = window.setTimeout(function () {
                var busy = ['menu-open', 'lightbox-open', 'is-dragging'].some(function (name) {
                    return root.classList.contains(name)
                })
                if (busy) later(4000)
                else open()
            }, ms)
        }
        // As soon as the page is built (the scripts are all in), so it is the first thing seen.
        function whenBuilt(fn) {
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn)
            else fn()
        }
        var delay = cfg.popupDelay === false ? -1 : cfg.popupDelay === undefined ? 0 : Number(cfg.popupDelay)
        // A link ending in #join opens it straight away on any page.
        if (location.hash === '#join') whenBuilt(function () { open(true) })
        else if (isHome && delay === 0 && !seenRecently()) whenBuilt(function () { open(true) })
        else if (isHome && delay > 0 && !seenRecently()) later(delay * 1000)
        window.addEventListener('hashchange', function () {
            if (location.hash === '#join') open()
        })
    }

    // Sender (the mailing list service): its script, exactly as Sender gives it, loads on every page
    // for its forms and tracking. The account code is in js/data.js (newsletter.senderAccount).
    function loadSender(account) {
        ;(function (s, e, n, d, er) {
            s['Sender'] = er
            ;(s[er] = s[er] || function () {
                ;(s[er].q = s[er].q || []).push(arguments)
            }),
                (s[er].l = 1 * new Date())
            s[er].on = function (event, callback) {
                s[er].listeners = s[er].listeners || {}
                ;(s[er].listeners[event] = s[er].listeners[event] || []).push(callback)
            }
            var a = e.createElement(n),
                m = e.getElementsByTagName(n)[0]
            a.async = 1
            a.src = d
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://cdn.sender.net/accounts_resources/universal.js', 'sender')
        window.sender(account)
    }

    // -------------------------------------------------------------- init
    fillIntro()
    initListPopup()
    if (data.newsletter && data.newsletter.senderAccount) loadSender(data.newsletter.senderAccount)

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
