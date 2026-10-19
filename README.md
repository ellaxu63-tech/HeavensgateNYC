# HEAVENSGATE NYC

A plain HTML / CSS / JavaScript website. No framework, no build step, no
dependencies. It started life as a set of Framer code overrides and has been
rewritten to run as a normal site.

## Run it

Double-click `index.html`, or serve the folder with any static server:

```sh
python3 -m http.server 8000     # then open http://localhost:8000
```

To publish, upload the folder as-is to any static host (GitHub Pages, Netlify,
Cloudflare Pages, S3, …). All links are relative, so it also works from a
sub-folder such as `https://you.github.io/HeavensgateNYC/`.

## Pages

| File            | What it is                                                                 |
| --------------- | -------------------------------------------------------------------------- |
| `index.html`    | Home: floating project images around the intro text                        |
| `gallery.html`  | Every project in a grid                                                    |
| `project.html`  | One project (`project.html?slug=runway-01`)                                |
| `studio.html`   | What the studio does                                                       |
| `connect.html`  | Contact, and the mailing list sign-up                                      |
| `apply.html`    | The list of forms (designers, crew)                                        |
| `designers.html`| The designers' application, one question at a time                         |
| `crew.html`     | The crew sign-up (hair and makeup, video), one question at a time          |
| `volunteers.html`| The volunteer sign-up (photography and more), one question at a time      |
| `press.html`    | Press list                                                                 |
| `events.html`   | Events (upcoming + past)                                                   |
| `shows.html`    | Events of type "Show"                                                      |
| `event.html`    | One event with its posters (`event.html?slug=nyfw-2026-collective-runway`) |
| `about.html`    | About                                                                      |

## Editing content

**Everything lives in [`js/data.js`](js/data.js)**: the intro sentence, contact
email, the Instagram link (`instagramUrl`, the icon at the bottom right of every
page), menu links, projects, press and events.

## Mailing list

The Connect page has a sign-up form (and the menu and footer get a MAILING LIST
link), but it stays hidden until it is connected. A static site can't keep
emails itself, so the sign-ups go to a mailing service that stores the list and
sends the emails (Sender, Mailchimp, Kit, Buttondown, Brevo, ...). Make an account
there and create a sign-up form. Then in [`js/data.js`](js/data.js), under `newsletter`,
put the form's page address in `link` (the Connect page then shows a "Join the list"
link that opens it), or for Sender set `senderAccount` and `senderForm` (Sender's script
then loads on every page and the form appears on the Connect page, with the link as the
fallback; this is what is live now), or paste the form's embed code into `embed`
(it is shown inside the Connect page as the service made it; in Sender: Forms, create an
embedded form, copy the code), or keep this site's own form by filling in:

- `action`: the address in the embed code's `<form action="...">`
- `emailField`: the `name` of its email input (`EMAIL`, `email_address`, ...)
- `fields`: any hidden inputs it has, as `{ name: 'value' }`

A big **JOIN THE LIST** popup (every page except Connect) opens when someone clicks a
MAILING LIST link, and by itself on the home page: `popupDelay` is the seconds after the site
opens (`0`, the default, is right away, with the home page's opening animation waiting behind it
until it is closed; `false` turns the automatic opening off). It does not come back during that
visit, so a reload does not bring it back but a new tab does; `popupDays` above 0 also keeps it
away for that many days. A link ending in `#join` (for example `https://heavensgate.nyc/#join`,
good for Instagram) opens it straight away.

The form posts the address in the background and shows `success` underneath. The
service sends the confirmation email, and you send your announcements from its
dashboard. A hidden field catches bots.

## Forms (designers, crew)

`apply.html` lists the forms, and each one has its own page: `designers.html`, `crew.html` and `volunteers.html`
(`apply.html?form=<id>` works too). A form shows one question per screen, with an intro first and
a thank-you at the end. The questions, texts and answer choices are in
[`js/data.js`](js/data.js) under `form.forms`: add, remove or reword them there. A question can depend on an earlier answer
(`showIf`: the video quote is only asked of video applicants). A form can also say which show it
is for (`show`: title, date, text): that appears on its first screen and is saved as a "show" column. To add a third
form, add another entry there and copy `crew.html` to a new page with its `data-form` changed.

Like the mailing list, nothing shows (the pages say "Not open yet", and there is no APPLY link)
until the forms are connected. There are two ways, and they can be mixed:

