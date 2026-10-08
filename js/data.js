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

        // Links in the right half of the header, left of MENU (up to three fit
        // the grid columns).
        headerPills: [
            { label: 'GALLERY', href: 'gallery.html' },
            { label: 'PRESS', href: 'press.html' },
            { label: 'EVENTS', href: 'events.html' },
        ],

        // Secondary pages (left of the home page footer bar, and in the menu).
        secondary: [
            { label: 'ABOUT', href: 'about.html' },
            { label: 'SHOWS', href: 'shows.html' },
        ],

        /*
         * Projects. Each one appears as a floating card on the home page, as a
         * tile in the gallery, and gets its own page (project.html?slug=...).
         *
         *   slug      – used in the URL, must be unique
         *   image     – path to the cover image used on the home page and in
         *               the gallery (any jpg / png / webp / svg). Keep it small
         *               (about 1000px on the long side).
         *   ratio     – image width ÷ height. Only used until the image loads,
         *               then the real size is read from the image itself.
         *   year      – optional
         *   summary   – the bio on the project page; a blank line starts a
         *               new paragraph
         *   images    – optional: every image to show on the project page, in
         *               order (defaults to just `image`). Each one is either a
         *               path or { src, alt } with a short description.
         *   credits   – optional: [{ role, names: ['@handle', …] }]. Anything
         *               that looks like @handle becomes a link to Instagram.
         *
         * The first project is also the first in the gallery.
         */
        projects: [
            {
                slug: 'sound-form',
                title: 'SOUND / FORM',
                category: 'Fashion Performance',
                image: 'assets/projects/sound-form/cover.jpg',
                ratio: 0.667,
                images: [
                    {
                        src: 'assets/projects/sound-form/01.jpg',
                        alt: 'Two performers in white mesh, lace and ruched cotton hold hands and lean away from each other against a dark concrete wall.',
                    },
                    {
                        src: 'assets/projects/sound-form/02.jpg',
                        alt: 'Three performers in hand-made knit, mesh, fringe and hooded looks, mid-movement in a dimly lit space.',
                    },
                    {
                        src: 'assets/projects/sound-form/03.jpg',
                        alt: 'A performer in a crystal-beaded top arches back with one arm raised, a second performer behind them, photographed from a tilted angle.',
                    },
                    {
                        src: 'assets/projects/sound-form/04.jpg',
                        alt: 'Performers in crocheted, mesh and fringe looks strike a pose together while a photographer works behind them.',
                    },
                    {
                        src: 'assets/projects/sound-form/05.jpg',
                        alt: 'Four performers draped head to toe in clear plastic sheeting on a wooden deck at night.',
                    },
                ],
                summary:
                    'SOUND / FORM was a fashion event hosted by HEAVENSGATE NYC, staged as performances and installations instead of a traditional runway. Fashion can be expressed through movement, vulnerability and fluidity, and here it was.\n\n' +
                    'Spread across two floors, it danced, sprawled, and occasionally made you wonder where to look first.',
                credits: [
                    { role: 'Hosted by', names: ['@heavensgatenyc'] },
                    {
                        role: 'Fashion performances + installations',
                        names: ['@lakras.co + @amehl.world', '@nostylguh.co', '@annielian.love', '@theindigofay', '@wet._market', '@caboclo.bad'],
                    },
                    { role: 'Sound', names: ['@cultivatedsound'] },
                    { role: 'DJs', names: ['@chamberlainz', '@sploofi', '@elladotnet'] },
                ],
            },
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
                p.summary ||
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
