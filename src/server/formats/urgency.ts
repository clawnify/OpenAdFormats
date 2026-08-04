/**
 * Urgency & warning formats — the creative borrows the visual language of an
 * alert so the eye stops before the brain decides it's an ad.
 *
 * These are the easiest formats to ship and the easiest to abuse. Every one of
 * them carries a `guidance` line telling the copy model to only state scarcity
 * that is actually true, because a fake "only 47 left" is both a Meta policy
 * problem and a brand problem. The engine can't verify the claim — the brief's
 * `offer` field is the only thing it will build one from.
 */

import { esc, fitHeadline, pad, shell } from "./kit";
import { shapeOf, type AnyFormat, type FormatDef } from "./types";

// ── Low stock alert ──────────────────────────────────────────────────

interface StockCopy {
  alert: string;
  offer: string;
  detail: string;
  cta: string;
}

const lowStockAlert: FormatDef<StockCopy> = {
  id: "low-stock-alert",
  name: "Low Stock Alert",
  category: "urgency",
  summary: "A banner styled like an inventory warning above the product.",
  useWhen: "Stock is genuinely limited or a price is genuinely rising. Only reach for it when the scarcity is real.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    alert: "Low stock alert",
    offer: "Subscribe & save — 6-bottle supply",
    detail: "Only 47 units remaining at the $26.17/bottle price",
    cta: "Subscribe & lock in price",
  },
  guidance:
    "ONLY state a number or deadline that appears in the brief's offer field. If the brief gives no real scarcity, " +
    "write the detail line about the offer's value instead and leave numbers out entirely. Never invent a countdown.",
  parse: shapeOf<StockCopy>({ alert: "", offer: "", detail: "", cta: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:#FFFFFF;display:flex;flex-direction:column;padding:${p}px 58px;">
        <div style="border:3px solid #C8901F;border-radius:14px;overflow:hidden;">
          <div style="background:#C8901F;color:#FFFFFF;padding:22px 30px;display:flex;align-items:center;gap:16px;
            font-size:34px;font-weight:800;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.6"><path d="M12 9v5M12 17.5v.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0z"/></svg>
            ${esc(ctx.copy.alert)}
          </div>
          <div style="background:#FDF6E6;padding:30px;text-align:center;">
            <div style="font-size:34px;font-weight:700;color:#7A5A12;">${esc(ctx.copy.offer)}</div>
            <div style="font-size:29px;color:#8A6E2F;margin-top:14px;">${esc(ctx.copy.detail)}</div>
          </div>
          <div style="background:#FDF6E6;padding:0 30px 30px;">
            <div style="border:2px solid #C8901F;border-radius:10px;padding:22px;text-align:center;
              font-size:30px;font-weight:700;color:#7A5A12;">[ ${esc(ctx.copy.cta)} → ]</div>
          </div>
        </div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding-top:40px;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:78%;max-height:${
            ctx.canvas.height * 0.42
          }px;object-fit:contain;filter:drop-shadow(0 26px 50px rgba(0,0,0,0.18));"/>
        </div>
      </div>`,
    );
  },
};

// ── Warning ──────────────────────────────────────────────────────────

interface WarningCopy {
  warning: string;
  deadline: string;
  cta: string;
}

const warning: FormatDef<WarningCopy> = {
  id: "warning",
  name: "Warning Banner",
  category: "urgency",
  summary: "A red hazard bar over a warehouse-style product shot.",
  useWhen: "The last day of a sale, or a genuine deadline. The loudest format here — use it once, not weekly.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    warning: "Warning:",
    deadline: "Only 24 hours left",
    cta: "Order now | 50% off",
  },
  guidance:
    "Three fields, all short. The deadline must come from the brief's offer field — if there is no stated deadline, " +
    "say what the offer is instead ('Last of the winter batch'). Never fabricate a clock.",
  parse: shapeOf<WarningCopy>({ warning: "", deadline: "", cta: "" }),
  build(ctx) {
    return shell(
      ctx,
      `<div style="flex:1;position:relative;display:flex;flex-direction:column;">
        <img src="${ctx.photoDataUri}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.18);"></div>
        <div style="position:relative;margin-top:${pad(ctx) * 0.8}px;align-self:center;display:flex;align-items:center;gap:20px;
          background:#D32F2F;color:#FFFFFF;padding:22px 44px;border-radius:10px;box-shadow:0 16px 40px rgba(0,0,0,0.35);">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.6"><path d="M12 9v5M12 17.5v.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0z"/></svg>
          <div class="h" style="font-size:56px;font-weight:900;letter-spacing:0.01em;">${esc(ctx.copy.warning)}</div>
        </div>
        <div style="position:relative;align-self:center;margin-top:-8px;background:#FFFFFF;color:#D32F2F;
          padding:14px 34px;border-radius:0 0 10px 10px;font-size:32px;font-weight:700;">${esc(ctx.copy.deadline)}</div>
        <div style="position:relative;margin-top:auto;background:#D32F2F;color:#FFFFFF;text-align:center;
          padding:30px;font-size:38px;font-weight:800;letter-spacing:0.02em;">${esc(ctx.copy.cta)}</div>
      </div>`,
    );
  },
};

// ── Breaking news ────────────────────────────────────────────────────

interface NewsCopy {
  ticker: string;
  headline: string;
  standfirst: string;
}

const breakingNews: FormatDef<NewsCopy> = {
  id: "breaking-news",
  name: "Breaking News",
  category: "urgency",
  summary: "A news-chyron treatment over a photo — the story is your category shifting.",
  useWhen: "Something in the category genuinely changed (a study, a regulation, a shortage) and you benefit from it.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    ticker: "Breaking news",
    headline: "America's favourite drive-thru lemonade has 65g of sugar. Here's what people are switching to instead.",
    standfirst: "Nutritionists are pointing to a 4g alternative that tastes closer to the original.",
  },
  guidance:
    "Write it as a news desk would: third person, no 'we', no 'our'. The product is what people switched TO, " +
    "mentioned as a fact in the story. Headline under 130 characters. Never imply a real outlet endorsed you.",
  parse: shapeOf<NewsCopy>({ ticker: "", headline: "", standfirst: "" }),
  build(ctx) {
    return shell(
      ctx,
      `<div style="flex:1;background:#0B0B0D;display:flex;flex-direction:column;">
        <div style="flex:1;position:relative;overflow:hidden;">
          <img src="${ctx.photoDataUri}" alt="" style="width:100%;height:100%;object-fit:cover;"/>
        </div>
        <div style="background:#0B0B0D;padding:0 0 ${pad(ctx) * 0.8}px;">
          <div style="display:inline-block;background:#D32F2F;color:#FFFFFF;font-size:26px;font-weight:800;
            letter-spacing:0.12em;text-transform:uppercase;padding:14px 26px;margin:26px 0 0 44px;">${esc(
              ctx.copy.ticker,
            )}</div>
          <div class="h" style="font-size:${fitHeadline(ctx.copy.headline, {
            max: 50,
            min: 34,
            per: 78,
          })}px;font-weight:700;color:#FFFFFF;line-height:1.24;margin:26px 44px 0;">${esc(ctx.copy.headline)}</div>
          <div style="font-size:28px;color:#9AA1AC;margin:22px 44px 0;line-height:1.4;">${esc(ctx.copy.standfirst)}</div>
        </div>
      </div>`,
    );
  },
};

// ── In case of emergency ─────────────────────────────────────────────

interface EmergencyCopy {
  caseOf: string;
  action: string;
  brand: string;
}

const caseOfEmergency: FormatDef<EmergencyCopy> = {
  id: "case-of-emergency",
  name: "In Case Of",
  category: "urgency",
  summary: "A break-glass case, with the product as the emergency remedy.",
  useWhen: "The product is what someone reaches for at a specific moment of need. Playful, memorable, very shareable.",
  sizes: ["1:1", "4:5"],
  example: {
    caseOf: "In case of low energy",
    action: "Break glass",
    brand: "London Nootropics",
  },
  guidance:
    "The 'in case of' names the exact moment of need in 2-4 words. The action is always two words. " +
    "This format carries almost no copy on purpose — resist adding a benefit line.",
  parse: shapeOf<EmergencyCopy>({ caseOf: "", action: "", brand: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:#DDE5DC;display:flex;flex-direction:column;align-items:center;padding:${p}px 66px;">
        <div style="font-size:24px;letter-spacing:0.18em;text-transform:uppercase;color:#5C6B60;">${esc(
          ctx.copy.brand,
        )}</div>
        <div style="flex:1;width:100%;margin-top:${
          p * 0.6
        }px;background:#EFEAD8;border:14px solid #C7B896;border-radius:6px;
          display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:52px 44px;
          box-shadow:inset 0 0 0 4px rgba(255,255,255,0.6), 0 22px 50px rgba(0,0,0,0.18);">
          <div class="h" style="font-size:${fitHeadline(ctx.copy.caseOf, {
            max: 54,
            min: 36,
            per: 24,
          })}px;font-weight:700;color:#3B3320;text-align:center;text-transform:uppercase;letter-spacing:0.04em;line-height:1.2;">${esc(
            ctx.copy.caseOf,
          )}</div>
          <img src="${ctx.photoDataUri}" alt="" style="max-width:70%;max-height:${
            ctx.canvas.height * 0.32
          }px;object-fit:contain;"/>
          <div style="font-size:40px;font-weight:800;color:#B03A2E;text-transform:uppercase;letter-spacing:0.14em;">${esc(
            ctx.copy.action,
          )}</div>
        </div>
      </div>`,
    );
  },
};

