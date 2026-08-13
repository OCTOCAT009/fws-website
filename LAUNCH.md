# Launch checklist

Everything outstanding as of the last commit, in the order it should happen.
Tick things off in place, or convert each section to GitHub Issues.

---

## 1. Deploy — do this before anything else

**The sitemap lists 25 URLs and ~17 of them are new.** Submitting it to Search
Console while the old site is still live means Google crawls 17 pages, gets 404s,
and records "Submitted URL not found" against the domain. That is slower to undo
than simply waiting.

- [ ] Deploy the current `main` to forthworthstudios.space
- [ ] Spot-check that these return **200**, not 404:
      `/animated-websites.html` · `/case-turiya.html` · `/web-design-india.html` · `/blog.html`
- [ ] Confirm `/sitemap.xml` and `/robots.txt` are reachable

**There is no deploy config in this repo** — no `netlify.toml`, no `vercel.json`,
no `CNAME`, no GitHub Actions. Whatever publishes the site today lives outside it.
Connecting this repo to Netlify or Cloudflare Pages would give push-to-deploy for
free and is worth doing while the site is small.

## 2. Search Console — only after deploy

- [ ] Sitemaps → submit `sitemap.xml`
      (the property should still be verified; `google2d4283a29db5d40e.html` is in the repo)
- [ ] URL Inspection → **Request Indexing** for the homepage and two or three
      priority pages. This jumps the queue for the ones that matter.
- [ ] Expect days to weeks. Nothing is wrong if it is slow.

## 3. Blocking — fix before driving any traffic

- [ ] **Turn analytics on.** `FW_GA4` and `FW_PLAUSIBLE` at the top of `app.js` are
      both empty, so every `fwTrack()` call no-ops. 17 new pages are about to go
      live targeting specific keywords with no way to tell which ones work.
      One line: paste a GA4 measurement ID or the domain for Plausible.
- [ ] **Send a real test through the contact form.** It posts to
      `https://formspree.io/f/meedvzyb`. That endpoint has never been observed
      working in this codebase. Confirm the submission lands in the right inbox.
      A silently broken form on a site you are promoting is the worst failure mode.
- [ ] **Two phone numbers are now live** — `+91 7452905923` (contact page and
      schema) and `+91 90270 26274` (Sales, on every services tab). Confirm both
      are answered.

## 4. Highest leverage — not code, but worth more than any code change

- [ ] **Backlinks from the five client sites.** A "Site by Forth Worth Studios"
      line in the footer of Turiya, Street Error, Onlyreesh, Resentening and
      Chanakya. Five contextual links from real, relevant sites that you control
      outright. This is the single biggest SEO lever available and it is free.
- [ ] **Claim a Google Business Profile.** For anything "web design delhi"-shaped
      the map pack takes most of the clicks. Costs nothing.
- [ ] **Get testimonials.** Five happy clients, zero quotes anywhere on the site.
      Removing the stats left a hole here that nothing fills.

## 5. Smaller, whenever

- [ ] `.gitattributes` with `* text=auto eol=lf` — Git currently normalises to
      CRLF on checkout, so the first clone on a Mac will show every text file as
      modified.
- [ ] `work.html` is **48 words** on a priority-0.9 page. It works as a hub
      (its cards link to all five case studies) but carries almost no text.
      Making it scrollable with a real intro would fix that.
- [ ] Per-page OG images — all 25 pages currently share one `og-image.png`.
- [ ] Rename `110d81a03bf148651239a5576cea13fb_720w.mp4`. Anyone who opens
      devtools sees an unrenamed download.
- [ ] Decide on the loader. It still plays on the first visit of a session.
      Cross-document view transitions now handle the between-page flash, which
      was its other job.

---

## Notes for whoever verifies this next

**Chrome headless on Windows clamps `--window-size` to about 500px minimum.**
Narrow screenshots therefore render a 500px page and simply crop it, which looks
exactly like a layout bug and is not one. This cost an hour once already. Use
`Emulation.setDeviceMetricsOverride` and measure `documentElement.clientWidth`.

**Structural checks do not catch visual faults.** A CSS specificity bug once made
every CTA label render the same red as its own background — invisible text on 17
pages — while every automated check passed: valid schema, correct canonicals, no
broken links. Render the page and look at it.

**`body{overflow-x:hidden}` hides horizontal overflow rather than showing a
scrollbar.** Content that runs past the viewport is clipped silently, so it will
not announce itself.
