# fws-website

The Forth Worth Studios marketing site — [forthworthstudios.space](https://forthworthstudios.space).

Plain, hand-written HTML. No framework, no build step, no bundler. Every page is
directly editable and directly deployable. Two shared files carry everything:
`style.css` and `app.js`.

```
*.html              one file per page; blog-*.html are articles
style.css           design tokens, shared components, @font-face
app.js              all behaviour; every block no-ops if its markup is absent
fonts/              self-hosted woff2 (see "Fonts" below)
shot-*.webp|jpg     screenshots of live client sites
_src/               unedited masters — originals for the compressed assets
sync-chrome.py      rewrites the nav + footer across every page
```

## Running it locally

Any static server works:

```bash
python -m http.server 8765
```

Then open <http://localhost:8765>. There is nothing to install or compile.

## Editing the nav or footer

**Do not edit them by hand.** They are duplicated into every page, so they drift.
Edit `NAV` / `FOOTER` at the top of `sync-chrome.py`, then:

```bash
python sync-chrome.py
```

It rewrites both blocks in every page and sets `class="active"` on the current
one. Any `blog-*.html` file lights up the Journal tab automatically.

## Adding a blog post

1. Copy an existing `blog-*.html` as `blog-<slug>.html`.
2. Update `<title>`, the meta description, the canonical, the OG tags, and both
   JSON-LD blocks (`BlogPosting` + `BreadcrumbList`) — the dates in all three
   places must match.
3. Add a `.post-card` entry to the list in `blog.html`, and add the post to the
   `blogPost` array in that page's `Blog` schema.
4. Add a `<url>` entry to `sitemap.xml`.
5. Run `python sync-chrome.py`.

## Fonts

Self-hosted, same-origin — there is no `fonts.googleapis.com` request. The
`@font-face` rules live at the top of `style.css` and only the weights actually
used are present; `unicode-range` keeps the `latin-ext` files dormant unless a
page needs them.

If you add a weight or family, download the woff2 into `fonts/` and add a matching
`@font-face` rule. Don't re-add a Google Fonts `<link>` — it is render-blocking
and costs two extra DNS/TLS handshakes.

Two faces are preloaded in every page `<head>` (Big Shoulders 900, Barlow 400).
Change those only if the first paint changes.

## Design tokens

Set in `:root` in `style.css`. The two that matter most:

- **Motion** — `--e` (one easing) and `--t1` / `--t2` / `--t3` (three durations).
  Everything that moves uses these. Don't hand-roll a duration.
- **Red** — `--red` is rationed to money, the primary action, and one heading
  accent per screen. Decorative labels use `--quiet`. Adding red to a new label
  is almost always the wrong call.

Greys are tuned to clear WCAG AA on the black background (`--muted` 5.9:1,
`--dim` 4.7:1). Re-check contrast before darkening them.

## Analytics

Off by default. Paste a GA4 measurement ID or a Plausible domain into the two
constants at the top of `app.js` to switch it on; every `fwTrack()` call no-ops
until you do.

## Regenerating assets

Client screenshots were captured with headless Chrome at 1440×900 and resized to
1100×688:

```bash
chrome --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1440,900 --virtual-time-budget=6000 \
  --screenshot=out.png https://example.com
```

Compressed assets have their originals in `_src/`. `work-bg.mp4` is a heavily
reduced encode (540×960, 15fps) — it looks fine only because CSS renders it at
`brightness(.32)` behind a vignette. Re-encode from `_src/work-bg-original.mp4`
if that ever changes.
