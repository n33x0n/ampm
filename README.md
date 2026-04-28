# ampm

> Is it AM or PM right now? — a tiny static page that just tells you, plus a 12h ↔ 24h converter.

Live: https://ampm.pages.dev (placeholder until Cloudflare Pages is wired up)

## What & why

A one-page static site that solves a single, dumb-but-real problem: people who live in 24-hour time forget which side of noon "AM" and "PM" sit on. Open the page → giant current time in 12-hour format with AM/PM. Toggle to 24h. Scroll a bit and there's a bidirectional converter — type into either field, the other updates live.

Built primarily as an SEO play for queries like *"am or pm now"*, *"is it am or pm"*, *"która godzina to am"*.

## Stack

Vanilla HTML + CSS + JS. No framework, no build step, no dependencies. Two locales:

- `/` — English (default)
- `/pl/` — Polish

Linked via `hreflang`.

## Local dev

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (Cloudflare Pages)

1. Cloudflare dashboard → Pages → **Create a project** → **Connect to Git** → pick `n33x0n/ampm`.
2. Build command: *(leave empty)*
3. Build output directory: `/`
4. Save & Deploy.

`_headers` in the repo root sets cache + security headers automatically.

## Versioning

Every visible change bumps the version in the footer of both `index.html` and `pl/index.html`, gets a git tag `vX.Y.Z`, and a matching GitHub Release.

## License

[Apache License 2.0](./LICENSE)

## Author

Tom Lebioda — <hello@tomlebioda.com>

---

## Po polsku

Mała strona, która mówi czy teraz jest AM czy PM, plus konwerter 12h ↔ 24h. Statyk, bez frameworka, deploy na Cloudflare Pages.
