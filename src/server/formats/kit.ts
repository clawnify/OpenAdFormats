/**
 * The rendering toolkit shared by every format.
 *
 * Every creative is authored at 1080px wide (Meta's native width for all three
 * placements) and flexes vertically, so one layout serves 1:1, 4:5 and 9:16
 * without a per-ratio fork. Sizes are therefore plain px against a fixed
 * canvas — not a responsive design, a poster.
 */

import type { BrandKit, FormatCtx } from "./types";

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Google Fonts stylesheet covering every weight the templates use. */
function fontHref(families: string[]): string {
  const uniq = [...new Set(families.filter(Boolean))];
  return `https://fonts.googleapis.com/css2?${uniq
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700;800;900`)
    .join("&")}&display=swap`;
}

/**
 * Mix `hex` toward white/black by `amount` (0–1). Lets a format derive a tint
 * from the brand accent instead of hardcoding a second color.
 */
export function tint(hex: string, amount: number, toward: "white" | "black" = "white"): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return hex;
  const target = toward === "white" ? 255 : 0;
  const ch = [1, 2, 3].map((i) => {
    const v = parseInt(m[i], 16);
    return Math.round(v + (target - v) * amount);
  });
  return `#${ch.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** True when a hex reads dark enough to need light text on top. */
export function isDark(hex: string): boolean {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return false;
  const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 16));
  // Rec. 709 luma — good enough to pick a text color against a fill.
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.55;
}

/** Text color that stays legible on `bg`. */
export function on(bg: string): string {
  return isDark(bg) ? "#FFFFFF" : "#111318";
}

/**
 * Self-contained HTML document. `body` is the creative; `extraCss` holds any
 * format-specific rules. Brand tokens land as CSS custom properties so format
 * markup reads as `var(--accent)` rather than an interpolated hex.
 */
export function shell(ctx: FormatCtx<unknown>, body: string, extraCss = ""): string {
  const { width, height } = ctx.canvas;
  const c = ctx.brand.colors;
  const f = ctx.brand.fonts;
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontHref([f.heading, f.body, "Inter"])}" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  body {
    --ink: ${c.ink};
    --bg: ${c.background};
    --accent: ${c.accent};
    --accent-tint: ${tint(c.accent, 0.88)};
    --on-accent: ${on(c.accent)};
    --muted: ${c.muted};
    --surface: ${c.surface};
    --hairline: ${tint(c.ink, 0.86)};
    font-family: '${f.body}', Inter, -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
  }
  .h { font-family: '${f.heading}', Inter, sans-serif; letter-spacing: -0.02em; }
  .stage { width: ${width}px; height: ${height}px; display: flex; flex-direction: column; }
  .tnum { font-variant-numeric: tabular-nums; }
  ${extraCss}
</style></head><body><div class="stage">${body}</div></body></html>`;
}

/** Vertical breathing room scaled to the canvas — taller ratios get more. */
export function pad(ctx: FormatCtx<unknown>): number {
  return ctx.canvas.height >= 1900 ? 130 : ctx.canvas.height >= 1300 ? 92 : 76;
}

// ── Shared pieces ────────────────────────────────────────────────────

/** Brand wordmark (logo image when supplied, else the name in caps). */
export function brandMark(brand: BrandKit, color = "var(--muted)"): string {
  if (brand.logoDataUri) {
    return `<img src="${brand.logoDataUri}" alt="" style="height:44px;object-fit:contain;object-position:left;"/>`;
  }
  if (!brand.name) return "";
  return `<div style="font-size:24px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${color};">${esc(
    brand.name,
  )}</div>`;
}

/** The call-to-action button. Solid accent, the one loud element. */
export function cta(label: string, opts: { full?: boolean; radius?: number } = {}): string {
  if (!label) return "";
  const r = opts.radius ?? 12;
  return `<div style="display:${opts.full ? "flex" : "inline-flex"};align-items:center;justify-content:center;
    background:var(--accent);color:var(--on-accent);border-radius:${r}px;
    padding:26px 46px;font-size:34px;font-weight:700;letter-spacing:0.01em;${opts.full ? "width:100%;" : ""}">${esc(
      label,
    )}</div>`;
}

export function star(color = "#FFB020", size = 40): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>`;
}

