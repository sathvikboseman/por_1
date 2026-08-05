# Sathvik Sreeram — Portfolio

A static portfolio site. No build step, no framework, no dependencies —
just HTML, CSS, JS, and images, deployed as-is.

## What changed from the original repo

The original `index.html` was 5.5 MB because every photo (and the CV PDF)
was embedded directly in the HTML as base64 text. That's now split out:

```
por_1/
├── index.html      86 KB  — page markup (was 5.5 MB)
├── styles.css      32 KB  — all styling (was inline <style>)
├── script.js        6 KB  — page behavior (was inline <script>)
├── cv.pdf                 — the downloadable CV (was inline base64)
├── images/                — all 70 photos as real files
└── vercel.json             — deploy settings
```

Nothing about how the site *looks* changed — same content, same design.
It's just now made of files you can open, read, and edit normally instead
of one giant line of text.

## Editing content

- **Text** (name, bio, project descriptions, etc.) → edit directly in
  `index.html`. It's readable HTML now — search for the text you want to
  change (e.g. `Cmd/Ctrl+F` for "Chess Game Outcome Prediction") and edit
  it in place.
- **Photos** → replace files in `images/` (keep the same filename to avoid
  updating references, or update the `<img src="/images/...">` /
  `background-image` references in `index.html` if you rename).
- **CV** → replace `cv.pdf` with your updated resume, same filename.
- **Colors / fonts / spacing** → `styles.css`.
- **Interactive behavior** (scroll effects, menu toggles, etc.) → `script.js`.

## Deploying / editing live on Vercel

This is already a zero-config static site, so Vercel needs no build
command — it just serves the files.

**If this repo is already connected to Vercel** (the original had a
`por-1.vercel.app` deployment), you don't need to change anything in
Vercel's settings. Just:

```bash
git add .
git commit -m "Split monolithic index.html into editable files"
git push
```

Vercel will auto-redeploy on push, same as before.

**If you want to edit directly in the browser without a local setup**,
open the repo in Vercel's built-in web editor:
1. Go to [vercel.com/new](https://vercel.com/new) and import
   `sathvikboseman/por_1` if it isn't already a Vercel project.
2. Open the project → **Source** tab (or use
   [vercel.com/\<your-username\>/\<project\>/source](https://vercel.com))
   to edit files directly and trigger a redeploy from the browser.
3. Alternatively, GitHub's own web editor (press `.` on the repo page) works
   fine too, and pushes trigger the same auto-deploy.

**From scratch (not connected to Vercel yet):**
```bash
npm i -g vercel
vercel        # first run: link/create the project
vercel --prod # deploy to production
```
No framework preset needed — choose "Other" if asked.
