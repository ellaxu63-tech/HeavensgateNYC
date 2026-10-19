/*
 * The forms (js/data.js, form): apply.html lists them, and each one runs on its own page
 * (designers.html, crew.html) or at apply.html?form=<id>. A form is an intro, then one question per
 * screen, then a thank-you. Answers are sent with HG.post to the address set in js/data.js (a Google
 * Sheet, see the README), with the form's id so each form gets its own tab. A form with a `link`
 * opens that page (a Google Form) instead.
 *
 * A 'photos' question lets the person pick pictures; each is shrunk in the browser (so a phone photo is a few
 * hundred KB, not several MB) and sent with the answers as <id>_1, <id>_2, ... for the script to save to Drive.
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

    // Which form this page is for: the page says so (data-form), or ?form=crew; otherwise the list.
    var wanted = document.body.getAttribute('data-form') || new URLSearchParams(location.search).get('form') || ''
    var picked = forms.filter(function (f) {
        return f.id === wanted
    })[0]
    var openForms = HG.openForms()
    var cfg = picked || (openForms.length === 1 ? openForms[0] : null)

    // Not connected yet: say so instead of showing a form that goes nowhere.
    if (!openForms.length || (picked && openForms.indexOf(picked) === -1)) {
        frame.innerHTML =
            '<div class="apply-step">' +
                '<div class="apply-q"><h1 class="apply-title">Not open yet.</h1></div>' +
                '<div class="apply-a"><p class="apply-text">This form is not open right now. Write to us at ' + mailLink() + '.</p></div>' +
            '</div>'
        HG.capsBrand(frame)
        return
    }

    initSlides()

    // A small slideshow of the gallery under the form. It lives outside the questions, so it keeps going from
    // one question to the next. Each slide opens its project in a new tab (the answers here are kept).
    function initSlides() {
        var projects = (data.projects || []).filter(function (p) {
            return p.image
        })
        if (projects.length < 2) return
        var holder = document.createElement('div')
        holder.className = 'apply-slides'
        holder.innerHTML =
            '<a class="apply-slide" target="_blank" rel="noopener noreferrer" data-cursor="open">' +
                '<img alt="" decoding="async"><img alt="" decoding="async">' +
            '</a>' +
            '<p class="apply-slide-cap"><span class="apply-slide-count"></span><span class="apply-slide-title"></span></p>'
        frame.after(holder)

        var link = holder.querySelector('.apply-slide')
        var imgs = holder.querySelectorAll('img')
        var title = holder.querySelector('.apply-slide-title')
        var count = holder.querySelector('.apply-slide-count')
        var on = imgs[0]
        var off = imgs[1]
        var n = 0

        function go(i) {
            var project = projects[i]
            var pre = new Image()
            pre.onload = function () {
                off.src = project.image
                off.classList.add('is-on')
                on.classList.remove('is-on')
                var swap = on
                on = off
                off = swap
                link.href = HG.projectUrl(project)
                link.setAttribute('aria-label', 'Gallery: ' + project.title)
                count.textContent = 'Gallery ' + pad(i + 1) + ' / ' + pad(projects.length)
                title.textContent = [project.title, project.year].filter(Boolean).join(' \u00b7 ')
            }
            pre.src = project.image // a picture that fails to load is simply skipped at the next turn
        }
        go(0)
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        window.setInterval(function () {
            if (document.hidden) return
            n = (n + 1) % projects.length
            go(n)
        }, 3500)
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
                    HG.formRows(openForms) +
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
    // A question can depend on an earlier answer: showIf: { id: 'role', equals: 'Video' } (or `in: [...]`, or
    // `not: '...'`), and it can stop being compulsory for some answers: optionalIf: { id: 'role', equals: 'Photography' }.
    function matches(cond) {
        var answer = answers[cond.id]
        if (cond.equals !== undefined) return answer === cond.equals
        if (cond.in) return cond.in.indexOf(answer) !== -1
        if (cond.not !== undefined) return answer !== cond.not
        return true
    }
    function isRequired(q) {
        return !!q.required && !(q.optionalIf && matches(q.optionalIf))
    }
    // The indexes of the questions to ask right now, in order.
    function visibleIndexes() {
        var list = []
        questions.forEach(function (q, i) {
            if (!q.showIf || matches(q.showIf)) list.push(i)
        })
        return list
    }
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
        if (q.type === 'photos') {
            return '<div class="apply-photos" id="apply-photos"></div>'
        }
        if (q.type === 'choice') {
            return (
                '<div class="apply-choices" role="radiogroup" aria-labelledby="apply-q">' +
                    q.options
                        .map(function (option, i) {
                            // An option is a string, or { label, note }: the note (the pay, say) is shown on its row.
                            var label = typeof option === 'string' ? option : option.label
                            var note = typeof option === 'string' ? '' : option.note
                            return (
                                '<label class="apply-choice">' +
                                    '<input type="radio" name="apply-choice" value="' + esc(label) + '"' + (value === label ? ' checked' : '') + '>' +
                                    '<span class="apply-key" aria-hidden="true">' + String.fromCharCode(65 + i) + '</span>' +
                                    '<span class="apply-choice-label">' + esc(label) + '</span>' +
                                    (note ? '<span class="apply-choice-note">' + esc(note) + '</span>' : '') +
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
        var path = visibleIndexes()
        var pos = path.indexOf(index)
        var last = pos === path.length - 1
        return (
            '<form class="apply-step" novalidate>' +
                '<div class="apply-q">' +
                    '<p class="eyebrow">' + pad(pos + 1) + ' / ' + pad(path.length) + (isRequired(q) ? '' : ' · Optional') + '</p>' +
                    '<h1 class="apply-title" id="apply-q" tabindex="-1">' + esc(q.label) + '</h1>' +
                    (q.hint ? '<p class="apply-hint">' + esc(q.hint) + '</p>' : '') +
                '</div>' +
                '<div class="apply-a">' +
                    fieldHtml(q) +
                    '<p class="apply-error" role="alert"></p>' +
                    '<div class="apply-actions">' +
                        '<button type="button" class="pill apply-back" aria-label="Previous question">BACK</button>' +
                        '<button type="submit" class="pill pill--accent apply-next">' + (last ? 'SUBMIT' : 'OK') + '</button>' +
                        (q.type === 'photos' ? '' : '<span class="apply-keys">' + (q.type === 'choice' ? 'Press a letter' : 'Press Enter ↵') + '</span>') +
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
        var shown = visibleIndexes()
        bar.style.transform = 'scaleX(' + (index < 0 ? 0 : shown.indexOf(index) / shown.length) + ')'
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
            var path = visibleIndexes()
            var pos = path.indexOf(index)
            show(pos > 0 ? path[pos - 1] : -1, 'back')
        })

        var field = form.querySelector('#apply-field') || form.querySelector('input[type="radio"]:checked') || form.querySelector('input[type="radio"]')
        if (q.type === 'photos') {
            mountPhotos(q)
            field = form.querySelector('.apply-add input') || form.querySelector('.apply-next')
        } else if (q.type === 'choice') {
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

    // ---- photos ----
    var PHOTO_SIDE = 1400 // the longest side a sent picture keeps, in pixels
    var photosBusy = false

    // A File to a JPEG data address, no bigger than PHOTO_SIDE (a transparent PNG gets a white background).
    function shrinkPhoto(file) {
        return new Promise(function (resolve, reject) {
            var url = URL.createObjectURL(file)
            var img = new Image()
            img.onload = function () {
                var scale = Math.min(1, PHOTO_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
                var canvas = document.createElement('canvas')
                canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
                canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
                var ctx = canvas.getContext('2d')
                ctx.fillStyle = '#fff'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                URL.revokeObjectURL(url)
                resolve(canvas.toDataURL('image/jpeg', 0.82))
            }
            img.onerror = function () {
                URL.revokeObjectURL(url)
                reject(new Error('unreadable'))
            }
            img.src = url
        })
    }

    // The picker for a 'photos' question: the chosen pictures as small tiles (each with a remove button),
    // and an add tile while there is room.
    function mountPhotos(q) {
        var holder = frame.querySelector('#apply-photos')
        var max = q.max || 3
        var list = answers[q.id] || (answers[q.id] = [])

        function draw() {
            holder.innerHTML =
                '<ul class="apply-thumbs">' +
                    list
                        .map(function (photo, i) {
                            return (
                                '<li class="apply-thumb">' +
                                    '<img src="' + photo.data + '" alt="Photo ' + (i + 1) + '">' +
                                    '<button type="button" class="apply-thumb-remove" data-i="' + i + '" aria-label="Remove photo ' + (i + 1) + '">\u00d7</button>' +
                                '</li>'
                            )
                        })
                        .join('') +
                    (list.length < max
                        ? '<li class="apply-add"><input type="file" accept="image/*"' + (max - list.length > 1 ? ' multiple' : '') + ' aria-label="Add photos"><span aria-hidden="true">+</span><span class="apply-add-text" aria-hidden="true">' + (list.length ? 'Add' : 'Add photos') + '</span></li>'
                        : '') +
                '</ul>'
            var input = holder.querySelector('input')
            if (input) input.addEventListener('change', function () {
                add(Array.prototype.slice.call(input.files))
            })
            holder.querySelectorAll('.apply-thumb-remove').forEach(function (button) {
                button.addEventListener('click', function () {
                    list.splice(Number(button.getAttribute('data-i')), 1)
                    setError('')
                    draw()
                    var again = holder.querySelector('input')
                    if (again) again.focus({ preventScroll: true })
                })
            })
        }

        function add(files) {
            var room = max - list.length
            var picks = files.filter(function (file) {
                return /^image\//.test(file.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)
            })
            if (!picks.length) {
                setError('Please choose a picture (JPG or PNG).')
                return
            }
            setError(picks.length > room ? 'Up to ' + max + ' photos. We kept the first ' + room + '.' : '')
            photosBusy = true
            Promise.all(
                picks.slice(0, room).map(function (file) {
                    return shrinkPhoto(file).then(
                        function (data) {
                            return { name: file.name, data: data }
                        },
                        function () {
                            return null
                        }
                    )
                })
            ).then(function (photos) {
                photosBusy = false
                var good = photos.filter(Boolean)
                if (good.length < photos.length) setError('One photo could not be read. Try a JPG or PNG.')
                good.forEach(function (photo) {
                    list.push(photo)
                })
                if (!frame.contains(holder)) return // went to another question meanwhile; the photos are kept
                draw()
                var next = holder.querySelector('input')
                if (next) next.focus({ preventScroll: true })
            })
        }

        draw()
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
        if (field && q.type !== 'photos') answers[q.id] = field.value.trim()
    }

    function advance() {
        if (sending || index < 0 || index >= total) return
        window.clearTimeout(timer)
        remember()
        var q = questions[index]
        var value = q.type === 'photos' ? (answers[q.id] || []).length : answers[q.id] || ''
        if (isRequired(q) && !value) {
            setError(q.type === 'choice' ? 'Please pick one.' : q.type === 'photos' ? 'Please add at least one photo.' : 'Please answer this one.')
            return
        }
        if (photosBusy) {
            setError('One moment, the photos are still loading.')
            return
        }
        if (value && q.type === 'email' && !HG.isEmail(value)) {
            setError('Please enter a valid email address.')
            return
        }
        var path = visibleIndexes()
        var pos = path.indexOf(index)
        if (pos < path.length - 1) show(path[pos + 1], 'forward')
        else send()
    }

    function send() {
        var submit = frame.querySelector('.apply-next')
        var fields = {}
        var asked = visibleIndexes()
        questions.forEach(function (q, i) {
            var shown = asked.indexOf(i) !== -1
            if (q.type === 'photos') {
                // One field per picture (photos_1, photos_2, ...): the script saves each to Drive.
                ;(shown ? answers[q.id] || [] : []).forEach(function (photo, n) {
                    fields[q.id + '_' + (n + 1)] = photo.data
                })
                return
            }
            fields[q.id] = shown ? answers[q.id] || '' : ''
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
