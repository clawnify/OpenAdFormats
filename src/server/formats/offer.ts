/**
 * Offer & hook formats — the creative leads with the commercial proposition or
 * with a hook sharp enough to stop the scroll on its own.
 *
 * The three "negative hook" formats here (don't buy this / don't be an idiot /
 * stop doing this) all open by telling the viewer NOT to do something. They
 * share that mechanic but not a layout, because the whole point of each is a
 * different visual register: disqualification, price shame, and habit
 * correction respectively.
 */

import { check, esc, fitHeadline, kicker, pad, shell } from "./kit";
import { shapeOf, type AnyFormat, type FormatDef } from "./types";

// ── Don't buy this ───────────────────────────────────────────────────

interface DontBuyCopy {
  headline: string;
  qualifier: string;
  wasPrice: string;
  nowPrice: string;
  features: string[];
  cta: string;
}

const dontBuyThis: FormatDef<DontBuyCopy> = {
  id: "dont-buy-this",
  name: "Don't Buy This",
  category: "offer",
  summary: "Opens by disqualifying most of the audience, then makes the offer to whoever is left.",
  useWhen: "Your product genuinely isn't for everyone. Reverse psychology that also improves lead quality.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    headline: "Don't buy this",
    qualifier: "if you slick your hair.",
    wasPrice: "£25",
    nowPrice: "£14.99",
    features: ["Texture & volume", "Natural matte hold"],
    cta: "Shop now",
  },
  guidance:
    "The qualifier names a REAL segment the product doesn't suit — a use case, not an insult. " +
    "It must be a genuine exclusion, otherwise the hook reads as a trick. Two features maximum.",
  parse: shapeOf<DontBuyCopy>({
    headline: "",
    qualifier: "",
    wasPrice: "",
    nowPrice: "",
    features: [""],
    cta: "",
  }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:linear-gradient(165deg,#1B2430 0%,#0C121A 100%);display:flex;flex-direction:column;
        align-items:center;padding:${p}px 54px;text-align:center;">
        <div class="h" style="font-size:${fitHeadline(ctx.copy.headline, {
          max: 84,
          min: 52,
          per: 18,
        })}px;font-weight:900;color:#FFFFFF;text-transform:uppercase;line-height:1;">${esc(ctx.copy.headline)}</div>
        <div style="font-size:38px;color:#C3CBD6;margin-top:16px;">${esc(ctx.copy.qualifier)}</div>
        <div style="display:flex;align-items:baseline;gap:22px;margin-top:30px;" class="tnum">
          <span style="font-size:52px;color:#7C8798;text-decoration:line-through;">${esc(ctx.copy.wasPrice)}</span>
          <span style="font-size:72px;font-weight:900;color:#E5484D;">${esc(ctx.copy.nowPrice)}</span>
        </div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:24px 0;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:86%;max-height:100%;object-fit:contain;
            filter:drop-shadow(0 30px 60px rgba(0,0,0,0.5));"/>
        </div>
        <div style="display:flex;gap:44px;justify-content:center;margin-bottom:28px;">
          ${ctx.copy.features
            .slice(0, 3)
            .map(
              (f) => `<div style="display:flex;align-items:center;gap:12px;color:#C9A227;font-size:24px;
                letter-spacing:0.06em;text-transform:uppercase;">${check("#C9A227", 26, 3)}${esc(f)}</div>`,
            )
            .join("")}
        </div>
        <div style="width:100%;background:#E5484D;color:#FFFFFF;border-radius:6px;padding:24px;
          font-size:32px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">${esc(ctx.copy.cta)}</div>
      </div>`,
    );
  },
};

// ── Don't be an idiot ────────────────────────────────────────────────

interface IdiotCopy {
  line1: string;
  line2: string;
  subline: string;
  dealLabel: string;
  freeLabel: string;
}

const dontBeAnIdiot: FormatDef<IdiotCopy> = {
  id: "dont-be-an-idiot",
  name: "Don't Pay Full Price",
  category: "offer",
  summary: "A blunt, almost rude headline over a multi-buy deal.",
  useWhen: "The offer is the whole argument and the product needs no explaining. Works on repeat purchases.",
  sizes: ["1:1", "4:5"],
  example: {
    line1: "Don't be an",
    line2: "idiot.",
    subline: "don't pay full price",
    dealLabel: "buy 3",
    freeLabel: "2 free",
  },
  guidance:
    "The insult is aimed at the SITUATION, never the reader personally — 'don't be an idiot' about overpaying is " +
    "fine, anything about the person is not. Deal labels are 2-3 words. Keep it to five words total in the headline.",
  parse: shapeOf<IdiotCopy>({ line1: "", line2: "", subline: "", dealLabel: "", freeLabel: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:#F6F1E7;display:flex;flex-direction:column;align-items:center;padding:${p}px 56px;text-align:center;">
        <div class="h" style="font-size:52px;font-weight:600;color:#2A2D34;">${esc(ctx.copy.line1)}</div>
        <div class="h" style="font-size:120px;font-weight:900;color:#D9302A;line-height:0.92;letter-spacing:-0.03em;
          text-transform:uppercase;">${esc(ctx.copy.line2)}</div>
        <div style="font-size:34px;color:#5C6068;margin-top:14px;">${esc(ctx.copy.subline)}</div>
        <div style="position:relative;flex:1;width:100%;display:flex;align-items:center;justify-content:center;margin-top:20px;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:84%;max-height:100%;object-fit:contain;"/>
          <div style="position:absolute;left:2%;bottom:8%;background:#F5C518;color:#2A2D34;border-radius:50%;
            width:170px;height:170px;display:flex;align-items:center;justify-content:center;font-size:34px;
            font-weight:800;transform:rotate(-12deg);text-align:center;padding:12px;">${esc(ctx.copy.dealLabel)}</div>
          <div style="position:absolute;right:2%;top:6%;background:#2A2D34;color:#FFFFFF;border-radius:50%;
            width:150px;height:150px;display:flex;align-items:center;justify-content:center;font-size:32px;
            font-weight:800;transform:rotate(9deg);text-align:center;padding:12px;">${esc(ctx.copy.freeLabel)}</div>
        </div>
      </div>`,
    );
  },
};

