/**
 * The ad-format engine.
 *
 * A FORMAT is one recognizable static-ad archetype ("iPhone Notes",
 * "Trustpilot review", "Us vs Them"). Each one declares:
 *
 *   - the copy shape it needs (`example` + `parse`) — so the AI layer can
 *     generate exactly the fields this layout renders and nothing else;
 *   - `build(ctx)` — a SELF-CONTAINED HTML document that the managed
 *     screenshot service turns into a PNG (real Chrome, so Google Fonts and
 *     web layout behave exactly as authored).
 *
 * Two hard rules, because they are what keeps this maintainable at ~40 formats:
 *
 * 1. A format never invents product claims. Everything it renders comes from
 *    the brief the user filled in or copy generated from that brief.
 * 2. A format never hardcodes a color or typeface. The BrandKit is the visual
 *    system, so the same format under two kits produces two on-brand ads.
 *
 * NOTE ON DESIGN.md: the platform design system governs this app's *chrome*
 * (the dashboard the user clicks through). It deliberately does NOT govern the
 * creatives — an ad is output data in the customer's brand, and Clawnify coral
 * has no business inside a customer's Meta ad.
 */

// ── Canvas ───────────────────────────────────────────────────────────

/** Meta's three placements that matter for static creative. */
export type AspectId = "1:1" | "4:5" | "9:16";

export interface Canvas {
  id: AspectId;
  label: string;
  width: number;
  height: number;
  /** Where this ratio actually serves, so the UI can explain the choice. */
  placement: string;
}

export const CANVASES: Record<AspectId, Canvas> = {
  "1:1": { id: "1:1", label: "Square", width: 1080, height: 1080, placement: "Feed, Explore, Marketplace" },
  "4:5": { id: "4:5", label: "Portrait", width: 1080, height: 1350, placement: "Feed — most mobile real estate" },
  "9:16": { id: "9:16", label: "Story", width: 1080, height: 1920, placement: "Stories, Reels" },
};

export const DEFAULT_ASPECT: AspectId = "4:5";

// ── Brand kit ────────────────────────────────────────────────────────

export interface BrandKit {
  name: string;
  colors: {
    /** Primary ink — headlines and body copy on light surfaces. */
    ink: string;
    /** Canvas behind the creative. */
    background: string;
    /** The one loud brand color: CTAs, highlights, underlines. */
    accent: string;
    /** Secondary text, captions, de-emphasised rows. */
    muted: string;
    /** Cards/panels that sit on the canvas. */
    surface: string;
  };
  fonts: { heading: string; body: string };
  /** Optional wordmark, rendered top-left on formats that brand themselves. */
  logoDataUri?: string;
}

export const DEFAULT_BRAND: BrandKit = {
  name: "",
  colors: {
    ink: "#111318",
    background: "#FFFFFF",
    accent: "#E5484D",
    muted: "#6B7280",
    surface: "#F6F7F9",
  },
  fonts: { heading: "Inter", body: "Inter" },
};

// ── The brief ────────────────────────────────────────────────────────

/**
 * What the user tells us once. Every format's copy is generated from this, so
 * a claim that isn't here can't reach a creative.
 */
export interface Brief {
  /** Product or brand name as it should appear in the ad. */
  product: string;
  /** What it is, in the customer's words ("greens powder", "sleep supplement"). */
  category: string;
  /** Who it's for. Drives voice more than any other field. */
  audience: string;
  /** The core promise — the one outcome the ad sells. */
  promise: string;
  /** Substantiated facts: stats, ingredients, awards, guarantees. */
  proof: string[];
  /** What stops people buying. Feeds the objection/comparison formats. */
  objections: string[];
  /** The commercial offer, if any ("50% off first order"). */
  offer: string;
  /** Button/link text. */
  cta: string;
  /** Display domain shown in browser/search/native chrome formats. */
  domain: string;
}

export const EMPTY_BRIEF: Brief = {
  product: "",
  category: "",
  audience: "",
  promise: "",
  proof: [],
  objections: [],
  offer: "",
  cta: "Shop now",
  domain: "",
};

