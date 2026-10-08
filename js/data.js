/*
 * HEAVENSGATE NYC — site content.
 *
 * Everything you see on the site comes from this file, so this is the one
 * place to edit text, projects, press and events.
 *
 * IMPORTANT: the projects, press items and events below are PLACEHOLDERS.
 * Replace them with real content before launch.
 */
(function () {
    'use strict'

    var HG = (window.HG = window.HG || {})

    HG.data = {
        siteName: 'HEAVENSGATE NYC',

        // Centered on the home page, between the floating project images.
        intro:
            'HEAVENSGATE NYC is an independent fashion and performance platform producing runway shows, live presentations, and creative experiences for emerging designers and artists.',

        // Replace with the real address before launch.
        contactEmail: 'hello@example.com',

        // Main menu (the full-screen overlay).
        nav: [
            { label: 'GALLERY', href: 'gallery.html' },
            { label: 'STUDIO', href: 'studio.html' },
            { label: 'CONNECT', href: 'connect.html' },
            { label: 'PRESS', href: 'press.html' },
            { label: 'EVENTS', href: 'events.html' },
        ],

        // Small outlined pills in the header, left of MENU.
        headerPills: [
            { label: 'PRESS', href: 'press.html' },
            { label: 'EVENTS', href: 'events.html' },
        ],

        // Secondary pages (vertical pills on the home page, and in the menu).
        secondary: [
            { label: 'ABOUT', href: 'about.html' },
            { label: 'SHOWS', href: 'shows.html' },
        ],

        /*
         * Projects. Each one appears as a floating card on the home page, as a
         * tile in the gallery, and gets its own page (project.html?slug=...).
         *
         *   slug      – used in the URL, must be unique
         *   image     – path to the cover image (any jpg / png / webp / svg)
         *   ratio     – image width ÷ height. Only used until the image loads,
         *               then the real size is read from the image itself.
         */
        projects: [
            { slug: 'runway-01', title: 'Runway 01', category: 'Runway', year: '2026', image: 'assets/projects/project-01.svg', ratio: 0.8 },
            { slug: 'presentation-01', title: 'Presentation 01', category: 'Live Presentation', year: '2026', image: 'assets/projects/project-02.svg', ratio: 1.25 },
            { slug: 'experience-01', title: 'Experience 01', category: 'Creative Experience', year: '2026', image: 'assets/projects/project-03.svg', ratio: 1 },
            { slug: 'runway-02', title: 'Runway 02', category: 'Runway', year: '2025', image: 'assets/projects/project-04.svg', ratio: 0.727 },
            { slug: 'presentation-02', title: 'Presentation 02', category: 'Live Presentation', year: '2025', image: 'assets/projects/project-05.svg', ratio: 1.5 },
            { slug: 'experience-02', title: 'Experience 02', category: 'Creative Experience', year: '2025', image: 'assets/projects/project-06.svg', ratio: 0.8 },
            { slug: 'runway-03', title: 'Runway 03', category: 'Runway', year: '2025', image: 'assets/projects/project-07.svg', ratio: 1 },
            { slug: 'presentation-03', title: 'Presentation 03', category: 'Live Presentation', year: '2024', image: 'assets/projects/project-08.svg', ratio: 0.75 },
            { slug: 'experience-03', title: 'Experience 03', category: 'Creative Experience', year: '2024', image: 'assets/projects/project-09.svg', ratio: 1.375 },
            { slug: 'runway-04', title: 'Runway 04', category: 'Runway', year: '2024', image: 'assets/projects/project-10.svg', ratio: 0.8 },
        ].map(function (p) {
            p.summary =
                'Placeholder project. Replace this entry in js/data.js with the real title, description and images.'
            return p
        }),

        // PLACEHOLDER press. Add an `href` to make a row a link.
        press: [
            { pub: 'Vogue', title: 'The Platform Redefining Contemporary Fashion', date: '2026' },
            { pub: 'Dazed', title: 'HEAVENSGATE NYC: Where Art Meets Wearable Culture', date: '2025' },
            { pub: 'AnOther', title: 'Inside the World of HEAVENSGATE NYC', date: '2025' },
            { pub: 'i-D', title: 'The Designers Changing the Game', date: '2024' },
            { pub: 'W Magazine', title: 'New Voices in Independent Fashion', date: '2024' },
            { pub: 'Highsnobiety', title: 'The Newest Presentation Is Everything', date: '2024' },
        ],

        // PLACEHOLDER events. `type: 'Show'` ones also appear on the Shows page.
        // Add an `href` to make a card a link.
        events: [
            { tag: 'Upcoming', title: 'SS27 Presentation', date: 'March 2027', location: 'Paris', type: 'Show' },
            { tag: 'Upcoming', title: 'HEAVENSGATE × Archive Pop-Up', date: 'Nov 2026', location: 'Tokyo', type: 'Exhibition' },
            { tag: 'Past', title: 'FW26 Runway Show', date: 'Sep 2026', location: 'New York', type: 'Show' },
            { tag: 'Past', title: 'Group Exhibition: Material Studies', date: 'Jun 2026', location: 'London', type: 'Exhibition' },
            { tag: 'Past', title: 'SS26 Collection Launch', date: 'Feb 2026', location: 'Paris', type: 'Show' },
            { tag: 'Past', title: 'Concept Store Opening', date: 'Oct 2025', location: 'Seoul', type: 'Retail' },
        ],
    }
})()
