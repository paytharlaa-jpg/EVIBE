# EVIBE Mobility Solutions: website

Immersive multi-page site for evibemobility.com. Vite + React + React Router, React Three Fiber (3D),
GSAP ScrollTrigger + Lenis (scroll choreography), postprocessing (bloom).

Pages: `/` (home film), `/about`, `/services`, `/gallery`, `/testimonials`, `/faq`, `/contact`.

## Run it

```
npm install
npm run dev        # http://localhost:5173
npm run build      # production files in dist/
npm run preview    # serve dist/ locally
```

## Deploy

`npm run build`, then upload the contents of `dist/` to any static host
(Netlify, Vercel, Cloudflare Pages, Hostinger, cPanel `public_html`). No server code is needed.
Point evibemobility.com at it and enable HTTPS.

Page URLs like /about need the host to serve `index.html` for every path. The rules are already
included: `_redirects` (Netlify), `vercel.json` (Vercel) and `.htaccess` (Apache, cPanel, Hostinger).
Make sure the hidden `.htaccess` file is uploaded too.

## Change the text

All copy lives in `src/content.js`: services, process steps, numbers, FAQs, testimonials,
contact details. Edit there and rebuild.

**Before launch, replace:**
- `testimonials`: these are drafts written as samples. Use real customer quotes.
- `impact.stats` and the service tags (kW ranges etc.): check they match what EVIBE offers.
- Gallery photos: currently stock photos. Replace with photos of EVIBE's own installs when available.

## Change photos

Put new photos in `../images`, map them in `scripts/prepare-assets.mjs`, then run `npm run assets`.
It creates AVIF + WebP at 800 and 1600 px in `public/img/`.

## How it is built

- `src/story/`: the home page film. `timeline.js` turns scroll progress into everything you see
  (car position, speed, battery, camera shots, cable plug-in, charging effects). `StoryScene.jsx`
  is the 3D scene, `Station.jsx` the EVIBE charging station with the moving cable and lightning,
  `Cars.jsx` the cars, `World.jsx` the night highway. `Story.jsx` holds the text and dashboard on top.
- 3D cars (`public/models/`): Mustang, Challenger and Mercedes-AMG C63, exported from the
  supplied .blend files with `scripts/blender/export.py` (configs in `scripts/blender/*.json`):
  badges, number plates and exhausts removed, modifiers applied, wheels split into four
  spinning nodes, Draco-compressed (decoder in `public/draco/`). Real-car materials (clear-coat
  paint, glass, chrome, rubber, lights) are rebuilt in `src/story/carMaterials.js`, where each
  car's paint colour is set. Re-export: `blender -b <car.blend> --python scripts/blender/export.py -- scripts/blender/<car>.json`.
  Preview any car at `/dev/carview.html?car=mustang&paint=%230561DF` while `npm run dev` runs.
- `src/services/`: the Services page film "Three drivers, one network" (home garage with a wall
  box → workplace car park → highway DC hub). `timeline.js` holds the camera path, charge levels and
  chapter timing; `ServicesScene.jsx` the three 3D sets; `ServicesFilm.jsx` the text, counters and rail.
- `src/components/Loader.jsx`: the cinematic logo trailer, sound on by default. A short still
  pre-roll waits (max 4 s) for the 3D to be prepared so the trailer never stutters. Browsers hold
  audio until the first click/tap/key; the corner button shows "Tap for sound" until then and
  remembers if a visitor turns sound off.
- `src/lib/sfx.js`: Hollywood-trailer sound design (riser with suck-back, distorted BRAAM with sub
  drop, whoosh-hits with taiko thuds, metallic ticks, power surge, heartbeat tension drone,
  reverse swell + final hit), synthesised live with the Web Audio API. No audio files.
- `src/lib/transition.jsx`: page-to-page curtain (the three logo blades).

- `src/three/Charger.jsx`: the original EVIBE charging pillar, modelled in code. The extruded logo
  blades come from the official symbol SVG; its screen shows the live battery level.
- `src/pages/*`: one file per page. `src/sections/*`: reusable sections.
- Enquiries: WhatsApp (pre-filled message), phone and email. The contact form opens WhatsApp or
  the visitor's email app with the details filled in, so no backend is required.

## Performance and accessibility

- The 3D scene is lazy-loaded behind the logo intro. Rendering pauses when the charger is
  off-screen or the tab is hidden, and the resolution adapts to device speed.
- No WebGL support: a static logo replaces the 3D.
- `prefers-reduced-motion`: no smooth scroll, no pinning or travel, and the content is laid out statically.
- Keyboard: skip link, visible focus, Escape closes the menu and lightbox.

## QA scripts (optional)

Headless Chrome scripts: `shots.mjs` (scroll the home page), `story.mjs` (frames of the film at chosen
progress values), `pages.mjs` (every page + a transition), `roundtrip.mjs` (Home → About → Home → Back),
`loader.mjs` (intro frames).