// ── Stop doing this ──────────────────────────────────────────────────

interface StopCopy {
  headline: string;
  proof: string;
  supporting: string;
}

const stopDoingThis: FormatDef<StopCopy> = {
  id: "stop-doing-this",
  name: "Stop Doing This",
  category: "offer",
  summary: "A big-type instruction to abandon a habit, with the alternative underneath.",
  useWhen: "The competing behaviour is a habit rather than a rival product — the thing they do instead of buying anything.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    headline: "Stop acne in 5 days without Accutane",
    proof: "Join 50,000+ customers",
    supporting: "Three balms. No prescription. No purge phase.",
  },
  guidance:
    "Name the specific thing to stop — a named alternative, a habit, a cost — not a vague 'stop struggling'. " +
    "The proof line is a real customer count or credential from the brief, or omitted entirely.",
  parse: shapeOf<StopCopy>({ headline: "", proof: "", supporting: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;position:relative;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:${p}px 54px;">
        <img src="${ctx.photoDataUri}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,14,8,0.72),rgba(20,14,8,0.48));"></div>
        <div style="position:relative;">
          ${kicker(ctx.copy.proof, "#E8C87A")}
          <div class="h" style="font-size:${fitHeadline(ctx.copy.headline, {
            max: 80,
            min: 46,
            per: 32,
          })}px;font-weight:700;color:#FFF8EC;line-height:1.1;margin-top:26px;">${esc(ctx.copy.headline)}</div>
          <div style="font-size:32px;color:#E0D6C6;margin-top:30px;">${esc(ctx.copy.supporting)}</div>
        </div>
      </div>`,
    );
  },
};

// ── Stat headline ────────────────────────────────────────────────────

interface StatCopy {
  stat: string;
  claim: string;
  supports: string[];
  footnote: string;
}

const statHeadline: FormatDef<StatCopy> = {
  id: "stat-headline",
  name: "Stat Headline",
  category: "offer",
  summary: "One large number carrying the whole argument.",
  useWhen: "You have a real, citable statistic. The footnote is mandatory — an uncited stat is a liability.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    stat: "82%",
    claim: "would buy it again",
    supports: ["For post-meal bloating", "Supports healthy bile production", "60-day money-back guarantee"],
    footnote: "Based on a survey of 221 customers who used Northwind for 30+ days. Results may vary.",
  },
  guidance:
    "The stat MUST come from the brief's proof list — never invent or round one. The footnote states the sample " +
    "and the period. If the brief has no statistic, this format should not be generated at all.",
  parse: shapeOf<StatCopy>({ stat: "", claim: "", supports: [""], footnote: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:#F2F5F0;display:flex;flex-direction:column;padding:${p}px 58px;">
        <div style="position:relative;display:inline-block;align-self:flex-start;">
          <div style="position:absolute;left:0;right:-10px;bottom:16px;height:26px;background:var(--accent);opacity:0.4;"></div>
          <div class="h tnum" style="position:relative;font-size:170px;font-weight:900;line-height:0.86;color:#1E2A20;">${esc(
            ctx.copy.stat,
          )}</div>
        </div>
        <div style="font-size:40px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:#1E2A20;margin-top:10px;">${esc(
          ctx.copy.claim,
        )}</div>
        <div style="display:flex;flex-direction:column;gap:16px;margin-top:36px;">
          ${ctx.copy.supports
            .slice(0, 4)
            .map(
              (s) => `<div style="display:flex;align-items:center;gap:16px;background:#1E3A24;color:#EAF3EA;
                border-radius:8px;padding:18px 26px;font-size:26px;">${check("#8FD19E", 24, 3)}${esc(s)}</div>`,
            )
            .join("")}
        </div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:26px 0;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:64%;max-height:100%;object-fit:contain;"/>
        </div>
        <div style="font-size:19px;line-height:1.4;color:#6E7A70;">${esc(ctx.copy.footnote)}</div>
      </div>`,
    );
  },
};

// ── Static big type ──────────────────────────────────────────────────

interface BigTypeCopy {
  lines: string[];
  highlight: string;
  footer: string;
}

const staticBigType: FormatDef<BigTypeCopy> = {
  id: "static-big-type",
  name: "Static Big Type",
  category: "offer",
  summary: "Typography only — a short story told in one paragraph, one word highlighted.",
  useWhen: "The message is emotional rather than featural, and no image would improve it. Cheapest format to produce.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    lines: [
      "If you're depressed and your house is always a mess,",
      "the support you need should be",
      "That's why we created Finch, a self-care app with a pet bird that grows when you complete daily tasks.",
    ],
    highlight: "FREE.",
    footer: "You can use it without paying.",
  },
  guidance:
    "Write like a personal note, not a headline — full sentences, one idea. The highlight is ONE word or short " +
    "phrase that lands the promise. Total under 320 characters across all lines.",
  parse: shapeOf<BigTypeCopy>({ lines: [""], highlight: "", footer: "" }),
  build(ctx) {
    const p = pad(ctx);
    const [first, second, ...rest] = ctx.copy.lines;
    return shell(
      ctx,
      `<div style="flex:1;background:#DCD9C8;display:flex;flex-direction:column;justify-content:center;padding:${p}px 62px;">
        <div style="font-size:42px;line-height:1.42;color:#4A5A48;">
          ${esc(first ?? "")}
          ${second ? ` ${esc(second)}` : ""}
          <span style="color:#C4622D;font-weight:800;"> ${esc(ctx.copy.highlight)}</span>
        </div>
        ${rest
          .map(
            (l) => `<div style="font-size:38px;line-height:1.42;color:#4A5A48;margin-top:28px;">${esc(l)}</div>`,
          )
          .join("")}
        <div style="font-size:38px;line-height:1.42;color:#C4622D;margin-top:28px;">${esc(ctx.copy.footer)}</div>
      </div>`,
    );
  },
};

// ── Bundle offer ─────────────────────────────────────────────────────

interface BundleCopy {
  banner: string;
  headline: string;
  wasPrice: string;
  nowPrice: string;
  cta: string;
}

const bundleOffer: FormatDef<BundleCopy> = {
  id: "bundle-offer",
  name: "Bundle Offer",
  category: "offer",
  summary: "A framed sale banner with struck-through pricing and the bundle laid out.",
  useWhen: "A seasonal or bundled promotion where the price is the hook. The most commercial format here.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    banner: "Limited time only",
    headline: "Summer starter set",
    wasPrice: "$169",
    nowPrice: "$29",
    cta: "Get the starter kit plus free creamer",
  },
  guidance:
    "Prices must match the brief's offer field exactly — never invent an anchor price. " +
    "The headline names the bundle, not the benefit. Banner is 2-4 words.",
  parse: shapeOf<BundleCopy>({ banner: "", headline: "", wasPrice: "", nowPrice: "", cta: "" }),
  build(ctx) {
    const p = pad(ctx);
    const rule = `<div style="height:14px;background:var(--accent);display:flex;align-items:center;justify-content:center;gap:20px;"></div>`;
    return shell(
      ctx,
      `<div style="flex:1;background:#FFFFFF;display:flex;flex-direction:column;">
        ${rule}
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:${
          p * 0.7
        }px 54px;">
          <div style="font-size:26px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:var(--accent);">${esc(
            ctx.copy.banner,
          )}</div>
          <div class="h" style="font-size:${fitHeadline(ctx.copy.headline, {
            max: 72,
            min: 44,
            per: 24,
          })}px;font-weight:800;margin-top:18px;line-height:1.06;">${esc(ctx.copy.headline)}</div>
          <div style="display:flex;align-items:baseline;gap:24px;margin-top:20px;" class="tnum">
            <span style="font-size:56px;color:#B0B6BF;text-decoration:line-through;">${esc(ctx.copy.wasPrice)}</span>
            <span style="font-size:96px;font-weight:900;color:var(--accent);line-height:1;">${esc(
              ctx.copy.nowPrice,
            )}</span>
          </div>
          <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px 0;">
            <img src="${ctx.photoDataUri}" alt="" style="max-width:94%;max-height:100%;object-fit:contain;"/>
          </div>
          <div style="width:100%;background:var(--accent);color:var(--on-accent);border-radius:6px;padding:22px;
            font-size:28px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">${esc(ctx.copy.cta)}</div>
        </div>
        ${rule}
      </div>`,
    );
  },
};

// ── Free ticket ──────────────────────────────────────────────────────

interface TicketCopy {
  headline: string;
  subline: string;
  tabs: string[];
}

const freeTicket: FormatDef<TicketCopy> = {
  id: "free-ticket",
  name: "Tear-Off Ticket",
  category: "offer",
  summary: "A community-board flyer with tear-off tabs, photographed in the wild.",
  useWhen: "You want the offer to feel local, human and low-pressure. Disarms the 'this is a big brand' resistance.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    headline: "Headspace is 50% off",
    subline: "for a limited time",
    tabs: ["Better sleep", "Stress less", "Reduce anxiety", "Avoid burnout", "More happiness"],
  },
  guidance:
    "The headline is the offer stated plainly. Tabs are 2-3 word benefits, one per tear-off strip — 5 of them. " +
    "Everything lowercase-friendly and unpolished; this format dies if it looks designed.",
  parse: shapeOf<TicketCopy>({ headline: "", subline: "", tabs: [""] }),
  build(ctx) {
    const p = pad(ctx);
    const tabs = ctx.copy.tabs
      .slice(0, 5)
      .map(
        (t) => `<div style="flex:1;border-left:2px dashed #C9CED6;padding:20px 8px;display:flex;align-items:center;
          justify-content:center;font-size:20px;color:#5C6068;writing-mode:vertical-rl;transform:rotate(180deg);
          letter-spacing:0.04em;">${esc(t)}</div>`,
      )
      .join("");
    return shell(
      ctx,
      `<div style="flex:1;position:relative;display:flex;align-items:center;justify-content:center;padding:${p}px 60px;">
        <img src="${ctx.photoDataUri}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(0.94);"/>
        <div style="position:relative;background:#F7F8FA;width:100%;max-width:660px;border-radius:6px;
          box-shadow:0 26px 60px rgba(0,0,0,0.28);display:flex;flex-direction:column;overflow:hidden;">
          <div style="padding:52px 44px 40px;text-align:center;">
            <div style="font-size:26px;color:#6B7280;">Take what you need</div>
            <div class="h" style="font-size:${fitHeadline(ctx.copy.headline, {
              max: 58,
              min: 36,
              per: 26,
            })}px;font-weight:700;margin-top:20px;line-height:1.12;color:#1B2430;">${esc(ctx.copy.headline)}</div>
            <div style="font-size:26px;color:#6B7280;margin-top:14px;">${esc(ctx.copy.subline)}</div>
          </div>
          <div style="display:flex;height:230px;border-top:2px dashed #C9CED6;">${tabs}</div>
        </div>
      </div>`,
    );
  },
};

