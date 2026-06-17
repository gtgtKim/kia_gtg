# Cloudflare Pages and GTG Setup Notes

## Static Website

This project is ready for Cloudflare Pages Free as a static site.

1. Create a new Cloudflare Pages project.
2. Connect this repository or upload the directory.
3. Leave build command empty.
4. Set build output directory to `.`.
5. Attach `gyutaekim.store` as the custom domain.
6. Verify the four market paths:
   - `/us/en/`
   - `/au/en/`
   - `/in/home.html`
   - `/ca/`

## GTG Measurement Path

The demo uses `/metrics/` as the reserved GTG measurement path.

Google's GTG guidance says the measurement path:

- Must not already be in use.
- Must not be `/`.
- Should be unique for each standalone tag or GTM container.

For a GTM container, the GTG script pattern is:

```html
<script>
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'/metrics/?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');
</script>
```

In this demo, that behavior is controlled by each page's `window.KIA_MARKET.gtg` object.

```js
gtg: { enabled: false, containerId: "GTM-KIAUSQA", path: "/metrics/" }
```

Switch `enabled` to `true` only after the real container and Cloudflare routing are configured.

## Cloudflare Constraint

The official Google manual setup page for GTG states that Cloudflare manual CDN setup involves:

- A CNAME entry for an internal subdomain.
- An Origin Rule to route the reserved path to the `*.fps.goog` endpoint.
- Location/geolocation headers for validation.
- Verification at `/metrics/healthy` and `/metrics/?validate_geo=healthy`.

The same official page states that this Cloudflare setup requires Cloudflare Enterprise. That means:

- Cloudflare Pages Free is fine for hosting this static demo.
- Official manual GTG routing on Cloudflare Free is not guaranteed by the documented path.
- If the client requires Cloudflare Free specifically, confirm an approved alternative with Google and Cloudflare before promising live GTG parity.

References:

- https://developers.google.com/tag-platform/tag-manager/gateway/setup-guide?setup=manual
- https://support.google.com/google-ads/answer/16061406?hl=en

## Suggested Pitch Framing

For the demo:

1. Show that all four market routes preserve similar site structures and conversion surfaces.
2. Open DevTools and inspect `dataLayer` after hero clicks, model clicks, and form submission.
3. Explain that the same `/metrics/` path is reserved across markets for GTG.
4. Explain that the current repo stays static and safe; enabling the real GTG route is a deployment step after GTM ID and Cloudflare capability confirmation.

## EC4W QA

Each market page has a conversion simulator. It:

- Normalises sample email and phone values.
- Hashes values with SHA-256 in the browser.
- Pushes a `generate_lead` event to `dataLayer`.
- Does not submit form data to a backend.

Use only QA values.
