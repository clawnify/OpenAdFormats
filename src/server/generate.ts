/**
 * Batch orchestration — brief + chosen formats → rendered creatives.
 *
 * Each creative is independent: copy, then HTML, then PNG. One failing format
 * marks that row failed and the rest of the batch continues, because a batch of
 * twelve where one model response was malformed is still eleven usable ads.
 *
 * Concurrency is capped deliberately. Workers gives us plenty of I/O headroom,
 * but the copy model is the bottleneck and firing forty requests at once earns
 * a 429 that fails the whole run.
 */

import { generateCopy, type AiEnv } from "./ai";
import {
  CANVASES,
  DEFAULT_BRAND,
  PLACEHOLDER_PHOTO,
  canvasFor,
  getFormat,
  type AspectId,
  type Brief,
  type BrandKit,
  type AnyFormat,
  type FormatCtx,
  type FormatDef,
} from "./formats";
import { renderPng } from "./render";
import { putUpload, readUploadAsBase64DataUrl, rid } from "./uploads";

const CONCURRENCY = 4;

export interface GenerateEnv extends AiEnv {
  CLAWNIFY_TOKEN?: string;
  SERVICES_URL?: string;
}

export interface CreativeSeed {
  id: string;
  formatId: string;
}

export interface CreativeResult {
  id: string;
  formatId: string;
  status: "done" | "failed";
  aspect: AspectId;
  width: number;
  height: number;
  copy: unknown | null;
  r2Key: string | null;
  error: string | null;
}

/**
 * Resolve uploaded photos to data URIs. Always returns at least one entry —
 * the placeholder — so no format has to branch on "is there a photo yet".
 * The render service fetches over the network, so same-origin upload paths
 * can't be used directly; everything must be inlined.
 */
export async function resolvePhotos(photoKeys: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const key of photoKeys.slice(0, 4)) {
    const uri = await readUploadAsBase64DataUrl(key);
    if (uri) out.push(uri);
  }
  return out.length ? out : [PLACEHOLDER_PHOTO];
}

/** The primary photo only — for callers that genuinely need just one. */
export async function photoDataUri(photoKeys: string[]): Promise<string> {
  return (await resolvePhotos(photoKeys))[0];
}

export function buildCtx<C>(a: {
  format: FormatDef<C>;
  brief: Brief;
  brand: BrandKit;
  copy: C;
  /** Every resolved photo. Element 0 is the primary. */
  photos: string[];
  aspect: AspectId;
}): FormatCtx<C> {
  const photos = a.photos.length ? a.photos : [PLACEHOLDER_PHOTO];
  return {
    brief: a.brief,
    brand: a.brand,
    copy: a.copy,
    photoDataUri: photos[0],
    photos,
    canvas: canvasFor(a.format as AnyFormat, a.aspect),
  };
}

/**
 * Render one creative end to end. Returns a result row rather than throwing,
 * so the caller can persist partial success.
 */
async function runOne(
  seed: CreativeSeed,
  a: { brief: Brief; brand: BrandKit; photos: string[]; aspect: AspectId; angle?: string; env: GenerateEnv },
): Promise<CreativeResult> {
  const format = getFormat(seed.formatId);
  const canvas = format ? canvasFor(format, a.aspect) : CANVASES[a.aspect];
  const base = {
    id: seed.id,
    formatId: seed.formatId,
    aspect: canvas.id,
    width: canvas.width,
    height: canvas.height,
  };

  if (!format) {
    return { ...base, status: "failed", copy: null, r2Key: null, error: `unknown format "${seed.formatId}"` };
  }

  let copy: unknown = null;
  try {
    copy = await generateCopy(format, a.brief, a.env, a.angle);
    const html = format.build(
      buildCtx({ format, brief: a.brief, brand: a.brand, copy: copy as never, photos: a.photos, aspect: a.aspect }),
    );

    if (!a.env.CLAWNIFY_TOKEN) {
      // Copy is real and stored; only the raster step needs the platform token.
      // Surfacing this as a failed render (rather than a hard throw) keeps the
      // HTML preview route usable during local development.
      return { ...base, status: "failed", copy, r2Key: null, error: "Rendering needs CLAWNIFY_TOKEN" };
    }

    const bytes = await renderPng({
      html,
      width: canvas.width,
      height: canvas.height,
      filename: `${seed.formatId}-${canvas.id.replace(":", "x")}.png`,
      token: a.env.CLAWNIFY_TOKEN,
      servicesUrl: a.env.SERVICES_URL,
    });
    const key = `${rid("ad")}.png`;
    await putUpload(key, bytes, "image/png");
    return { ...base, status: "done", copy, r2Key: key, error: null };
  } catch (err) {
    return {
      ...base,
      status: "failed",
      copy,
      r2Key: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Run a batch with bounded concurrency, reporting each row as it lands. */
export async function generateBatch(
  seeds: CreativeSeed[],
  a: {
    brief: Brief;
    brand: BrandKit;
    photos: string[];
    aspect: AspectId;
    angle?: string;
    env: GenerateEnv;
    onResult?: (r: CreativeResult) => Promise<void>;
  },
): Promise<CreativeResult[]> {
  const results: CreativeResult[] = [];
  const queue = [...seeds];

  async function worker() {
    for (;;) {
      const seed = queue.shift();
      if (!seed) return;
      const result = await runOne(seed, a);
      results.push(result);
      if (a.onResult) await a.onResult(result);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, seeds.length) }, worker));
  return results;
}

/** Brand kit row (JSON columns) → the typed kit the formats read. */
export function brandFromRow(
  row: { name?: string; colors?: string; fonts?: string } | null | undefined,
  logo?: string,
): BrandKit {
  if (!row) return DEFAULT_BRAND;
  const colors = safeJson(row.colors) as Partial<BrandKit["colors"]>;
  const fonts = safeJson(row.fonts) as Partial<BrandKit["fonts"]>;
  return {
    name: row.name || "",
    colors: { ...DEFAULT_BRAND.colors, ...colors },
    fonts: { ...DEFAULT_BRAND.fonts, ...fonts },
    logoDataUri: logo,
  };
}

export function safeJson(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "string" || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function safeArray(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