export function stars(n = 5, color = "#FFB020", size = 40): string {
  return `<div style="display:flex;gap:6px;">${star(color, size).repeat(Math.max(0, Math.min(5, n)))}</div>`;
}

export function check(color = "currentColor", size = 34, width = 3.2): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
}

export function cross(color = "currentColor", size = 34, width = 3.2): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
}

/** Product photo, contained and softly grounded. */
export function shot(ctx: FormatCtx<unknown>, maxH: number, extra = ""): string {
  return `<img src="${ctx.photoDataUri}" alt="" style="max-width:100%;max-height:${maxH}px;object-fit:contain;filter:drop-shadow(0 30px 60px rgba(0,0,0,0.18));${extra}"/>`;
}

/** iOS-style status bar — the tell that sells every native-UI format. */
export function iosStatusBar(color = "#111318", time = "9:41"): string {
  return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:64px;color:${color};font-size:28px;font-weight:600;">
    <div class="tnum">${esc(time)}</div>
    <div style="display:flex;align-items:center;gap:10px;">
      <svg width="30" height="20" viewBox="0 0 18 12" fill="${color}"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
      <svg width="28" height="20" viewBox="0 0 16 12" fill="${color}"><path d="M8 11.2l2-2.4a3 3 0 00-4 0l2 2.4zM3.4 5.6l1.5 1.8a5 5 0 016.2 0l1.5-1.8a8 8 0 00-9.2 0zM.8 2.4l1.5 1.8a10 10 0 0111.4 0l1.5-1.8a13 13 0 00-14.4 0z"/></svg>
      <svg width="42" height="20" viewBox="0 0 26 12" fill="none"><rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="${color}" opacity="0.5"/><rect x="2" y="2" width="17" height="8" rx="1.6" fill="${color}"/><path d="M24 4v4a2 2 0 000-4z" fill="${color}" opacity="0.5"/></svg>
    </div>
  </div>`;
}

/** A rounded "screenshot" card — the container most native-UI formats sit in. */
export function screenCard(inner: string, opts: { bg?: string; radius?: number; shadow?: boolean } = {}): string {
  const bg = opts.bg ?? "#FFFFFF";
  const r = opts.radius ?? 44;
  return `<div style="background:${bg};border-radius:${r}px;overflow:hidden;${
    opts.shadow === false ? "" : "box-shadow:0 40px 90px rgba(0,0,0,0.18);"
  }">${inner}</div>`;
}

/** Small uppercase kicker above a headline. */
export function kicker(text: string, color = "var(--accent)"): string {
  if (!text) return "";
  return `<div style="font-size:24px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${color};">${esc(
    text,
  )}</div>`;
}

/**
 * Headline sized to fit. Long copy in a big display face is the single most
 * common way a generated creative breaks, so size steps down as length grows
 * rather than overflowing the canvas.
 */
export function fitHeadline(text: string, opts: { max?: number; min?: number; per?: number } = {}): number {
  const max = opts.max ?? 96;
  const min = opts.min ?? 44;
  const per = opts.per ?? 46; // characters that comfortably fit at `max`
  const len = String(text ?? "").length;
  if (len <= per) return max;
  const scaled = Math.round(max * Math.sqrt(per / len));
  return Math.max(min, scaled);
}

/** Numbered/bulleted rows shared by the list formats. */
export function rows(
  items: string[],
  render: (item: string, i: number) => string,
  gap = 26,
): string {
  return `<div style="display:flex;flex-direction:column;gap:${gap}px;">${items
    .map(render)
    .join("")}</div>`;
}
