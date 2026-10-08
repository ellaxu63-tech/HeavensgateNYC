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
| `connect.html`  | Contact                                                                    |
| `press.html`    | Press list                                                                 |
| `events.html`   | Events (upcoming + past)                                                   |
| `shows.html`    | Events of type "Show"                                                      |
| `about.html`    | About                                                                      |

## Editing content

**Everything lives in [`js/data.js`](js/data.js)**: the intro sentence, contact
email, menu links, projects, press and events.

> The projects, press items, events and the `hello@example.com` address are
> **placeholders**. Replace them before launch.

To add a project, add an entry to `projects` and drop its image into
`assets/projects/`. It automatically appears on the home page, in the gallery,
and gets its own page. Add an `href` to a press item or event to turn it into a
link.

## How the old Framer overrides map to this site

| Framer override                         | Now                                                                 |
| --------------------------------------- | ------------------------------------------------------------------- |
| `withProjectPhysics`                    | `js/physics.js` — same placement, drift, hover and drag-trail logic |
| `withMotionToggle`                      | PAUSE / RESUME button (`js/layout.js`)                              |
| `withProjectNavigationCollapse` (+ aliases) | Nav fades out and becomes inert while a project is active (`js/layout.js` + CSS) |
| `withNavMenu`                           | MENU overlay, built on every page (`js/layout.js`)                  |
| `withNavPillLinks`                      | PRESS / EVENTS pills beside MENU (`js/layout.js`)                   |
| `withPressPage`, `withEventsPage`       | `press.html`, `events.html` (`js/pages.js`)                         |
| `TokonomaVerticalPills`                 | ABOUT / SHOWS vertical pills on the home page                       |
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
- The DRAG TO MOVE pill fades while a project is selected.

## Tuning

The home page feel is controlled by the `PHYSICS` and `DRAG` objects at the top
of [`js/physics.js`](js/physics.js) (drift, friction, hover scale, drag trail
colour / strength). Colours and spacing are CSS variables at the top of
[`css/styles.css`](css/styles.css).

## Accessibility

Keyboard users can tab to a project (it is isolated exactly like a hover), open
the menu with Enter and close it with Esc, and there is a skip link. The custom
cursor only appears with a mouse; touch devices keep their normal behaviour. With
`prefers-reduced-motion` the images stay still and hover changes happen
instantly.
