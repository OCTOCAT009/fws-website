#!/usr/bin/env python3
"""
Sync the shared nav + footer into every page.

The nav, mobile menu and footer used to be copy-pasted into each HTML file, so a
change meant editing 8 files by hand and they drifted apart. Edit NAV and FOOTER
below, run `python sync-chrome.py`, and every page is rewritten to match.

The pages stay plain, directly-editable, directly-deployable HTML — this only
rewrites the two shared blocks, nothing else on the page is touched.
"""
import io, re, sys, glob, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# {A:xxx} marks where class="active" goes for the current page.
NAV = '''<nav id="nav">
  <a href="index.html" class="nav-logo" aria-label="Forth Worth Studios — Home"><img src="logo.png" alt="Forth Worth Studios" width="383" height="204"/></a>
  <div class="nav-links">
    <a href="work.html"{A:work}>Work</a>
    <a href="services.html"{A:services}>Services</a>
    <a href="why-forthworth.html"{A:why-forthworth}>Why ForthWorth</a>
    <a href="about.html"{A:about}>About</a>
    <a href="blog.html"{A:blog}>Journal</a>
    <a href="contact.html"{A:contact}>Contact</a>
  </div>
  <a href="contact.html" class="nav-cta">Let's Build</a>
  <button class="nav-burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
</nav>
<div class="mobile-menu" id="mobileMenu">
  <a href="work.html">Work</a><a href="services.html">Services</a><a href="why-forthworth.html">Why ForthWorth</a><a href="about.html">About</a><a href="blog.html">Journal</a>
  <a href="contact.html">Contact</a>
</div>'''

FOOTER = '''<footer>
  <div><div class="f-logo">FORTH<span>.</span>WORTH</div><div class="f-tag">We build what others can't imagine.</div></div>
  <div class="f-right">
    <div class="f-links"><a href="work.html">Work</a><a href="services.html">Services</a><a href="why-forthworth.html">Why ForthWorth</a><a href="about.html">About</a><a href="blog.html">Journal</a><a href="contact.html">Contact</a><a href="https://instagram.com/forthworth.studios" target="_blank" rel="noopener noreferrer">Instagram</a></div>
    <div class="f-note">© 2026 Forth Worth Studios · Delhi → Worldwide · <a href="privacy.html">Privacy</a></div>
  </div>
</footer>'''

NAV_RE = re.compile(
    r'<nav id="nav">.*?</nav>\s*<div class="mobile-menu" id="mobileMenu">.*?</div>',
    re.S)
FOOTER_RE = re.compile(r'<footer>.*?</footer>', re.S)


def nav_for(page):
    """Fill in class="active" for whichever nav item matches this page."""
    # every blog-*.html article should light up the Journal tab, not nothing
    if page.startswith('blog'):
        page = 'blog'
    out = NAV
    for m in re.findall(r'\{A:([a-z-]+)\}', NAV):
        out = out.replace('{A:%s}' % m, ' class="active"' if m == page else '')
    return out


def main():
    changed, checked = [], 0
    for f in sorted(glob.glob('*.html')):
        if f.startswith('google'):       # search-console verification stub
            continue
        checked += 1
        src = io.open(f, encoding='utf-8').read()
        page = os.path.splitext(f)[0]
        out = src

        if NAV_RE.search(out):
            out = NAV_RE.sub(lambda _: nav_for(page), out, count=1)
        else:
            print('  !! no nav block found in %s' % f)

        # work.html is a full-bleed page with no footer — that's intentional
        if FOOTER_RE.search(out):
            out = FOOTER_RE.sub(lambda _: FOOTER, out, count=1)

        if out != src:
            io.open(f, 'w', encoding='utf-8').write(out)
            changed.append(f)

    print('checked %d pages, updated %d%s'
          % (checked, len(changed), (': ' + ', '.join(changed)) if changed else ''))
    return 0


if __name__ == '__main__':
    sys.exit(main())
