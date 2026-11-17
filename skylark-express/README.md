# Skylark Express (Delhi) Pvt. Ltd. — website

Static-first Astro + TypeScript site. Public content is rendered to HTML at build time; small route-loaded scripts add the interactive tools and the scroll-driven film sequence. All assets are served from this build.

```bash
npm install
npm run build:preview   # preview build: labelled local test API, noindex
npm run preview         # http://localhost:4321
node tests/run.mjs --perf   # acceptance walkthrough + lab performance (needs the preview running)
npm run build           # production build → dist/  (tools fall back to phone/email until endpoints are set)
```

## Where to update things

| What | File |
| --- | --- |
| Company name, phones, email, hours, founders, timeline, values | `src/data/company.ts` |
| Published figures (50+ warehouses, 19,000+ PIN codes …) and the gated 99% on-time figure | `src/data/company.ts` → `figures` |
| Offices, branches, listed cities, aliases, map coordinates | `src/data/offices.ts` |
| Services, selector statements, enquiry fields | `src/data/services.ts` |
| Industry sections | `src/data/industries.ts` |
| Vacancies (date, city, arrangement, open/closed) | `src/data/careers.ts` |
| FAQs and shipping checklist | `src/data/faqs.ts` |
| Example dockets and PIN test data (fictitious) | `src/data/examples.ts` |
| Photography | replace files in `src/assets/img/` keeping the same names; responsive AVIF/WebP/JPEG are generated at build |
| Film shots, edit, titles, sound | `media-src/clips/`, `scripts/build-film.py`, `scripts/film-graphics.mjs` → `npm run film` |
| Scroll-scrubbed journey footage | `scripts/build-scrub.py` |
| Cut-out objects (aircraft, truck, van, train, carton, pallet, air pallet, forklift, low-loader, crate, skyline) | `src/assets/cut/*.png` (transparent PNG masters; AVIF/WebP with alpha generated at build). Replace a file with the same name to swap an object |
| Page titles, descriptions, share images | each page’s `<Base title description>`; service titles in `src/data/services.ts` (`seoTitle`); head and schema in `src/layouts/Base.astro` |
| India map geometry | `map-src/` + `npm run map` |
| Colours, type, spacing | `src/styles/global.css` (`:root` tokens) |

## Customer tools and what is connected

Each tool is configured independently in `src/config/integrations.ts` from `PUBLIC_*` variables (see `.env.example`).

| Tool | Without an endpoint (default production build) | With endpoint |
| --- | --- | --- |
| Tracking | Labelled example dockets only; any other number shows “Live tracking is temporarily unavailable. Contact our team with your docket number.” with both phones | `PUBLIC_TRACKING_ENDPOINT` — `GET ?number=` → `{ shipment }`, 404 unknown, 5xx unavailable |
| Proof of delivery | Example only; otherwise “ask for the POD” route | `PUBLIC_POD_ENDPOINT` — `POST { number, verification }` → `{ authorised, url }`, 403 refused |
| PIN serviceability | Example PINs only; otherwise “cannot confirm online” + Ask about this PIN | `PUBLIC_PIN_ENDPOINT` — `GET ?pin=` → `{ status: serviceable \| unsupported, area, note }`, 404 no record |
| Quote and contact forms | **Open email draft** to info@skylarkexpressdelhi.com with a copyable summary. The page says nothing has been sent | `PUBLIC_FORMS_ENDPOINT` — `POST` JSON with `idempotencyKey` → `{ reference }`. Confirmation is shown only after acceptance |
| Careers applications | Email draft to careers@skylarkexpressdelhi.com | `PUBLIC_CAREERS_UPLOAD_ENDPOINT` enables the file-upload form |
| Customer login | Not shown | `PUBLIC_CUSTOMER_PORTAL_URL` |

`server/preview.mjs` contains a **test API** (`/api/test/*`) used only by the preview build and the tests. It is not a production backend.

## Items the operator must supply or confirm before launch

