/*
 * The forms (js/data.js, form): apply.html lists them, and each one runs on its own page
 * (designers.html, crew.html) or at apply.html?form=<id>. A form is an intro, then one question per
 * screen, then a thank-you. Answers are sent with HG.post to the address set in js/data.js (a Google
 * Sheet, see the README), with the form's id so each form gets its own tab. A form with a `link`
 * opens that page (a Google Form) instead.
 *
 * Keys: Enter moves on (Shift + Enter is a new line in a long answer), a letter picks that choice
 * (or that form, in the list). On touch screens Enter just types, so the OK button does it.
 */
(function () {
    'use strict'

    var HG = window.HG
    var data = HG.data
    var esc = HG.esc
    var root = data.form
    var forms = (root && root.forms) || []
    var frame = document.querySelector('[data-apply]')
    var bar = document.querySelector('.apply-bar')
    var trap = document.getElementById('apply-trap')
    if (!frame) return

    function mailLink() {
        return '<a class="text-link" href="mailto:' + esc(data.contactEmail) + '">' + esc(data.contactEmail) + '</a>'
    }

    // A form is open once it has a link of its own or the sheet address is set.
    function isOpen(f) {
        return !!(f.link || (root && root.action))
    }

    // Which form this page is for: the page says so (data-form), or ?form=crew; otherwise the list.
    var wanted = document.body.getAttribute('data-form') || new URLSearchParams(location.search).get('form') || ''
    var picked = forms.filter(function (f) {
        return f.id === wanted
    })[0]
    var openForms = forms.filter(isOpen)
    var cfg = picked || (openForms.length === 1 ? openForms[0] : null)

    // Not connected yet: say so instead of showing a form that goes nowhere.
    if (!openForms.length || (picked && !isOpen(picked))) {
        frame.innerHTML =
            '<div class="apply-step">' +
                '<div class="apply-q"><h1 class="apply-title">Not open yet.</h1></div>' +
                '<div class="apply-a"><p class="apply-text">This form is not open right now. Write to us at ' + mailLink() + '.</p></div>' +
            '</div>'
        HG.capsBrand(frame)
        return
    }

    // No form picked: a short list to choose from. A letter picks one.
    if (!cfg) {
        frame.innerHTML =
            '<div class="apply-step">' +
                '<div class="apply-q">' +
                    '<p class="eyebrow">' + esc(root.eyebrow || '') + '</p>' +
                    '<h1 class="apply-title apply-title--intro" id="apply-q" tabindex="-1">' + esc(root.title || 'Apply') + '</h1>' +
                '</div>' +
                '<div class="apply-a">' +
                    '<p class="apply-text">' + esc(root.intro || '') + '</p>' +
                    '<div class="apply-choices apply-choices--list">' +
                        openForms
                            .map(function (f, i) {
                                var href = f.link || f.page || 'apply.html?form=' + encodeURIComponent(f.id)
                                return (
                                    '<a class="apply-choice" href="' + esc(href) + '"' + (f.link ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
                                        '<span class="apply-key" aria-hidden="true">' + String.fromCharCode(65 + i) + '</span>' +
                                        '<span class="apply-choice-body">' +
                                            '<span class="apply-choice-label">' + esc(f.title) + '</span>' +
                                            (f.blurb ? '<span class="apply-choice-blurb">' + esc(f.blurb) + '</span>' : '') +
                                        '</span>' +
                                    '</a>'
                                )
                            })
                            .join('') +
                    '</div>' +
                    '<div class="apply-actions"><span class="apply-keys">Press a letter</span></div>' +
                '</div>' +
            '</div>'
        HG.capsBrand(frame)
        bar.style.transform = 'scaleX(0)'
        document.addEventListener('keydown', function (event) {
            if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return
            var pick = frame.querySelectorAll('a.apply-choice')[event.key.toUpperCase().charCodeAt(0) - 65]
            if (pick) pick.click()
        })
        return
    }
    document.title = cfg.title + ' \u2014 ' + data.siteName

    var questions = cfg.questions
    var total = questions.length
    var answers = {}
    var index = -1 // -1 intro, 0 to total-1 the questions, total the thank-you
    var hasKeyboard = window.matchMedia('(hover: hover) and (pointer: fine)').matches // Enter moves on only with a real keyboard
    var timer = null
    var sending = false

    function pad(n) {
        return String(n).padStart(2, '0')
    }

    function autocompleteFor(q) {
        return q.id === 'name' ? 'name' : q.type === 'email' ? 'email' : 'off'
    }

    function fieldHtml(q) {
        var value = answers[q.id] || ''
        var common = ' id="apply-field" aria-labelledby="apply-q" placeholder="' + esc(q.placeholder || '') + '"'
        if (q.type === 'longtext') {
            return '<textarea class="apply-input apply-input--long" rows="3"' + common + ' autocomplete="off">' + esc(value) + '</textarea>'
        }
        if (q.type === 'choice') {
            return (
                '<div class="apply-choices" role="radiogroup" aria-labelledby="apply-q">' +
                    q.options
                        .map(function (option, i) {
                            return (
                                '<label class="apply-choice">' +
                                    '<input type="radio" name="apply-choice" value="' + esc(option) + '"' + (value === option ? ' checked' : '') + '>' +
                                    '<span class="apply-key" aria-hidden="true">' + String.fromCharCode(65 + i) + '</span>' +
                                    '<span class="apply-choice-label">' + esc(option) + '</span>' +
                                '</label>'
                            )
                        })
                        .join('') +
                '</div>'
            )
        }
        return (
            '<input class="apply-input" type="' + (q.type === 'email' ? 'email' : 'text') + '"' + common +
            ' value="' + esc(value) + '" autocomplete="' + autocompleteFor(q) + '" autocapitalize="' + (q.type === 'email' ? 'off' : 'sentences') + '" spellcheck="false">'
        )
    }

    function stepHtml() {
        if (index < 0) {
            return (
                '<div class="apply-step">' +
                    '<div class="apply-q">' +
                        '<p class="eyebrow">' + esc(cfg.eyebrow || '') + '</p>' +
                        '<h1 class="apply-title apply-title--intro" id="apply-q" tabindex="-1">' + esc(cfg.title) + '</h1>' +
                    '</div>' +
                    '<div class="apply-a">' +
                        '<p class="apply-text">' + esc(cfg.intro || '') + '</p>' +
                        (cfg.show
                            ? '<div class="apply-show">' +
                                  '<p class="eyebrow">The show</p>' +
                                  '<p class="apply-show-title">' + esc(cfg.show.title) + '</p>' +
                                  (cfg.show.date ? '<p class="apply-show-date">' + esc(cfg.show.date) + '</p>' : '') +
                                  (cfg.show.text ? '<p class="apply-text">' + esc(cfg.show.text) + '</p>' : '') +
                              '</div>'
                            : '') +
                        '<div class="apply-actions">' +
                            (cfg.link
                                ? '<a class="pill pill--accent apply-next" href="' + esc(cfg.link) + '" target="_blank" rel="noopener noreferrer">' + esc(cfg.start || 'START') + ' \u2197</a>'
                                : '<button type="button" class="pill pill--accent apply-next">' + esc(cfg.start || 'START') + '</button>') +
                            (forms.length > 1 ? '<a class="pill" href="apply.html">ALL FORMS</a>' : '') +
                            (cfg.link ? '' : '<span class="apply-keys">Press Enter ↵</span>') +
                        '</div>' +
                    '</div>' +
                '</div>'
            )
        }
        var q = questions[index]
        var last = index === total - 1
        return (
            '<form class="apply-step" novalidate>' +
                '<div class="apply-q">' +
                    '<p class="eyebrow">' + pad(index + 1) + ' / ' + pad(total) + (q.required ? '' : ' · Optional') + '</p>' +
                    '<h1 class="apply-title" id="apply-q" tabindex="-1">' + esc(q.label) + '</h1>' +
                    (q.hint ? '<p class="apply-hint">' + esc(q.hint) + '</p>' : '') +
                '</div>' +
                '<div class="apply-a">' +
                    fieldHtml(q) +
                    '<p class="apply-error" role="alert"></p>' +
                    '<div class="apply-actions">' +
                        '<button type="button" class="pill apply-back" aria-label="Previous question">BACK</button>' +
                        '<button type="submit" class="pill pill--accent apply-next">' + (last ? 'SUBMIT' : 'OK') + '</button>' +
                        '<span class="apply-keys">' + (q.type === 'choice' ? 'Press a letter' : 'Press Enter ↵') + '</span>' +
                    '</div>' +
                '</div>' +
            '</form>'
        )
    }

    function show(next, direction) {
        window.clearTimeout(timer)
        index = next
        frame.innerHTML = stepHtml()
        var step = frame.firstElementChild
        step.setAttribute('data-dir', direction || 'forward')
        bar.style.transform = 'scaleX(' + Math.max(index, 0) / total + ')'
        HG.capsBrand(frame)

        if (index < 0) {
            if (!cfg.link) {
                step.querySelector('.apply-next').addEventListener('click', function () {
                    show(0, 'forward')
                })
            }
            step.querySelector('.apply-next').focus({ preventScroll: true })
            return
        }

        var q = questions[index]
        var form = step
        form.addEventListener('submit', function (event) {
            event.preventDefault()
            advance()
        })
        form.querySelector('.apply-back').addEventListener('click', function () {
            remember()
            show(index - 1, 'back')
        })

        var field = form.querySelector('#apply-field') || form.querySelector('input[type="radio"]:checked') || form.querySelector('input[type="radio"]')
        if (q.type === 'choice') {
            form.querySelectorAll('input[type="radio"]').forEach(function (radio) {
                radio.addEventListener('change', function () {
                    answers[q.id] = radio.value
                    setError('')
                })
                // A click (or tap) moves on; arrow keys only move the selection.
                radio.addEventListener('click', function (event) {
                    if (event.detail > 0) moveOnSoon()
                })
            })
        } else {
            field.addEventListener('input', function () {
                setError('')
                if (q.type === 'longtext') grow(field)
            })
            if (q.type === 'longtext') {
                grow(field)
                field.addEventListener('keydown', function (event) {
                    if (hasKeyboard && event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
                        event.preventDefault()
                        advance()
                    }
                })
            }
        }
        field.focus({ preventScroll: true })
    }

    // After a beat, so the picked choice is seen.
    function moveOnSoon() {
        window.clearTimeout(timer)
        timer = window.setTimeout(advance, 280)
    }

    function grow(textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
    }

    function setError(text) {
        var el = frame.querySelector('.apply-error')
        if (el) el.textContent = text
    }

    // Keep what is typed when going back.
    function remember() {
        var q = questions[index]
        var field = frame.querySelector('#apply-field')
        if (field) answers[q.id] = field.value.trim()
    }

    function advance() {
        if (sending || index < 0 || index >= total) return
        window.clearTimeout(timer)
        remember()
        var q = questions[index]
        var value = answers[q.id] || ''
        if (q.required && !value) {
            setError(q.type === 'choice' ? 'Please pick one.' : 'Please answer this one.')
            return
        }
        if (value && q.type === 'email' && !HG.isEmail(value)) {
            setError('Please enter a valid email address.')
            return
        }
        if (index < total - 1) show(index + 1, 'forward')
        else send()
    }

    function send() {
        var submit = frame.querySelector('.apply-next')
        var fields = {}
        questions.forEach(function (q) {
            fields[q.id] = answers[q.id] || ''
        })
        // Bots fill every field; people never see the extra one.
        if (trap.value) {
            done(false)
            return
        }
        sending = true
        submit.disabled = true
        submit.textContent = 'SENDING…'
        fields.form = cfg.id
        if (cfg.show) fields.show = cfg.show.title
        HG.post(root.action, fields)
            .then(function (result) {
                sending = false
                done(result.preview)
            })
            .catch(function () {
                sending = false
                submit.disabled = false
                submit.textContent = 'SUBMIT'
                setError('Could not send that. Try again, or email ' + data.contactEmail + '.')
            })
    }

    function done(preview) {
        index = total
        window.clearTimeout(timer)
        var text = (cfg.done && cfg.done.text) || ''
        frame.innerHTML =
            '<div class="apply-step" data-dir="forward">' +
                '<div class="apply-q">' +
                    '<p class="eyebrow">Sent</p>' +
                    '<h1 class="apply-title" id="apply-q" tabindex="-1">' + esc((cfg.done && cfg.done.title) || 'Thank you.') + '</h1>' +
                '</div>' +
                '<div class="apply-a">' +
                    '<p class="apply-text">' + esc(text) + '</p>' +
                    (preview ? '<p class="apply-hint">Preview: nothing was sent.</p>' : '') +
                    '<div class="apply-actions"><a class="pill pill--accent" href="index.html">BACK TO HOME</a></div>' +
                '</div>' +
            '</div>'
        bar.style.transform = 'scaleX(1)'
        HG.capsBrand(frame)
        frame.querySelector('.apply-title').focus({ preventScroll: true })
    }

    // A letter picks that choice.
    document.addEventListener('keydown', function (event) {
        if (index < 0 || index >= total || questions[index].type !== 'choice') return
        if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return
        var radios = frame.querySelectorAll('input[type="radio"]')
        var pick = radios[event.key.toUpperCase().charCodeAt(0) - 65]
        if (pick) {
            pick.checked = true
            pick.dispatchEvent(new Event('change'))
            pick.focus({ preventScroll: true })
            moveOnSoon()
        }
    })

    show(-1)
})()
