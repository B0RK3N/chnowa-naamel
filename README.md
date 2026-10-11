# Chnowa Naamel? · شنوّة نعمل؟

A mobile-friendly guide to everyday services in Tunisia, in Tunisian Arabic and French.

Live website: https://chnowa-naamel.blond-jay-1497.chatgpt.site

## Features

- 20 practical guides with source links and preparation checklists.
- Search and filters for paperwork, digital services, transport, bills, work, and postal services.
- Arabic right-to-left and French left-to-right layouts.
- Favorites and checklist progress saved locally in the browser.
- Printable checklists. No user account or identity document uploads.

## Run locally

Serve `dist/` with any static web server. For example, with Python installed:

```sh
python -m http.server 8080 --directory dist
```

Open http://localhost:8080. No build or dependency installation is needed.

## Files

- `dist/index.html`: page structure.
- `dist/style.css`: responsive layout and visual design.
- `dist/app.js`: original guides, translations, search and checklist interactions.
- `dist/more-guides.js`: 15 additional bilingual guides.
- `.openai/hosting.json`: configuration for the existing Sites deployment.

## Content maintenance

Sources were consulted on 11 October 2026. This is an independent preparation guide, not an official government service. Older administrative source sheets are clearly labeled. Fees, deadlines, eligibility, and document lists should be confirmed with the relevant institution. Payment, registrations, and document requests happen on the linked provider websites, not here.

The site uses Google Fonts with local font fallbacks. Browser-local favorites and progress are not synced across devices.