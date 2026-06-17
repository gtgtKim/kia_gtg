# Kia GTG / EC4W Static Demo

This repository contains four static Kia market-style demo routes for RFP QA:

- `/us/en/`
- `/au/en/`
- `/in/home.html`
- `/ca/`

The root page at `/` links to all markets. The intended production domain is `gyutaekim.store`.

## Purpose

The site is built for Google Tag Gateway (GTG) and Enhanced Conversions for Web (EC4W) demonstration. It uses public Kia CDN image URLs as remote image references and does not copy image files into this repo.

Each market page includes:

- Market-like navigation, hero, model cards, shopping tools, and footer structure.
- A visible demo banner stating that this is not an official Kia retail site.
- A QA conversion form that uses sample values only.
- Browser-side SHA-256 hashing for a demo EC4W-style `dataLayer` payload.
- GTG configuration placeholders for `/metrics/`.

## Cloudflare Pages

No build step is required.

Suggested Cloudflare Pages settings:

- Framework preset: None
- Build command: empty
- Build output directory: `.`
- Custom domain: `gyutaekim.store`

After deployment, test:

- `https://gyutaekim.store/us/en/`
- `https://gyutaekim.store/au/en/`
- `https://gyutaekim.store/in/home.html`
- `https://gyutaekim.store/ca/`

The `_headers` file sets `X-Robots-Tag: noindex, nofollow` for the demo.

## GTG Notes

The static pages are prepared to load GTM through the first-party path `/metrics/`, but the placeholder is disabled by default to avoid loading a fake container.

To enable after the real GTM container and CDN route are ready, update each page:

```js
gtg: { enabled: true, containerId: "GTM-REALID", path: "/metrics/" }
```

Important constraint: Google's manual Cloudflare GTG instructions currently describe CNAME, Origin Rule, and Transform/location header setup, and state that completing that Cloudflare setup requires a Cloudflare Enterprise plan. Free Cloudflare Pages hosting still works for the static website, but live GTG routing on Cloudflare Free needs a separately validated approach with Google/Cloudflare.

See `docs/cloudflare-gtg-setup.md` for details.

## Safety

Do not enter real customer data into the QA forms. The forms do not submit to a backend, but a live GTM setup could forward events once enabled.