- **Google Sheet (this site's own forms):** put the script's address in `form.action` (steps
  below). To click through the forms without sending anything, set `action: 'preview'`.
- **Google Forms:** make a form at forms.google.com and put its address in that form's `link`.
  The form then opens it in a new tab instead of showing these questions, and no script is needed.
  (Google Forms keeps the answers in its own Responses tab and can email you about each one.)

### Receiving the forms

Each submission becomes a **row in a Google Sheet** (one tab per form: Designers, Crew, Volunteers) and is
**emailed to info@heavensgateny.com**. No account other than Google is needed.

1. Make a new Google Sheet (sheets.new). Name it, e.g., "HEAVENSGATE forms".
2. In it: **Extensions → Apps Script**. Delete what is there, paste in the whole of
   [`apps-script/receive-form.gs`](apps-script/receive-form.gs) and save. (Change
   `NOTIFY_EMAIL` at the top if the emails should go to another address.)
3. **Deploy → New deployment**. Click the gear next to "Select type" and choose
   **Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then **Deploy**.
4. Google asks you to authorise it. Choose your account; if it warns the app is
   "unverified" (it is your own script), click **Advanced → Go to … (unsafe) → Allow**.
5. Copy the **Web app URL** (it ends in `/exec`) and paste it into
   `form.action` in `js/data.js`.

The tabs appear in the sheet when the first answer for that form arrives. If you edit the script
later: **Deploy → Manage deployments → pencil → Version: New version → Deploy** (the address
stays the same). Submissions that arrive while the script is broken are not kept, so test by
sending one yourself after any change.

> Everything on the site is real content now.

To add a project, add an entry to `projects` and drop its image into
`assets/projects/`. It automatically appears on the home page, in the gallery,
and gets its own page. Anything you add without real content (an image or a
video) will look empty, so only add finished entries. The first entry is the first one in the gallery. Add an
`href` to a press item or event to turn it into a link.

Any photo in a project's `images` can also float on the home page, beside the
sentence: give it `home: 'left'` or `home: 'right'`, a small `thumb` and its
`ratio`. Those cards are placed first, in the gap on that side of the text, and
stay there (the other images are pushed around them). They link to the project
and appear on windows about 1180px wide or more, where there is room beside the
sentence; on narrower screens they are left out so it is less crowded.

A project can also have (all optional, see the comment above `projects`):
`year`, a `summary` (the bio; a blank line starts a new paragraph), `images`
(every photo for the project page, in order; each a path or `{ src, alt }`),
`video` (a clip shown first on the project page: a file in
`assets/projects/<project>/`, or a YouTube / Vimeo link; a YouTube / Vimeo video also gets a big
title under the player that links to it on YouTube / Vimeo, and if YouTube can't be reached the
player is hidden and only that title is left) and `credits` (role + names;
anything written like `@handle` links to that Instagram profile).

Events work the same way: add one to `events`. Give it a `slug`, an `image` (the
poster shown on its card) and `images` (all the posters, main one first) and
the card links to its own page; `summary` and `credits` fill that page. Every
poster in `images` also floats on the home page with the projects (use `thumb`
for a small version and `label` for its caption) and links to the event.

## The video on the home page

`homeVideo` in `js/data.js` is the clip that floats on the home page as a
thumbnail (its poster image, with a play button). Clicking it opens a full-screen
player; Esc, CLOSE or a click outside closes it. The cursor says PLAY over it.
Replace `src` / `poster` / `caption`, or delete the block to remove it. Keep the
file small (an MP4 under about 15 MB is safe).

## How the old Framer overrides map to this site

| Framer override                         | Now                                                                 |
| --------------------------------------- | ------------------------------------------------------------------- |
| `withProjectPhysics`                    | `js/physics.js` — same placement, drift, hover and drag-trail logic |
| `withMotionToggle`                      | PAUSE / RESUME button in the home footer bar (`js/layout.js`)       |
| `withProjectNavigationCollapse` (+ aliases) | Nav fades out and becomes inert while a project is active (`js/layout.js` + CSS) |
| `withNavMenu`                           | MENU overlay, built on every page (`js/layout.js`)                  |
| `withNavPillLinks`                      | GALLERY / PRESS / EVENTS links beside MENU (`js/layout.js`)         |
| `withPressPage`, `withEventsPage`       | `press.html`, `events.html` (`js/pages.js`)                         |
| `TokonomaVerticalPills`                 | ABOUT / SHOWS links in the home page footer bar                     |
| `TokonomaNumberedList`                  | The numbered rows in the MENU overlay                               |
| Custom cursor (dot → OPEN pill)         | `js/cursor.js`, now on every page                                   |
| Framer `createStore`                    | `js/store.js`                                                       |

Things that existed only because of Framer were dropped: `RenderTarget` /
`useIsStaticRenderer` canvas checks, the `MutationObserver` that re-discovered
CMS cards (cards are now created once from data), and the code that restored
Framer's inline styles on unmount. `TokonomaPillNav` (ANALOG / AI / LABZ) was
left out because no page uses it.

Behaviour you may notice compared with the Framer version:

- Card height no longer depends on caption wrapping, and cards are capped so
  they fit in the space above *and* below the intro text. Without that, on
  smaller screens every card ended up in the one strip tall enough for it.
- A hovered card now stays where it is and shrinks to fit rather than jumping to
  another part of the screen, and it keeps growing after PAUSE.

## Look: grid and fonts

The layout is built on thin grid lines: a line near each side edge, a centre
line, and horizontal rules under the header and above the footer. Pages split
at the centre line (title on the left, text on the right). The lines are drawn
once in [`css/styles.css`](css/styles.css) and reused by the header, footer and
menu so they run straight through. On narrow screens the centre line is dropped
and everything becomes a single column.

Fonts are self-hosted in `assets/fonts/` (no external requests):
**Instrument Serif** for big text and the wordmark, **Geist Mono** for
everything small (uppercase labels, captions, body copy).

The logo is `assets/logo.png` (white artwork on a transparent background, so it
works on any colour; square, always shown with width = height). It is also used,
on black, for the favicon and touch icon. To swap it, replace those three files
and keep them square.

The name is always written in capitals: HEAVENSGATE / HEAVENSGATE NYC stays
uppercase even inside the lowercase serif text (`HG.capsBrand` in
`js/components.js` wraps it in `.caps`). `@heavensgatenyc` handles are left as
they are.

Knobs at the top of `css/styles.css`:

| Variable           | What it does                                                         |
| ------------------ | -------------------------------------------------------------------- |
| `--gutter`         | How far the side lines sit from the screen edge (text starts at 2×)  |
| `--grid`           | Colour / strength of the grid lines                                  |
| `--display-case`   | `lowercase` (default) or `none` for serif text exactly as typed      |
| `--accent`         | The pink (from the reference poster): the MENU pill                  |
| `--bg` / `--fg`    | Background and text colour (with `--bg-rgb` / `--fg-rgb`)            |
| `--serif`, `--mono`| The two font stacks                                                  |

## Drawing on the home page

Dragging anywhere on the home page nudges the images and draws a flat white
ribbon with a soft shadow under it, like the white swooshes on the "the sin :
vanish" poster: thick where you move slowly, thin where you move fast, pointed
at both ends. It fades a second after you let go. The look of the stroke (its
colour and shadow) is `STYLE` at the top of [`js/ribbon.js`](js/ribbon.js); the
same stroke is used by the self-drawing flourish.

To make that obvious: the cursor is a star that spins slowly over the page (and
faster while drawing) with a tiny DRAG TO DRAW label beside it, and until
someone has drawn, a flourish draws itself every few seconds (up to four times,
never with reduced motion). The demo stops for the rest of the visit as soon as
someone draws; the cursor label stays.

The star is `HG.STAR_PATH` in `js/components.js` (traced from the reference
image); the cursor uses it.

## The fall

Hovering (or focusing) an image on the home page makes the writing around it drop
to the floor: the nav pills, MENU, the wordmark, the logo, the bottom bar and
every word of the intro sentence fall with gravity, bounce, tumble and pile up
along the bottom edge. Moving off the image springs them back. It is
`js/collapse.js`; the numbers at the top of it (gravity, bounce, tilt, how
many land upside down, how fast they return) change how it feels. It works on
copies, so the page itself never moves. With reduced motion, nothing falls and
the writing just fades out.

## Tuning

The home page feel is controlled by the `PHYSICS`, `DRAG` and `GHOST` objects at
the top of [`js/physics.js`](js/physics.js): drift, friction, hover scale, and
for the drawing the ribbon width, taper, fade time
and the self-drawing demo's timing.

## Accessibility

Keyboard users can tab to a project (it is isolated exactly like a hover), open
the menu with Enter and close it with Esc, and there is a skip link. The custom
cursor only appears with a mouse; touch devices keep their normal behaviour. With
`prefers-reduced-motion` the images stay still and hover changes happen
instantly.