// ── Objection handler ────────────────────────────────────────────────

interface ObjectionCopy {
  objection: string;
  answer: string;
  closer: string;
}

const objectionHandler: FormatDef<ObjectionCopy> = {
  id: "objection-handler",
  name: "Objection Handler",
  category: "offer",
  summary: "The doubt stated out loud, then answered in a handwritten-note register.",
  useWhen: "One specific objection is killing conversion and you know exactly what it is.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    objection: "“No chance I'm going back to another meal kit after THIS”",
    answer:
      "I've literally tried LOADS of them, but they all only have 1 or 2 dishes that my kids will ACTUALLY eat. I found out that RIGHT NOW, Hellofresh is offering 50% off your first month, with a range of family meal boxes.",
    closer: "Click below TODAY!",
  },
  guidance:
    "Quote the objection in the customer's own voice, in quote marks, with their emphasis. The answer concedes " +
    "the objection is fair before resolving it. Never dismiss the doubt — agree with it, then move past it.",
  parse: shapeOf<ObjectionCopy>({ objection: "", answer: "", closer: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;position:relative;display:flex;flex-direction:column;justify-content:flex-end;">
        <img src="${ctx.photoDataUri}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>
        <div style="position:absolute;inset:0;background:rgba(255,255,255,0.12);"></div>
        <div style="position:relative;margin:0 46px ${p * 0.8}px;display:flex;gap:22px;">
          <div style="flex:1;background:#FFFDF6;border-radius:4px;padding:34px 30px;transform:rotate(-1.4deg);
            box-shadow:0 16px 36px rgba(0,0,0,0.22);">
            <div style="font-size:28px;line-height:1.4;font-weight:700;color:#B03A2E;">${esc(ctx.copy.objection)}</div>
          </div>
          <div style="flex:1.2;background:#FFFDF6;border-radius:4px;padding:34px 30px;transform:rotate(1deg);
            box-shadow:0 16px 36px rgba(0,0,0,0.22);display:flex;flex-direction:column;">
            <div style="font-size:25px;line-height:1.44;color:#2A2D34;">${esc(ctx.copy.answer)}</div>
            <div style="font-size:26px;font-weight:800;color:#B03A2E;margin-top:18px;">${esc(ctx.copy.closer)}</div>
          </div>
        </div>
      </div>`,
    );
  },
};

export const OFFER_FORMATS: AnyFormat[] = [
  dontBuyThis,
  dontBeAnIdiot,
  stopDoingThis,
  statHeadline,
  staticBigType,
  bundleOffer,
  freeTicket,
  objectionHandler,
];
