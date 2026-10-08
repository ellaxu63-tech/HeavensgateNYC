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

        // The video on the home page: a floating thumbnail (the poster image) that
        // opens a player when clicked. Remove this block to take it off.
        homeVideo: {
            title: 'Artifice Showcase',
            meta: 'Deus, Sex, Machina \u2014 June 8',
            src: 'assets/video/artifice-showcase.mp4',
            poster: 'assets/video/artifice-showcase-poster.webp',
            ratio: 0.5625, // width \u00f7 height (the clip is vertical)
            // Shown under the video, from the clip itself.
            caption: 'Artifice Showcase \u00b7 Deus, Sex, Machina \u00b7 June 8 \u00b7 1329 Willoughby Ave \u00b7 7 PM\u2013late \u00b7 HEAVENSGATE pop-up market open 1\u20136 PM',
        },

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
         *   video     – optional: a video clip, shown first on the project
         *               page. A path to a file (mp4 is safest; keep it under
         *               about 15 MB), a YouTube or Vimeo link, or
         *               { src, poster, ratio, autoplay, title }:
         *                 poster   – still image shown before it plays
         *                 ratio    – width ÷ height (16/9 is assumed; files fix
         *                            themselves once they load)
         *                 autoplay – true: plays silently on a loop while on
         *                            screen (people can still unmute)
         *               Use `videos: [ … ]` for more than one.
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
                year: '2026',
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
                    {
                        src: 'assets/projects/sound-form/06.webp',
                        alt: 'Guests crowd together at the event. A person in a cream T-shirt reading \u201ci post therefore i am\u201d has an arm around a smiling person in a white lace top holding an orange and pink woven bag. Overlaid in yellow: Totem, \u201cLakras / Amehl: the girls shaking up Brooklyn\u2019s migrant fashion scene\u201d.',
                    },
                    {
                        src: 'assets/projects/sound-form/07.webp',
                        alt: 'Two performers strike dramatic poses at a tilt: one in a light pink top, black shorts and a braided headpiece with feather trim, the other in a cream crocheted dress with pink fringe and pink hair.',
                    },
                    {
                        src: 'assets/projects/sound-form/08.webp',
                        alt: 'A line of performers in pink hoodies with gold embroidered hoods, fringe skirts, a red lace mini skirt and knee-high boots all raise their arms over their heads, in front of a projection reading Amehl.',
                    },
                    {
                        src: 'assets/projects/sound-form/09.webp',
                        alt: 'A performer with pink hair and gold lipstick in a cream crocheted dress poses with hands at their shoulders, surrounded by other performers in pink and gold hoods. The projection behind them reads Amehl x Lakras.',
                    },
                    {
                        src: 'assets/events/sound-form/01-poster.webp',
                        alt: 'The SOUND / FORM poster: orange-red with the title in a wobbling grey oval. Fashion performances by HEAVENSGATE NYC + sounds by Cultivated Sound. NYFW 26, NYFW closing weekend + Climate Week prelude, 9.18.26, Honey\u2019s. Cultivated Sound: Chamberlain Zhang, Sploofi, Elladotnet.',
                    },
                ],
                summary:
                    'SOUND / FORM was a fashion event hosted by HEAVENSGATE NYC, staged as performances and installations instead of a traditional runway. Fashion can be expressed through movement, vulnerability and fluidity, and here it was.\n\n' +
                    'Spread across two floors, it danced, sprawled, and occasionally made you wonder where to look first.\n\n' +
                    'At Brooklyn fashion week at Honeys, Colombian label @lakras.co and Argentinian label @amehl.world brought \u201cDo u love me or do u love my avatar?\u201d to Brooklyn with @heavensgatenyc.\n\n' +
                    'Seven girls, handmade clothes, choreography, phones, a little Black Eyed Peas and a room where conversations bounced between Spanish, English and Chinese.\n\n' +
                    'It was weird, intimate and a little chaotic. Spanish, English and Chinese all in the same room, with designers and creatives from different places finding each other in Brooklyn. It felt like its own little world for the night.',
                credits: [
                    { role: 'Hosted by', names: ['@heavensgatenyc'] },
                    {
                        role: 'Fashion performances + installations',
                        names: ['@lakras.co + @amehl.world', '@nostylguh.co', '@annielian.love', '@theindigofay', '@wet._market', '@caboclo.bad'],
                    },
                    { role: 'Sound', names: ['@cultivatedsound'] },
                    { role: 'DJs', names: ['@chamberlainz', '@sploofi', '@elladotnet'] },
                    { role: 'Photos, Totem feature', names: ['@wired_kim'] },
                ],
            },
            {
                slug: 'the-last-human-fashion-show',
                title: 'The Last Human Fashion Show',
                category: 'Fashion Show',
                year: '2026',
                image: 'assets/projects/the-last-human-fashion-show/cover.jpg',
                ratio: 1.5,
                images: [
                    {
                        src: 'assets/projects/the-last-human-fashion-show/01.jpg',
                        alt: 'Two models seen from behind in white fringed, open-back looks: one with long gold and brown braids studded with pearls, the other with a long dark braid and a pearl hair clip, in a bright room with a disco ball.',
                    },
                    {
                        src: 'assets/projects/the-last-human-fashion-show/02.jpg',
                        alt: 'A model in a black bodysuit and sheer black tights with a pink satin rosette at the hip stands holding a phone in a backstage room, bags and garment covers on the floor around her.',
                    },
                    {
                        src: 'assets/projects/the-last-human-fashion-show/03.jpg',
                        alt: 'A model with purple hair rollers and deep red eye makeup wears a polka-dot corset with a folded vintage newspaper-print panel and a gathered white skirt, backstage beside a pink suitcase.',
                    },
                    {
                        src: 'assets/projects/the-last-human-fashion-show/04.jpg',
                        alt: 'Two models on a rooftop against a blue sky and the city skyline: one in a pale green satin cut-out top with a black bow, the other in a cream fur bandeau over a blue sequin dress.',
                    },
                ],
                summary:
                    'THE LAST HUMAN FASHION SHOW took place on September 12, 2026 in Brooklyn, during New York Fashion Week: a runway experience celebrating what remains raw, imperfect, emotional, and human.\n\n' +
                    'Eight designers showed experimental fashion, and the night ended with a techno afterparty with @discharge.nyc.',
                credits: [
                    {
                        role: 'Featured designers',
                        names: ['@loveumissuwantuneedu', '@manninonyc', '@yejinahhhhh_works', '@vita_mazza_06', '@humanjuices', '@twntytwo30', '@_restate', '@sdn.brooklyn'],
                    },
                    { role: 'Producer', names: ['@elladotnet'] },
                    { role: 'Casting / Backstage coordinator', names: ['322 Production'] },
                    { role: 'Music producer', names: ['@r.dna__'] },
                    { role: 'DJs', names: ['@sabinin_', '@megan.rosengarten', '@cow.tools.cow.tools'] },
                    { role: 'Afterparty', names: ['@discharge.nyc'] },
                    {
                        role: 'Photography',
                        names: ['@sudokyu', '@frankyoucomeagain', '@absolutelyolivia', '@yinkaabrams_', '@thomxsn', '@judovisuals'],
                    },
                ],
            },
            {
                slug: 'table-manners',
                title: 'TABLE MANNERS',
                category: 'Performance & Fashion',
                year: '2026',
                image: 'assets/projects/table-manners/cover.webp',
                ratio: 0.75,
                images: [
                    {
                        src: 'assets/projects/table-manners/01.webp',
                        alt: 'Two performers at a black bar counter in a white kitchen. One, in a white pleated shirt with smudged dark eye makeup, pours red liquid from a bottle into a goblet. The other, in a grey vest top with red feathered eye makeup and a long braid, leans on the counter looking down.',
                    },
                    {
                        src: 'assets/projects/table-manners/02.webp',
                        alt: 'A performer in a black vinyl bra top, a chained collar and a chain belt stands behind a black table fixed to their waist with chains. Small cups of pasta salad sit on the table, and guests photograph the scene behind them.',
                    },
                    {
                        src: 'assets/projects/table-manners/03.webp',
                        alt: 'A performer with graphic black eyeliner, hoop earrings and a spiked, chained leather collar and bra top carries a silver tray of cups of pasta salad past guests holding cameras and phones.',
                    },
                    {
                        src: 'assets/projects/table-manners/04.webp',
                        alt: 'Two side-by-side shots of performers dancing in a white kitchen: on the left one in a white pleated shirt with smudged eye makeup lifts an arm; on the right one in a grey vest top with a long braid and red eye makeup turns away.',
                    },
                ],
                summary:
                    'TABLE MANNERS was an immersive evening of live performance, fashion, and beautifully controlled chaos.\n\n' +
                    '\u201cNo one leaves the table the way they arrived.\u201d\n\n' +
                    'TABLE MANNERS served performance, tension, and beautiful chaos. Thanks to everyone who came hungry.',
                credits: [
                    { role: 'Presented by', names: ['@rume_atelier', '@heavensgatenyc'] },
                    { role: 'Performance', names: ['@cassidyangelgrady', '@skyekita', '@withlovefromjack', '@amarivadhan'] },
                    { role: 'Designers', names: ['@peilinccc', '@amorydinero.newyork'] },
                    { role: 'Producers', names: ['@anniielian', '@elladotnet'] },
                    { role: 'Makeup', names: ['@insidiousgirl.mp4'] },
                    { role: 'Photos', names: ['@malicemincer', '@abstractarchivemag'] },
                ],
            },
            {
                slug: 'miss-conduct',
                title: 'MISS CONDUCT',
                category: 'Fashion Show & Rave',
                year: '2025',
                image: 'assets/projects/miss-conduct/cover.webp',
                ratio: 0.8,
                images: [
                    {
                        src: 'assets/projects/miss-conduct/01.webp',
                        alt: 'A performer in a grey blazer swings a chair overhead above smashed monitors and scattered paper, while seated guests film on their phones. A sheet on the floor reads \u201cYou\u2019re fired\u201d.',
                    },
                    {
                        src: 'assets/projects/miss-conduct/02.webp',
                        alt: 'In black and white, a performer in white lace tights balances on one leg with the other raised high and an arm stretched up, while two performers in grey blazers lie on the paper-covered floor holding the standing leg.',
                    },
                    {
                        src: 'assets/projects/miss-conduct/03.webp',
                        alt: 'A performer with black-framed glasses, pale makeup and dark glossy lips holds the lapels of an oversized grey blazer over a black vinyl dress, with a lace collar and lace tights.',
                    },
                    {
                        src: 'assets/projects/miss-conduct/04.webp',
                        alt: 'In black and white, a performer in lace tights arches back over an office chair holding a monitor overhead, while another performer in glasses sits at a desk, paper scattered across the floor.',
                    },
                ],
                summary:
                    'MISS CONDUCT is a fashion show, performance, and techno rave by Techno Boy x Heavensgate NYC\u2014where dystopian officewear meets immersive dance and chaos.\n\n' +
                    'It kicks off on a circular runway with Techno Boy\u2019s latest collection, featuring choreography by Cassidy Grady & Beatriz Castro\u2014power plays and breakdowns in motion. Then the rave takes over. The runway turns into a dancefloor.\n\n' +
                    'Come dressed for the boardroom\u2014or the breakdown.',
                credits: [
                    { role: 'Presented by', names: ['Techno Boy', 'HEAVENSGATE NYC', 'Cassidy Grady', 'Beatriz Castro'] },
                    { role: 'Collection', names: ['Techno Boy'] },
                    { role: 'Choreography', names: ['Cassidy Grady', 'Beatriz Castro'] },
                    { role: 'The performance + the rave', names: ['Lethal Trip', 'Stealthy', 'MIA', 'S7IK', 'Ludite', 'Ghoulina', 'Lucy La Dusk'] },
                    { role: 'Poster design', names: ['@stealthy00'] },
                ],
            },
            {
                slug: 'the-treasure',
                title: 'The Treasure',
                category: 'Fashion Show',
                year: '2023',
                image: 'assets/projects/the-treasure/cover.webp',
                ratio: 0.5625,
                video: {
                    src: 'assets/projects/the-treasure/the-treasure.mp4',
                    poster: 'assets/projects/the-treasure/poster.webp',
                    ratio: 0.5625,
                    title: 'The Treasure, video by @ronperaltax, featured by Vogue Thailand',
                },
                // The photos, shown under the video.
                images: [
                    {
                        src: 'assets/projects/the-treasure/01.webp',
                        alt: 'A model with white metallic eyeshadow in a white shirt-dress with a light denim corset panel, star-shaped metal buttons down the sleeves and a chunky chain necklace with a metal star pendant, on a rooftop with the city skyline behind.',
                    },
                    {
                        src: 'assets/projects/the-treasure/02.webp',
                        alt: 'A model with short red hair and a moustache in a pale panelled shirt with cut-out white sleeves, an orange tie and wide dark denim jeans, on a rooftop above the city.',
                    },
                    {
                        src: 'assets/projects/the-treasure/03.webp',
                        alt: 'A low-angle portrait of a model with long black hair, dark blue lipstick and silver eyeshadow in a beige trench coat over an olive shirt, with a blue cut-out tie, blue trousers and silver rings.',
                    },
                    {
                        src: 'assets/projects/the-treasure/04.webp',
                        alt: 'A model in silver wraparound sunglasses, a red work jacket and cropped top with a chain necklace, and a long beige skirt with blue script lettering, with black glossy boots, on a rooftop with the city skyline behind.',
                    },
                ],
                summary:
                    '\u2018The Treasure\u2019 \u2013 a multi-brand fashion show collaboration between Thai Trade Center New York (DITP) and Future Treasure (@futuretreasureny) during New York Fashion Week. Models cast by @heavensgatenyc.\n\n' +
                    'A runway and after party featuring \u201cThe Treasure\u201d by DITP and Future Treasure during New York Fashion Week, September 2023.\n\n' +
                    'Special thanks to the Thai Trade Center New York for giving us the opportunity to bring all Thai designers to this show.\n\n' +
                    'First time in Vogue: thank you @voguethailand for featuring this show and @ronperaltax for the video!',
                credits: [
                    { role: 'Presented by', names: ['Thai Trade Center New York (DITP)', '@futuretreasureny'] },
                    { role: 'Models cast by', names: ['@heavensgatenyc'] },
                    { role: 'Clothing', names: ['@vinnpatararin', '@boonlearnewyork', '@leisureprojects', '@merge.official_', '@techin_underground', '@sc_sculpture'] },
                    { role: 'Jewelry', names: ['@studiocult.co', '@w0dd.bangkok', '@maddyhopper.sneakers', '@travel___agency', '@77thofficial', '@billybeamo'] },
                    { role: 'Also featured', names: ['Charites'] },
                    { role: 'Special thanks', names: ['Thai Trade Center New York'] },
                    { role: 'Video', names: ['@ronperaltax'] },
                    { role: 'Featured by', names: ['@voguethailand'] },
                ],
            },
            {
                slug: 'stardust-fashion-show',
                title: 'Stardust Fashion Show',
                category: 'Fashion Show',
                year: '2023',
                image: 'assets/projects/stardust-fashion-show/cover.jpg',
                ratio: 0.751,
                images: [
                    {
                        src: 'assets/projects/stardust-fashion-show/01.jpg',
                        alt: 'A model with metallic blue lips in a black lace-trimmed satin corset dress with ruffled shoulders and brown fleece arm warmers.',
                    },
                    {
                        src: 'assets/projects/stardust-fashion-show/02.jpg',
                        alt: 'A model with long red hair in a black faux-leather bralette, black cut-out trousers, a chain necklace and a tan crescent shoulder bag.',
                    },
                    {
                        src: 'assets/projects/stardust-fashion-show/03.jpg',
                        alt: 'A model walks past seated guests in an orange and red gingham jacket with shaggy red fur, a feathered leopard-print hat and a tartan wrap skirt.',
                    },
                    {
                        src: 'assets/projects/stardust-fashion-show/04.jpg',
                        alt: 'Close-up of a model in white crochet lace sleeves and ruffles, a lace bonnet, long braids and a ribbon choker.',
                    },
                    {
                        src: 'assets/projects/stardust-fashion-show/05.jpg',
                        alt: 'Close-up of a hand with chunky rings and a pink-faced watch, against orange and red gingham taffeta and shaggy red fur.',
                    },
                ],
                summary:
                    'The Stardust Fashion Show took place during New York Fashion Week, Fall 2023, presented by @FutureTreasureNY, @HeavensgateNYC and @NaarakNYC.\n\n' +
                    'After dark, the looks ranged from black lace corsetry and glossy leather to shaggy red fur, tartan and white crochet.',
                credits: [
                    { role: 'Presented by', names: ['@FutureTreasureNY', '@HeavensgateNYC', '@NaarakNYC'] },
                    {
                        role: 'Featuring',
                        names: ['@twiggy.moore', '@zemeta_official', '@techin_underground', '@megbeckstudio', '@cydn3yyy', '@grace__gui', '@hole.xyz'],
                    },
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
            {
                pub: 'Totem',
                logo: 'assets/press/totem-logo.webp',
                title: 'Lakras / Amehl: The Girls Shaking Up Brooklyn\u2019s Migrant Fashion Scene',
                // The year is taken from the date of the Instagram post.
                date: '2026',
                href: 'https://www.instagram.com/p/Dd9GEgVEbr4/',
            },
            {
                pub: 'The Daily Front Row',
                // `logo` is shown instead of the name (white on transparent).
                logo: 'assets/press/the-daily-front-row.webp',
                title: '\u201cThe Elephant in the Room\u201d: HEAVENSGATE NYC\u2019s Runway That Refuses to Whisper',
                // A line under the title (the subtitle) and the writer.
                deck: 'HEAVENSGATE NYC Brings \u2018The Elephant in the Room\u2019 to Bogart House',
                by: 'Tom White',
                date: 'Sep 29, 2025',
                href: 'https://fashionweekdaily.com/the-elephant-in-the-room-heavensgate-nycs-runway-that-refuses-to-whisper/',
            },
            {
                pub: 'Vogue China',
                logo: 'assets/press/vogue-china.webp',
                // PLACEHOLDER title: replace it with the article's headline (and
                // add the year in `date`) once it is known.
                title: 'Featured in Vogue China',
                date: '',
                href: 'https://www.vogue.com.cn/fashion/brand_news/news_11113279578722b8.html',
            },
            {
                pub: 'Vogue Thailand',
                title: 'First time in Vogue: The Treasure',
                date: '2023',
                href: 'project.html?slug=the-treasure',
                logo: 'assets/press/vogue-thailand.webp',
                // `video: true` adds a small "video" tag next to the logo.
                video: true,
            },
            { pub: 'Vogue', title: 'The Platform Redefining Contemporary Fashion', date: '2026' },
            { pub: 'Dazed', title: 'HEAVENSGATE NYC: Where Art Meets Wearable Culture', date: '2025' },
            { pub: 'AnOther', title: 'Inside the World of HEAVENSGATE NYC', date: '2025' },
            { pub: 'i-D', title: 'The Designers Changing the Game', date: '2024' },
            { pub: 'W Magazine', title: 'New Voices in Independent Fashion', date: '2024' },
            { pub: 'Highsnobiety', title: 'The Newest Presentation Is Everything', date: '2024' },
        ],

        // Events. `type: 'Show'` ones also appear on the Shows page. The ones
        // without a slug / image below are PLACEHOLDERS.
        //   href     – makes the card a link to somewhere else
        //   slug     – gives the event its own page (event.html?slug=...)
        //   image    – poster / photo shown on the card (keep it small)
        //   images   – everything shown on the event page, main one first; each
        //              a path or { src, alt, thumb, label }. Every one also floats
        //              on the home page (as `thumb`, a small version, if given,
        //              captioned with `label` if given) and links to the event.
        //   summary  – the text on the event page (blank line = new paragraph)
        //   credits  – [{ role, names: [...] }], same as for projects
        //   project  – slug of a project to take the summary and credits from
        //              (and to link to for its photos)
        //   details  – extra rows shown before the credits, same shape as credits
        //   video / videos – a clip shown first on the event page (same as for
        //              projects); an event also shows its project's video
        //   projectLabel – wording of the link to the project (default "See the photos")
        events: [
            {
                slug: 'sound-form',
                tag: 'Past',
                title: 'SOUND / FORM',
                date: 'Sep 18, 2026',
                location: 'Honey\u2019s, Brooklyn',
                type: 'Show',
                image: 'assets/events/sound-form/thumb-01.webp',
                images: [
                    {
                        src: 'assets/events/sound-form/01-poster.webp',
                        thumb: 'assets/events/sound-form/thumb-01.webp',
                        alt: 'The SOUND / FORM poster: orange-red with the title in a wobbling grey oval. Fashion performances by HEAVENSGATE NYC + sounds by Cultivated Sound. NYFW 26, NYFW closing weekend + Climate Week prelude, 9.18.26, Honey\u2019s. Cultivated Sound: Chamberlain Zhang, Sploofi, Elladotnet.',
                    },
                ],
                // From the poster. The bio, the credits and the link to the photos
                // come from the project with this slug.
                details: [
                    { role: 'Date', names: ['Friday, September 18, 2026'] },
                    { role: 'Venue', names: ['Honey\u2019s, Brooklyn'] },
                    { role: 'Part of', names: ['NYFW 26 closing weekend + Climate Week prelude'] },
                    { role: 'Format', names: ['Fashion performances by HEAVENSGATE NYC + sounds by Cultivated Sound'] },
                ],
                project: 'sound-form',
            },
            {
                slug: 'the-last-human-fashion-show',
                tag: 'Past',
                title: 'The Last Human Fashion Show',
                date: 'Sep 12, 2026',
                location: 'Bogart House, Brooklyn',
                type: 'Show',
                image: 'assets/events/the-last-human-fashion-show/thumb-01.webp',
                images: [
                    {
                        src: 'assets/events/the-last-human-fashion-show/01-red.webp',
                        thumb: 'assets/events/the-last-human-fashion-show/thumb-01.webp',
                        alt: 'Poster in red: a woman\u2019s face with black lipstick repeated four times in red tones, with a white panel reading Saturday September 12 2026, The Last Human Fashion Show, Runway + Afterparty, Bogart House, 5\u20139 PM, 230 Bogart St.',
                    },
                    {
                        src: 'assets/events/the-last-human-fashion-show/02-black-white.webp',
                        thumb: 'assets/events/the-last-human-fashion-show/thumb-02.webp',
                        alt: 'The same poster in black and white with red lettering: New York City, NYFW 26, Who will you be?',
                    },
                ],
                // From the poster. The bio, the rest of the credits and the link to
                // the photos come from the project with this slug.
                details: [
                    { role: 'Date', names: ['Saturday, September 12, 2026'] },
                    { role: 'Time', names: ['5\u20139 PM'] },
                    { role: 'Venue', names: ['Bogart House, 230 Bogart St, Brooklyn'] },
                    { role: 'Format', names: ['Runway + afterparty'] },
                ],
                project: 'the-last-human-fashion-show',
            },
            {
                slug: 'table-manners',
                tag: 'Past',
                title: 'Table Manners',
                date: 'Jul 18, 2026',
                location: '61 Wyckoff Ave, Brooklyn',
                type: 'Show',
                image: 'assets/events/table-manners/thumb-01.webp',
                images: [
                    {
                        src: 'assets/events/table-manners/01-poster.webp',
                        thumb: 'assets/events/table-manners/thumb-01.webp',
                        alt: 'Poster in red, black and grey panels: Table Manners, The Performance, July 18th, 7:00\u20138:30 pm and 9:00\u201310:30 pm, Light Bites + Drinks. A silver serving platter holds a fish and a silver high-heeled sandal. 61 Wyckoff Ave. Brooklyn, NY 11237. The Performers: Cassidy Grady, Skye Kita. HEAVENSGATE \u00d7 R\u00dcME.',
                    },
                ],
                // From the poster. The bio, the credits and the link to the photos
                // come from the project with this slug.
                details: [
                    { role: 'Date', names: ['July 18, 2026'] },
                    { role: 'Time slots', names: ['7:00\u20138:30 PM', '9:00\u201310:30 PM'] },
                    { role: 'Venue', names: ['61 Wyckoff Ave, Brooklyn, NY 11237'] },
                    { role: 'Food & drink', names: ['Light bites + drinks'] },
                ],
                project: 'table-manners',
            },
            {
                slug: 'nyfw-2026-collective-runway',
                tag: 'Past',
                title: 'NYFW 2026 Collective Runway',
                date: 'Feb 14, 2026',
                location: 'Stone Circle Theater, New York',
                type: 'Show',
                image: 'assets/events/velvet-playground-nyfw-2026/thumb-01.webp',
                images: [
                    {
                        src: 'assets/events/velvet-playground-nyfw-2026/01-main.webp',
                        thumb: 'assets/events/velvet-playground-nyfw-2026/thumb-01.webp',
                        alt: 'Main poster: Velvet Playground NYFW 2026 Collective Runway, 2/14/26 8 PM, Stone Circle Theater, glam rock live performance. Two women in a rocky cave, one in a red mesh dress with a pale snake across her.',
                    },
                    {
                        src: 'assets/events/velvet-playground-nyfw-2026/02-bailey-prado.webp',
                        thumb: 'assets/events/velvet-playground-nyfw-2026/thumb-02.webp',
                        label: 'Bailey Prado',
                        alt: 'Poster for Bailey Prado: a model in a white crochet top and layered lace skirt stands against a white wall with a ladder, the name signed beside her.',
                    },
                    {
                        src: 'assets/events/velvet-playground-nyfw-2026/03-when-the-xu-fits.webp',
                        thumb: 'assets/events/velvet-playground-nyfw-2026/thumb-03.webp',
                        label: 'When The Xu Fits',
                        alt: 'Poster for When The Xu Fits: four models in beaded and corseted tops pose close together.',
                    },
                    {
                        src: 'assets/events/velvet-playground-nyfw-2026/04-moore.webp',
                        thumb: 'assets/events/velvet-playground-nyfw-2026/thumb-04.webp',
                        label: 'Moore',
                        alt: 'Poster for Moore: a performer in a lilac bob wig and silver bracelets, in a black fuzzy bandeau and shorts, poses against a dark green background.',
                    },
                    {
                        src: 'assets/events/velvet-playground-nyfw-2026/05-3399.webp',
                        thumb: 'assets/events/velvet-playground-nyfw-2026/thumb-05.webp',
                        label: '3399',
                        alt: 'Poster for 3399: eight models in striped dresses, bright tights and caps pose on a graffiti-covered concrete ledge.',
                    },
                ],
                summary:
                    'Velvet Playground presented the NYFW 2026 Collective Runway on February 14, 2026 at 8 PM at Stone Circle Theater in New York: a group show with a glam rock live performance.\n\n' +
                    'Below, the main poster followed by the posters for Bailey Prado, When The Xu Fits, Moore and 3399.',
                credits: [
                    { role: 'Date', names: ['February 14, 2026, 8 PM'] },
                    { role: 'Venue', names: ['Stone Circle Theater, New York'] },
                    { role: 'Presented by', names: ['Velvet Playground'] },
                    { role: 'On the posters', names: ['Bailey Prado', 'When The Xu Fits', 'Moore', '3399'] },
                    { role: 'Music', names: ['Glam rock live performance'] },
                ],
            },
            {
                slug: 'miss-conduct',
                tag: 'Past',
                title: 'MISS CONDUCT',
                date: 'May 10, 2025',
                location: '360 Jefferson St, Brooklyn',
                type: 'Show',
                image: 'assets/events/miss-conduct/thumb-01.webp',
                images: [
                    {
                        src: 'assets/events/miss-conduct/01-poster.webp',
                        thumb: 'assets/events/miss-conduct/thumb-01.webp',
                        alt: 'Poster in red, purple and black over an illustration of office cubicles: Techno Boy, Heavens Gate, Cassidy Grady and Beatriz Castro present MISS CONDUCT. The performance + the rave: Lethal Trip, Stealthy, MIA, S7IK, Ludite, Ghoulina, Lucy La Dusk. May 10 2025, 9 PM to 5 AM, 360 Jefferson St Brkln NY.',
                    },
                ],
                // From the poster. The bio, the credits and the link to the photos
                // come from the project with this slug.
                details: [
                    { role: 'Date', names: ['Saturday, May 10, 2025'] },
                    { role: 'Time', names: ['9 PM\u20135 AM'] },
                    { role: 'Venue', names: ['360 Jefferson St, Brooklyn, NY'] },
                    { role: 'Format', names: ['Fashion show, performance and techno rave'] },
                ],
                project: 'miss-conduct',
            },
            {
                slug: 'artifice-003',
                tag: 'Past',
                title: 'Artifice 003',
                date: 'Sep 7, 2024',
                location: '305 Ten Eyck St.',
                type: 'Show',
                image: 'assets/events/artifice-003/thumb-01.webp',
                images: [
                    {
                        src: 'assets/events/artifice-003/01-main.webp',
                        thumb: 'assets/events/artifice-003/thumb-01.webp',
                        alt: 'Main poster: Artifice 003, NYFW Showcase, 09 07 2024, 8 PM to late, F/W 2024, RSVP required, Chem Creative, 305 Ten Eyck St. A performer seen from behind in a sculptural white headpiece and spine ornament and a ruffled white skirt, against a dark grey background. White Box: material, culture lounge, Heavensgate x Hub. Black Box: media, Black Box film, Kevin Peter He x Petal Supply.',
                    },
                    {
                        src: 'assets/events/artifice-003/02-schedule.webp',
                        thumb: 'assets/events/artifice-003/thumb-02.webp',
                        label: 'Schedule',
                        alt: 'Schedule poster on black: 8:30 doors open; 9:30 NYFW show, White Box; 10:30 film screening plus Bobi x Fliko, Black Box; 11:00 Kevin Peter He x Petal Supply, Black Box; 11:30 Derek x Rob x Antide, Black Box; 12 AM NYFW aftershow, Black Box; 2 AM doors close.',
                    },
                    {
                        src: 'assets/events/artifice-003/03-white-box-show.webp',
                        thumb: 'assets/events/artifice-003/thumb-03.webp',
                        label: 'White Box show',
                        alt: 'Poster on black: 9:30 NYFW show, White Box: Janice Liu, Evanna, Aguirrrre, Nostylguh, Jobi. Presented by Heavensgate x Hub.',
                    },
                ],
                // From the posters.
                details: [
                    { role: 'Date', names: ['September 7, 2024'] },
                    { role: 'Time', names: ['8 PM\u2013late'] },
                    { role: 'Venue', names: ['305 Ten Eyck St.'] },
                    {
                        role: 'Schedule',
                        names: [
                            '8:30 \u2014 Doors open',
                            '9:30 \u2014 NYFW show, White Box',
                            '10:30 \u2014 Film screening + Bobi x Fliko, Black Box',
                            '11:00 \u2014 Kevin Peter He x Petal Supply, Black Box',
                            '11:30 \u2014 Derek x Rob x Antide, Black Box',
                            '12 AM \u2014 NYFW aftershow, Black Box',
                            '2 AM \u2014 Doors close',
                        ],
                    },
                ],
                summary:
                    'Artifice 003 was a night for NYFW FW24 on September 7, 2024, from 8 PM until late at 305 Ten Eyck St.: a White Box NYFW show, work on screen and two performances in the Black Box, and a culture lounge by @discipline.systems.\n\n' +
                    'Made possible by @artifice.nyc, @heavensgatenyc, @HUB.mode, @discipline.systems and @chemistrycreative.',
                credits: [
                    { role: 'White Box NYFW show', names: ['@janicezhimeng', '@__evanc__', '@aguirrrre__', '@nostylguh.co', '@cloudiejobi'] },
                    { role: 'Black Box on screen', names: ['@sunwanw', '@williamwillsey', '@dirkkoy', '@kat__bot', '@ssarahbankss', '@maximilianprag'] },
                    { role: 'Black Box performance: \u201cBLOOM\u201d', names: ['@kevinpeterhe', '@petalsupplyco'] },
                    { role: 'Black Box performance: \u201cDRY\u201d', names: ['@robruthco', '@elkkkk_____', '@antide_xx'] },
                    { role: 'Culture lounge by', names: ['@discipline.systems'] },
                    { role: 'Work shown', names: ['@e__xu', '@zao.zzz', '@xueman9511', '@qiaosenstudio'] },
                    { role: 'Made possible by', names: ['@artifice.nyc', '@heavensgatenyc', '@HUB.mode', '@discipline.systems', '@chemistrycreative'] },
                ],
            },
            {
                slug: 'studio-dem-heavensgate-popup',
                tag: 'Past',
                title: 'Studio Dem \u00d7 HEAVENSGATE Pop-Up',
                date: 'Mar 4\u201324, 2024',
                location: '241 Wythe Ave, Brooklyn',
                type: 'Pop-up',
                image: 'assets/events/studio-dem-heavensgate-popup/thumb-01.webp',
                images: [
                    {
                        src: 'assets/events/studio-dem-heavensgate-popup/01-poster.webp',
                        thumb: 'assets/events/studio-dem-heavensgate-popup/thumb-01.webp',
                        ratio: 1,
                        alt: 'Poster: Studio Dem + Heavensgate pop-up, 2024 March 4 to 24, 1:00 to 6:00 PM, Tuesday to Sunday, 241 Wythe Ave, Brooklyn NY. Black script lettering on white with pink gradient flower shapes.',
                    },
                ],
                summary:
                    'A curated fashion and art shop for 10+ independent designers and artists, by @studio_dem and @heavensgatenyc: a new selection of clothing, accessories, jewelry, art, and more.\n\n' +
                    'Bring your friends to find the most unique pieces. There were also Sip & Shop events on two Fridays during the run, for the ultimate shopping experience.',
                credits: [
                    { role: 'Dates', names: ['March 4\u201324, 2024'] },
                    { role: 'Hours', names: ['Tuesday to Sunday, 1:00\u20136:00 PM'] },
                    { role: 'Venue', names: ['241 Wythe Ave, Brooklyn, NY'] },
                    { role: 'Presented by', names: ['@studio_dem', '@heavensgatenyc'] },
                    { role: 'Featuring', names: ['10+ independent designers and artists'] },
                ],
            },
            {
                slug: 'the-treasure',
                tag: 'Past',
                title: 'The Treasure',
                date: 'Sep 2023',
                location: 'New York',
                type: 'Show',
                details: [
                    { role: 'Date', names: ['New York Fashion Week, September 2023'] },
                    { role: 'Format', names: ['Runway + after party'] },
                ],
                // The bio, credits and video come from the project with this slug.
                project: 'the-treasure',
                projectLabel: 'See it in the gallery',
            },
            { tag: 'Upcoming', title: 'SS27 Presentation', date: 'March 2027', location: 'Paris', type: 'Show' },
            { tag: 'Upcoming', title: 'HEAVENSGATE × Archive Pop-Up', date: 'Nov 2026', location: 'Tokyo', type: 'Exhibition' },
            { tag: 'Past', title: 'FW26 Runway Show', date: 'Sep 2026', location: 'New York', type: 'Show' },
            { tag: 'Past', title: 'Group Exhibition: Material Studies', date: 'Jun 2026', location: 'London', type: 'Exhibition' },
            { tag: 'Past', title: 'SS26 Collection Launch', date: 'Feb 2026', location: 'Paris', type: 'Show' },
            { tag: 'Past', title: 'Concept Store Opening', date: 'Oct 2025', location: 'Seoul', type: 'Retail' },
        ],
    }
})()
