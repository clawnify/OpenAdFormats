# Open Ad Formats — agent instructions

## Division of labour

**You gather the facts. The app writes the ads.**

- **Never write the ad copy yourself and paste it in.** Every format renders a specific copy shape, and the app generates copy against that shape with claim rules the templates depend on. Hand-written copy either doesn't fit the layout or quietly bypasses those rules.
- **Never invent a statistic, price, discount, deadline, customer count or certification** to fill out a brief. If the user hasn't given you the number, the brief field stays empty and the creative works around it. A fabricated "only 47 left" is a Meta policy violation on the user's ad account, not a copywriting flourish.
- **Do choose the formats.** Read `use_when` on each format and pick the handful that match this product's situation. That judgment is the most valuable thing you contribute.
- **Do interview the user before creating a brief.** A thin brief produces generic ads; the `proof` and `objections` fields are where the quality comes from.

## Procedure

1. **Interview.** Get: what the product is, who it's for, the one outcome it delivers, 3–5 *substantiated* facts, the 2–3 reasons people don't buy, and the current offer. Ask for the offer verbatim — you'll reuse its exact wording.
2. **Create the brief** — `POST /api/briefs`. `proof` and `objections` are arrays of strings.
3. **Upload a product photo** — `POST /api/briefs/{id}/photo` (multipart, field `file`). Without one, creatives render a grey placeholder. Upload a second photo if you plan to use `before-after`; it uses photo 2 as the "after".
4. **Pick formats.** `GET /api/v1/formats` returns all 42 with a `use_when` line each. Choose 4–8 that fit. Spread across categories — six variations on one idea tells you nothing when you test them.
5. **Generate** — `POST /api/v1/batches`. Omit `formats` to get one from each category. This is the call that spends money.
6. **Review** — the response lists each creative with a `url` and any `error`. Show the user the images; don't just report success.
7. **Iterate cheaply.** To try a different slant, run a new batch with `angle` set ("lead with the guarantee", "speak to a returning customer"). To re-render after editing the brand kit, use the free HTML routes below rather than regenerating.

## Choosing formats — the judgment that matters

- Strong reviews → `trustpilot-review`, `customer-testimonial`, `reddit-thread`
- A named rival or obvious alternative → `us-vs-them`, `comparison-to-winner`, `new-vs-old`
- Buyer doesn't know they have the problem → `x-signs`, `problem-vs-solution`, `myth-vs-fact`
- The offer *is* the argument → `bundle-offer`, `dont-buy-this`, `low-stock-alert`
- Product needs explaining first → `the-101`, `x-reasons-why`, `diagram-flowchart`
- Real before/after imagery → `before-after`, `transformation-timeline`

Formats that **require** something specific, and should be skipped when the brief lacks it:

| Format | Needs |
|---|---|
| `stat-headline` | A real statistic in `proof`. Skip entirely if there isn't one. |
| `low-stock-alert`, `warning` | Genuine scarcity or a real deadline in `offer`. |
| `bundle-offer`, `dont-buy-this` | Real prices in `offer` — it renders a struck-through anchor price. |
| `before-after` | Two uploaded photos, or the "before" panel is just a desaturated copy. |

## Pages

- `/` — briefs list, then the brief editor (form + format picker + Generate).
- **Format library** — all 42 rendered live at real size. **Screenshot-friendly**: the best way to show a user what a format looks like before spending anything.
- **Creatives** — the finished batch grid with per-creative copy and download links.

## API anchors

Full shapes are in `/api/openapi.json` and `/llms.txt` — read those rather than guessing.

- `GET /api/v1/formats` — the catalogue with `use_when`. Start here.
- `POST /api/briefs` — `{ product, category, audience, promise, proof[], objections[], offer, cta, domain }`
- `POST /api/v1/batches` — `{ brief_id, formats?[], aspect?, angle? }`. **Spends money.**
- `GET /api/v1/batches/{id}` — creatives with urls, status, and generated copy.
- `GET /api/v1/batches/{id}/export` — download manifest: filename, url, dimensions, copy. Hand this to a media buyer.

## Cost discipline

- **`POST /api/v1/batches` is the only expensive call** — one copy-model request plus one render per creative. A 12-format batch is 12 of each. Confirm the format list with the user before firing a large batch.
- **Free:** `GET /api/preview/{format_id}?brief_id=…` renders any format as live HTML with placeholder copy — no model call. Use it to show a user a format before committing.
- **Free:** `GET /api/creatives/{id}/html` re-renders a saved creative from its stored copy. Use this after a brand-kit change instead of regenerating.

## Reading failures

Per-creative `status` is `done` or `failed`; a batch continues past individual failures, so always check the array rather than the batch status.

- `Rendering needs CLAWNIFY_TOKEN` — the platform injects this on deploy; locally it's absent, so copy generates but no PNG is produced.
- `copy for "<id>" failed validation twice` — the model couldn't produce that format's shape, usually because the brief is too thin to fill it. Enrich `proof`/`objections` and retry that one format.
- `you returned the sample copy verbatim` (in a retry) — self-healing; only a concern if the creative still fails afterwards.
- `unknown format id(s)` — you invented an id. Re-read `GET /api/v1/formats`.
