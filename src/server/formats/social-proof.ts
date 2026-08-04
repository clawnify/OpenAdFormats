/**
 * Social-proof formats — the creative is somebody else's words about you.
 *
 * The rule that makes these work: specificity beats enthusiasm. A review that
 * praises one mundane thing ("it arrived when they said") converts better than
 * one that calls the product life-changing, because only the first sounds real.
 */

import { esc, fitHeadline, pad, shell, stars, tint } from "./kit";
import { shapeOf, type AnyFormat, type FormatDef } from "./types";

// ── Trustpilot review ────────────────────────────────────────────────

interface TrustpilotCopy {
  quote: string;
  author: string;
  title: string;
}

const trustpilotReview: FormatDef<TrustpilotCopy> = {
  id: "trustpilot-review",
  name: "Trustpilot Review",
  category: "social-proof",
  summary: "A five-star review rendered in Trustpilot's own green-square chrome.",
  useWhen: "You have genuine reviews and the category runs on trust. The green squares do the persuading.",
  sizes: ["1:1", "4:5"],
  example: {
    title: "Fast, and it actually arrived when they said",
    quote:
      "Northwind was very fast and efficient from the time I ordered online to the time it landed on my doorstep. Third order now and it has never once been late.",
    author: "Lacey",
  },
  guidance:
    "Write it as a real reviewer would: specific, slightly mundane, praising one concrete thing rather than everything. " +
    "First name only. Never use superlatives like 'amazing' or 'life-changing'.",
  parse: shapeOf<TrustpilotCopy>({ quote: "", author: "", title: "" }),
  build(ctx) {
    const p = pad(ctx);
    const square = `<div style="width:76px;height:76px;background:#00B67A;display:flex;align-items:center;justify-content:center;">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="#FFFFFF"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>
    </div>`;
    return shell(
      ctx,
      `<div style="flex:1;background:#FFFFFF;display:flex;flex-direction:column;justify-content:center;padding:${p}px 74px;">
        <div style="display:flex;gap:8px;">${square.repeat(5)}</div>
        <div class="h" style="font-size:52px;font-weight:700;line-height:1.22;margin-top:44px;">${esc(
          ctx.copy.title,
        )}</div>
        <div style="font-size:40px;line-height:1.5;color:#2A2D34;margin-top:32px;">&ldquo;${esc(ctx.copy.quote)}&rdquo;</div>
        <div style="font-size:32px;color:#6B7280;margin-top:38px;">by ${esc(ctx.copy.author)}</div>
        <div style="display:flex;align-items:center;gap:16px;margin-top:52px;padding-top:40px;border-top:1px solid var(--hairline);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#00B67A"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>
          <span style="font-size:32px;font-weight:700;color:#191919;">Trustpilot</span>
        </div>
      </div>`,
    );
  },
};

// ── Zero stars ───────────────────────────────────────────────────────

interface ZeroStarsCopy {
  headline: string;
  quote: string;
  author: string;
}

const zeroStars: FormatDef<ZeroStarsCopy> = {
  id: "zero-stars",
  name: "Zero Stars",
  category: "social-proof",
  summary: "A joke one-star review that is secretly a compliment.",
  useWhen: "Your product works so well it causes a funny problem. Pattern-interrupt — the eye stops on a bad rating.",
  sizes: ["1:1", "4:5"],
  example: {
    headline: "0 STARS",
    quote:
      "I can't even walk down the street without people complimenting me on how shiny and healthy my hair looks. Super annoying.",
    author: "Emily",
  },
  guidance:
    "The complaint must be an obvious humblebrag — the 'problem' is the product working too well. Keep it under " +
    "170 characters and land the joke in the last clause. Never actually criticise the product.",
  parse: shapeOf<ZeroStarsCopy>({ headline: "", quote: "", author: "" }),
  build(ctx) {
    const p = pad(ctx);
    const empty = `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#C9CED6" stroke-width="1.8"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2z"/></svg>`;
    return shell(
      ctx,
      `<div style="flex:1;background:${tint(
        ctx.brand.colors.accent,
        0.9,
      )};display:flex;flex-direction:column;padding:${p}px 70px;">
        <div style="display:flex;gap:8px;justify-content:center;">${empty.repeat(5)}</div>
        <div class="h" style="font-size:132px;font-weight:900;color:var(--accent);text-align:center;line-height:1;margin-top:22px;letter-spacing:-0.03em;">${esc(
          ctx.copy.headline,
        )}</div>
        <div style="font-size:38px;line-height:1.45;color:var(--ink);text-align:center;margin-top:38px;max-width:820px;align-self:center;">&ldquo;${esc(
          ctx.copy.quote,
        )}&rdquo;</div>
        <div style="font-size:30px;color:var(--muted);text-align:center;margin-top:26px;">— ${esc(
          ctx.copy.author,
        )}</div>
        <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:36px;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:86%;max-height:${
            ctx.canvas.height * 0.36
          }px;object-fit:contain;filter:drop-shadow(0 26px 48px rgba(0,0,0,0.2));"/>
        </div>
      </div>`,
    );
  },
};