1. **Founder portraits** are paired as confirmed by the client: Mr. Rakesh Yadav is the city-background portrait, Mr. Naveen Yadav the white-background portrait (`src/data/company.ts`).
2. Production endpoints and credentials for tracking, POD, PIN and forms (table above).
3. Company-approved **conditions of carriage**, exclusions and liability text for `/terms` (currently a marked placeholder).
4. Privacy page: name any analytics, forms or tracking vendor that is connected, and have it reviewed.
5. Confirm the vacancies dated 15 November 2026 are open (`rolesConfirmedForLaunch` in `src/data/careers.ts`).
6. The 99% on-time figure stays hidden until a measurement period and basis are supplied (`figures.onTime`).
7. Client logos, testimonials, guarantees and accreditations are not used; add only attributable, approved material.
8. Verified office coordinates, if markers should sit on the exact premises (currently locality/city centres, labelled as such).
9. Map: boundaries come from DataMeet’s Survey-of-India-derived state data (CC BY 4.0, credited on `/network`). Have the outline checked against the current Survey of India political map before publication.
10. The ten visual reference designs named in the brief were not attached to the session; layouts follow the written descriptions.

## Media produced

- `public/media/the-handover-1080p.mp4`, `-720p.mp4` (16:9) and `the-handover-portrait-720x1280.mp4` (9:16, separately framed): 42 s, 24 fps, H.264 + AAC, with `the-handover.en.vtt` captions and an on-page transcript. Sound is original, synthesised in `scripts/build-film.py`.
- `hero-dispatch-1080p.mp4` / `-720p.mp4` / `-4x5.mp4`: the silent six-second truck take (film 00:15–00:21). The desktop poster is its exact first frame.
- `journey-scrub-landscape.mp4` / `-portrait.mp4`: short-GOP clips that the pinned Home sequence scrubs with scroll.
- Shots were generated with Higgsfield (stills: Nano Banana Pro with the supplied logo as reference; motion: Seedance 2.5 / 2.0 from those stills). The logo was applied to the stills before animation rather than motion-tracked in post; every shot was checked at first, middle and last frame. Landscape shots other than the hero take are 720p sources upscaled to 1080p.
- Trains and aircraft are shown unbranded; Skylark branding is on shipment materials, vehicles, signage and clothing. The film is labelled an illustrative shipment journey.

## Lab performance (preview server, Chromium)

Run `node tests/run.mjs --perf` to reproduce. Measured on this build:

| Profile | FCP / LCP | CLS | Initial JS | First-load transfer |
| --- | --- | --- | --- | --- |
| Phone 390×844, 4× CPU slowdown, Slow 4G (1.6 Mbps, 150 ms RTT) | 0.66 s | 0 | 6 KB | 199 KB |
| Laptop 1440×900, 10 Mbps, 40 ms RTT | 0.28 s | 0 | 6 KB | 294 KB |

These are lab numbers from a local server. Field Core Web Vitals (LCP, INP, CLS at the 75th percentile) need real traffic.

## SEO

- Unique, keyword-led title (≤ 65 characters) and description (70–165 characters) on every page; brand suffix added once.
- Canonical, `hreflang` en-IN + x-default, Open Graph and Twitter cards with image alt text; each service page shares its own 1200×630 image.
- JSON-LD on every page: Organization + LocalBusiness (address, geo, hours, phones), WebSite, WebPage/AboutPage/ContactPage, BreadcrumbList; plus Service, FAQPage, JobPosting and per-branch LocalBusiness where relevant.
- `sitemap.xml` with `lastmod` and priorities; `robots.txt` points to it and keeps tracking/PIN query URLs out of the index; `site.webmanifest`.
- Preview builds (`npm run build:preview`) are deliberately `noindex`. Deploy the output of `npm run build`, which is indexable.
- After launch: submit the sitemap in Google Search Console and create a Google Business Profile for the Gurugram headquarters using the same name, address and phone.