// ── Format definitions ───────────────────────────────────────────────

export type FormatCategory = "native-ui" | "social-proof" | "comparison" | "list" | "urgency" | "offer";

export const CATEGORY_LABELS: Record<FormatCategory, string> = {
  "native-ui": "Native UI",
  "social-proof": "Social proof",
  comparison: "Comparison",
  list: "List & teaching",
  urgency: "Urgency & warning",
  offer: "Offer & hook",
};

export interface FormatCtx<C> {
  brief: Brief;
  brand: BrandKit;
  /** Copy generated for THIS format, already validated against its shape. */
  copy: C;
  /** Primary product photo as a data URI (or a neutral placeholder). */
  photoDataUri: string;
  /**
   * Every uploaded photo, resolved. Always at least one entry (the same value
   * as `photoDataUri`). Formats that genuinely need a second image — the
   * before/after split being the only one today — read `photos[1]` and degrade
   * gracefully when the user has only uploaded one.
   */
  photos: string[];
  canvas: Canvas;
}

/**
 * The registry holds formats with different copy shapes, so the element type
 * has to be shape-agnostic. `any` here is the accurate model — each format
 * validates its own copy through `parse` before `build` ever sees it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFormat = FormatDef<any>;

export interface FormatDef<C = unknown> {
  id: string;
  name: string;
  category: FormatCategory;
  /** One line: what the creative looks like. */
  summary: string;
  /** One line of judgment: when this format is the right pick. */
  useWhen: string;
  /** Canvases this layout is designed for. */
  sizes: AspectId[];
  /**
   * A filled-in example of the copy object. Doubles as the JSON shape shown to
   * the copy model and as the preview payload before any AI call — so every
   * format renders (with placeholder words) the instant it's registered.
   */
  example: C;
  /** Format-specific instruction appended to the copy prompt. */
  guidance: string;
  /**
   * Validate + coerce a model response into this format's copy shape.
   * Throws with a readable message the retry pass feeds back to the model.
   */
  parse(raw: unknown): C;
  build(ctx: FormatCtx<C>): string;
}

// ── Copy-shape validation ────────────────────────────────────────────
// A tiny structural validator instead of a zod dependency in the render path:
// every copy shape is a flat object of strings and string arrays, so the
// example itself is the schema. Shapes stay honest because they're the same
// object the model is shown.

function typeOf(v: unknown): string {
  if (Array.isArray(v)) return "array";
  return typeof v;
}

/**
 * Validates `raw` against the structure of `example`: same keys, same types,
 * arrays of at least one item. Extra keys are dropped rather than rejected —
 * models routinely add commentary fields and that shouldn't fail a render.
 */
export function shapeOf<C extends object>(example: C) {
  return (raw: unknown): C => {
    if (typeOf(raw) !== "object" || raw === null) {
      throw new Error(`expected a JSON object, got ${typeOf(raw)}`);
    }
    const src = raw as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    const problems: string[] = [];

    for (const [key, sample] of Object.entries(example as Record<string, unknown>)) {
      const got = src[key];
      const want = typeOf(sample);

      if (got === undefined || got === null) {
        problems.push(`missing "${key}" (${want})`);
        continue;
      }
      if (want === "array") {
        if (!Array.isArray(got)) {
          problems.push(`"${key}" must be an array of strings`);
          continue;
        }
        const items = got.map((x) => String(x)).filter((s) => s.trim().length > 0);
        if (items.length === 0) {
          problems.push(`"${key}" must have at least one item`);
          continue;
        }
        out[key] = items;
        continue;
      }
      if (want === "number") {
        const n = Number(got);
        if (!Number.isFinite(n)) {
          problems.push(`"${key}" must be a number`);
          continue;
        }
        out[key] = n;
        continue;
      }
      const s = String(got).trim();
      if (!s) {
        problems.push(`"${key}" must be a non-empty string`);
        continue;
      }
      out[key] = s;
    }

    if (problems.length) throw new Error(problems.join("; "));
    return out as C;
  };
}