// ── Customer testimonial ─────────────────────────────────────────────

interface TestimonialCopy {
  quote: string;
  author: string;
  detail: string;
}

const customerTestimonial: FormatDef<TestimonialCopy> = {
  id: "customer-testimonial",
  name: "Customer Testimonial",
  category: "social-proof",
  summary: "A clean five-star quote card over the product.",
  useWhen: "The default social-proof unit. Reach for it when a real customer said it better than your copywriter could.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    quote: "No bloating at all. Amazing flavour with no chalkiness, which is so rare. It's been light and I actually look forward to my shake.",
    author: "Danielle R.",
    detail: "Verified customer · 4 months in",
  },
  guidance:
    "One specific outcome, one sensory detail, one honest caveat-turned-positive. Under 180 characters. " +
    "The detail line establishes how long they've used it — recency and duration both read as credibility.",
  parse: shapeOf<TestimonialCopy>({ quote: "", author: "", detail: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;display:flex;flex-direction:column;">
        <div style="flex:1;display:flex;align-items:center;justify-content:center;background:var(--surface);padding:${
          p * 0.8
        }px;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:76%;max-height:${
            ctx.canvas.height * 0.4
          }px;object-fit:contain;filter:drop-shadow(0 30px 56px rgba(0,0,0,0.2));"/>
        </div>
        <div style="background:var(--bg);padding:${p * 0.85}px 70px;display:flex;flex-direction:column;">
          ${stars(5, "#FFB020", 38)}
          <div class="h" style="font-size:${fitHeadline(ctx.copy.quote, {
            max: 52,
            min: 34,
            per: 90,
          })}px;font-weight:600;line-height:1.34;margin-top:28px;">&ldquo;${esc(ctx.copy.quote)}&rdquo;</div>
          <div style="display:flex;align-items:baseline;gap:16px;margin-top:30px;">
            <span style="font-size:30px;font-weight:700;">${esc(ctx.copy.author)}</span>
            <span style="font-size:27px;color:var(--muted);">${esc(ctx.copy.detail)}</span>
          </div>
        </div>
        <div style="height:20px;background:var(--accent);"></div>
      </div>`,
    );
  },
};

// ── UGC quote ────────────────────────────────────────────────────────

interface UgcCopy {
  overlay: string;
  caption: string;
}

const ugcTestimonial: FormatDef<UgcCopy> = {
  id: "ugc-testimonial",
  name: "UGC Caption",
  category: "social-proof",
  summary: "A creator-style caption burned over a lifestyle photo.",
  useWhen: "You have real customer or creator photography and want the ad to look like organic content.",
  sizes: ["4:5", "9:16", "1:1"],
  example: {
    overlay: "The best purchase I have ever made on Amazon…",
    caption: "no exaggeration, three weeks in",
  },
  guidance:
    "The overlay is a spoken fragment, sentence case, trailing ellipsis — as if it were the first line of a voiceover. " +
    "The caption is a lowercase aside. Under 60 characters each.",
  parse: shapeOf<UgcCopy>({ overlay: "", caption: "" }),
  build(ctx) {
    return shell(
      ctx,
      `<div style="flex:1;position:relative;display:flex;flex-direction:column;justify-content:flex-start;">
        <img src="${ctx.photoDataUri}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.42) 0%, transparent 40%, rgba(0,0,0,0.5) 100%);"></div>
        <div style="position:relative;padding:${pad(ctx)}px 66px 0;text-align:center;">
          <div class="h" style="font-size:${fitHeadline(ctx.copy.overlay, {
            max: 62,
            min: 40,
            per: 42,
          })}px;font-weight:600;color:#FFFFFF;line-height:1.24;text-shadow:0 3px 18px rgba(0,0,0,0.45);">${esc(
            ctx.copy.overlay,
          )}</div>
        </div>
        <div style="position:relative;margin-top:auto;padding:0 66px ${pad(ctx)}px;text-align:center;">
          <div style="display:inline-block;background:rgba(0,0,0,0.55);border-radius:14px;padding:16px 28px;font-size:32px;color:#FFFFFF;">${esc(
            ctx.copy.caption,
          )}</div>
        </div>
      </div>`,
    );
  },
};

export const SOCIAL_PROOF_FORMATS: AnyFormat[] = [
  trustpilotReview,
  zeroStars,
  customerTestimonial,
  ugcTestimonial,
];
