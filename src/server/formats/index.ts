/**
 * The format registry — the single list every other layer reads.
 *
 * Adding a format is one entry in one category file plus one line here. The
 * UI, the copy generator, the batch runner and the agent's `/llms.txt` all
 * derive from this array, so nothing else needs touching.
 */

import { COMPARISON_FORMATS } from "./comparison";
import { LIST_FORMATS } from "./list";
import { NATIVE_UI_FORMATS } from "./native-ui";
import { OFFER_FORMATS } from "./offer";
import { SOCIAL_PROOF_FORMATS } from "./social-proof";
import { URGENCY_FORMATS } from "./urgency";
import { CANVASES, DEFAULT_ASPECT, type AnyFormat, type AspectId } from "./types";

export * from "./types";
export { shell, esc } from "./kit";

export const FORMATS: AnyFormat[] = [
  ...NATIVE_UI_FORMATS,
  ...SOCIAL_PROOF_FORMATS,
  ...COMPARISON_FORMATS,
  ...LIST_FORMATS,
  ...URGENCY_FORMATS,
  ...OFFER_FORMATS,
];

const BY_ID = new Map(FORMATS.map((f) => [f.id, f]));

export function getFormat(id: string): AnyFormat | undefined {
  return BY_ID.get(id);
}

/** Ids are the public contract (agent calls, saved rows) — assert uniqueness. */
if (BY_ID.size !== FORMATS.length) {
  const seen = new Set<string>();
  const dupes = FORMATS.map((f) => f.id).filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
  throw new Error(`Duplicate format id(s): ${[...new Set(dupes)].join(", ")}`);
}

/**
 * Resolve the canvas to render a format at: the requested aspect when the
 * format supports it, otherwise the format's own first choice. Callers never
 * get an unsupported pairing back.
 */
export function canvasFor(format: AnyFormat, requested: AspectId = DEFAULT_ASPECT) {
  const aspect = format.sizes.includes(requested) ? requested : format.sizes[0];
  return CANVASES[aspect];
}

/** The catalogue as the UI and the agent see it — no functions, JSON-safe. */
export function formatCatalogue() {
  return FORMATS.map((f) => ({
    id: f.id,
    name: f.name,
    category: f.category,
    summary: f.summary,
    use_when: f.useWhen,
    sizes: f.sizes,
    copy_fields: Object.keys(f.example as Record<string, unknown>),
  }));
}

/** A neutral stand-in so every format renders before a photo is uploaded. */
export const PLACEHOLDER_PHOTO =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900">` +
      `<rect width="100%" height="100%" fill="#E4E7EB"/>` +
      `<rect x="300" y="250" width="300" height="400" rx="24" fill="#CBD2DA"/>` +
      `<text x="450" y="740" font-family="Inter,sans-serif" font-size="34" fill="#8A929C" text-anchor="middle">Product photo</text>` +
      `</svg>`,
  );