// ── Apology ──────────────────────────────────────────────────────────

interface ApologyCopy {
  headline: string;
  body: string[];
  makeGood: string;
}

const apology: FormatDef<ApologyCopy> = {
  id: "apology",
  name: "Apology",
  category: "urgency",
  summary: "A public sorry — for selling out, for a delay, for underestimating demand.",
  useWhen: "Something actually went wrong, or demand actually outran supply. Reads as human and converts unusually well.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    headline: "We're so sorry!",
    body: [
      "As many of you know, we've been busy planning our latest limited-edition flavour.",
      "We were so busy, we forgot to tell you — each serving now packs as much prebiotic fibre as 12 cups of raw broccoli. Kind of important if you're on a GLP-1.",
    ],
    makeGood: "So here's a little something to make it right: 61% off + free gifts on your first order.",
  },
  guidance:
    "Apologise for one specific, real thing — never a manufactured mistake. Two short paragraphs, warm and plain. " +
    "The make-good is the offer, stated last, and must match the brief's offer field.",
  parse: shapeOf<ApologyCopy>({ headline: "", body: [""], makeGood: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:#FBF6E9;display:flex;flex-direction:column;padding:${p}px 60px;">
        <div class="h" style="font-size:${fitHeadline(ctx.copy.headline, {
          max: 92,
          min: 52,
          per: 18,
        })}px;font-weight:900;color:#1DA84C;line-height:0.98;text-transform:uppercase;">${esc(ctx.copy.headline)}</div>
        <div style="display:flex;flex-direction:column;gap:24px;margin-top:38px;">
          ${ctx.copy.body
            .slice(0, 3)
            .map((b) => `<div style="font-size:28px;line-height:1.5;color:#3A4038;">${esc(b)}</div>`)
            .join("")}
        </div>
        <div style="font-size:29px;line-height:1.5;color:#1DA84C;font-weight:700;margin-top:30px;">${esc(
          ctx.copy.makeGood,
        )}</div>
        <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:34px;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:82%;max-height:${
            ctx.canvas.height * 0.34
          }px;object-fit:contain;"/>
        </div>
      </div>`,
    );
  },
};

// ── Side effect ──────────────────────────────────────────────────────

interface SideEffectCopy {
  label: string;
  effect: string;
}

const sideEffect: FormatDef<SideEffectCopy> = {
  id: "side-effect",
  name: "Side Effect",
  category: "urgency",
  summary: "A warning-label parody where the 'side effect' is the benefit.",
  useWhen: "The benefit is blunt enough to be funny stated as a risk. Pattern-interrupt with a punchline.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    label: "Side effect",
    effect: "Cravings & belly fat may disappear",
  },
  guidance:
    "The effect is phrased exactly like a medical warning — 'may', 'can', 'has been reported to' — but describes " +
    "something the buyer wants. Under 50 characters. One joke, delivered straight.",
  parse: shapeOf<SideEffectCopy>({ label: "", effect: "" }),
  build(ctx) {
    return shell(
      ctx,
      `<div style="flex:1;background:#FFFFFF;display:flex;flex-direction:column;">
        <div style="position:relative;flex:1;display:flex;align-items:center;justify-content:center;padding:${
          pad(ctx) * 0.7
        }px 54px;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:80%;max-height:100%;object-fit:contain;"/>
          <div style="position:absolute;top:${
            pad(ctx) * 0.9
          }px;left:0;background:#D32F2F;color:#FFFFFF;font-size:56px;font-weight:900;
            letter-spacing:0.04em;text-transform:uppercase;padding:20px 44px;transform:rotate(-4deg);
            box-shadow:0 14px 34px rgba(0,0,0,0.28);">${esc(ctx.copy.label)}</div>
        </div>
        <div style="background:#D32F2F;color:#FFFFFF;text-align:center;padding:40px 54px;">
          <div class="h" style="font-size:${fitHeadline(ctx.copy.effect, {
            max: 58,
            min: 38,
            per: 40,
          })}px;font-weight:800;text-transform:uppercase;line-height:1.14;">${esc(ctx.copy.effect)}</div>
        </div>
      </div>`,
    );
  },
};

export const URGENCY_FORMATS: AnyFormat[] = [
  lowStockAlert,
  warning,
  breakingNews,
  caseOfEmergency,
  apology,
  sideEffect,
];
