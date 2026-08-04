/**
 * List & teaching formats — the creative gives something away before it asks
 * for anything. The product arrives as the last item, or as the thing that
 * makes the list actionable.
 *
 * These carry the highest save/share rate of any static format, which is also
 * why they need the tightest copy discipline: a list that teaches nothing is
 * just a bulleted ad.
 */

import { esc, fitHeadline, pad, shell, tint } from "./kit";
import { shapeOf, type AnyFormat, type FormatDef } from "./types";

// ── X reasons why ────────────────────────────────────────────────────

interface ReasonsCopy {
  headline: string;
  reasons: string[];
  cta: string;
}

const xReasonsWhy: FormatDef<ReasonsCopy> = {
  id: "x-reasons-why",
  name: "X Reasons Why",
  category: "list",
  summary: "A numbered case, each reason a single line.",
  useWhen: "You have several strong, independent reasons and no single knockout one. The most reliable format on this list.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    headline: "5 reasons this actually works",
    reasons: [
      "Works from within, not just the surface",
      "Reaches deep lung tissue daily",
      "Clears build-up causing wheezing",
      "Restores function after decades of smoking",
      "Just two tablets per day",
    ],
    cta: "Clean your lungs daily",
  },
  guidance:
    "Each reason is a mechanism or a fact, never an adjective. Lead with a verb where you can. " +
    "Under 45 characters per line. The headline states the count and matches the number of reasons exactly.",
  parse: shapeOf<ReasonsCopy>({ headline: "", reasons: [""], cta: "" }),
  build(ctx) {
    const p = pad(ctx);
    const items = ctx.copy.reasons
      .slice(0, 6)
      .map(
        (r, i) => `<div style="display:flex;gap:26px;align-items:center;background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.12);border-radius:999px;padding:22px 34px;">
          <div style="flex-shrink:0;width:56px;height:56px;border-radius:50%;background:var(--accent);color:var(--on-accent);
            display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800;">${i + 1}</div>
          <div style="font-size:30px;line-height:1.3;color:#F2F3F5;">${esc(r)}</div>
        </div>`,
      )
      .join("");
    return shell(
      ctx,
      `<div style="flex:1;background:#0E1116;display:flex;flex-direction:column;padding:${p}px 54px;">
        <div class="h" style="font-size:${fitHeadline(ctx.copy.headline, {
          max: 78,
          min: 46,
          per: 28,
        })}px;font-weight:800;color:#FFFFFF;line-height:1.08;text-transform:uppercase;">${esc(ctx.copy.headline)}</div>
        <div style="display:flex;flex-direction:column;gap:20px;margin-top:44px;">${items}</div>
        <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:34px;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:74%;max-height:${
            ctx.canvas.height * 0.24
          }px;object-fit:contain;"/>
        </div>
        <div style="margin-top:30px;background:var(--accent);color:var(--on-accent);border-radius:12px;
          padding:26px;text-align:center;font-size:32px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;">${esc(
            ctx.copy.cta,
          )}</div>
      </div>`,
    );
  },
};

// ── X signs you… ─────────────────────────────────────────────────────

interface SignsCopy {
  headline: string;
  signs: string[];
  cta: string;
}

const xSigns: FormatDef<SignsCopy> = {
  id: "x-signs",
  name: "X Signs You…",
  category: "list",
  summary: "A symptom checklist the reader diagnoses themselves against.",
  useWhen: "Your buyer doesn't yet know they have the problem. Each line they recognise pulls them further in.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    headline: "10 signs you're low in magnesium",
    signs: [
      "Constant fatigue — always feeling tired?",
      "Muscle spasms & cramps — frequent twitches?",
      "Difficulty sleeping — trouble falling asleep?",
      "Sugar cravings — constant sweet tooth?",
      "Anxiety & stress — often feel anxious?",
      "Headaches & migraines — regular headaches?",
      "Restless legs — can't keep legs still?",
      "Cold hands & feet — poor circulation?",
      "Irregular heartbeat — heart skipping beats?",
      "Poor concentration — trouble focusing?",
    ],
    cta: "Click here for your magnesium fix",
  },
  guidance:
    "Each sign is a symptom followed by an em-dash and the question the reader is already asking themselves. " +
    "Order them commonest first. 8-10 items. Never diagnose — describe.",
  parse: shapeOf<SignsCopy>({ headline: "", signs: [""], cta: "" }),
  build(ctx) {
    const p = pad(ctx);
    const items = ctx.copy.signs
      .slice(0, 10)
      .map(
        (s, i) => `<div style="display:flex;gap:16px;align-items:baseline;padding:13px 0;border-bottom:1px solid ${tint(
          ctx.brand.colors.ink,
          0.9,
        )};">
          <div style="flex-shrink:0;font-size:25px;font-weight:800;color:var(--accent);width:38px;">${i + 1}.</div>
          <div style="font-size:26px;line-height:1.35;color:var(--ink);">${esc(s)}</div>
        </div>`,
      )
      .join("");
    return shell(
      ctx,
      `<div style="flex:1;background:${tint(
        ctx.brand.colors.accent,
        0.94,
      )};display:flex;flex-direction:column;padding:${p * 0.85}px 58px;">
        <div class="h" style="font-size:${fitHeadline(ctx.copy.headline, {
          max: 64,
          min: 40,
          per: 30,
        })}px;font-weight:800;line-height:1.12;text-align:center;">${esc(ctx.copy.headline)}</div>
        <div style="margin-top:32px;">${items}</div>
        <div style="display:flex;align-items:flex-end;gap:34px;margin-top:auto;padding-top:34px;">
          <div style="flex:1;background:var(--accent);color:var(--on-accent);border-radius:10px;padding:24px;
            text-align:center;font-size:29px;font-weight:700;">${esc(ctx.copy.cta)}</div>
          <img src="${ctx.photoDataUri}" alt="" style="width:200px;max-height:230px;object-fit:contain;"/>
        </div>
      </div>`,
    );
  },
};

// ── Tier list ────────────────────────────────────────────────────────

interface TierCopy {
  headline: string;
  sTier: string[];
  aTier: string[];
  bTier: string[];
  cTier: string[];
  verdict: string;
}

const tierList: FormatDef<TierCopy> = {
  id: "tier-list",
  name: "Tier List",
  category: "list",
  summary: "Category options ranked S through C, with yours at the top.",
  useWhen: "Buyers are comparison-shopping a crowded category. Ranking is inherently engaging and inherently opinionated.",
  sizes: ["1:1", "4:5"],
  example: {
    headline: "Ranking iron-rich foods",
    sTier: ["Beef liver", "Spirulina"],
    aTier: ["Beef steak", "Oysters"],
    bTier: ["Spinach", "Lentils", "Red meat"],
    cTier: ["Fortified cereal"],
    verdict: "The most iron-rich food, now in a tasteless capsule",
  },
  guidance:
    "Rank real things in the category honestly — credibility comes from the low tiers being fair. " +
    "1-3 items per tier, each 1-3 words. The verdict line connects the top tier to the product.",
  parse: shapeOf<TierCopy>({ headline: "", sTier: [""], aTier: [""], bTier: [""], cTier: [""], verdict: "" }),
  build(ctx) {
    const p = pad(ctx);
    const TIERS: Array<[string, string, string[]]> = [
      ["S", "#E5484D", ctx.copy.sTier],
      ["A", "#F5A524", ctx.copy.aTier],
      ["B", "#F5D524", ctx.copy.bTier],
      ["C", "#7BC96F", ctx.copy.cTier],
    ];
    const row = ([letter, color, items]: [string, string, string[]]) =>
      `<div style="display:flex;min-height:110px;border-bottom:2px solid #0E1116;">
        <div style="width:120px;flex-shrink:0;background:${color};display:flex;align-items:center;justify-content:center;
          font-size:44px;font-weight:900;color:#0E1116;">${letter}</div>
        <div style="flex:1;background:#1A1D23;display:flex;align-items:center;gap:16px;padding:16px 22px;flex-wrap:wrap;">
          ${items
            .slice(0, 4)
            .map(
              (i) =>
                `<div style="background:#272B33;border-radius:8px;padding:14px 20px;font-size:26px;color:#E7E9EC;">${esc(
                  i,
                )}</div>`,
            )
            .join("")}
        </div>
      </div>`;
    return shell(
      ctx,
      `<div style="flex:1;background:#0E1116;display:flex;flex-direction:column;padding:${p * 0.7}px 44px;">
        <div style="background:var(--accent);color:var(--on-accent);border-radius:8px;padding:20px;text-align:center;
          font-size:34px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">${esc(ctx.copy.headline)}</div>
        <div style="margin-top:26px;border:2px solid #0E1116;border-radius:8px;overflow:hidden;">
          ${TIERS.map(row).join("")}
        </div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:26px 0;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:60%;max-height:${
            ctx.canvas.height * 0.22
          }px;object-fit:contain;"/>
        </div>
        <div style="background:#F5A524;color:#0E1116;border-radius:8px;padding:22px;text-align:center;font-size:28px;font-weight:700;">${esc(
          ctx.copy.verdict,
        )}</div>
      </div>`,
    );
  },
};

// ── The 101 ──────────────────────────────────────────────────────────

interface OneOhOneCopy {
  title: string;
  subtitle: string;
  steps: string[];
}

const the101: FormatDef<OneOhOneCopy> = {
  id: "the-101",
  name: "The 101",
  category: "list",
  summary: "An editorial explainer — the how-it-works, laid out like a magazine page.",
  useWhen: "The product needs teaching before it needs selling. Buys attention by being useful first.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    title: "Supergut GLP-1 Poop Hack 101",
    subtitle: "No, it's not another sugary gummy.",
    steps: [
      "It's 6g of prebiotic fibre you add to your coffee or water.",
      "It feeds the bacteria that make your own GLP-1.",
      "And it gets things moving — usually within three days.",
    ],
  },
  guidance:
    "Title ends in '101' and names the mechanism, not the benefit. Subtitle pre-empts the obvious dismissal. " +
    "Three steps, each one sentence, each explaining a step in the mechanism.",
  parse: shapeOf<OneOhOneCopy>({ title: "", subtitle: "", steps: [""] }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:#FAF8F3;display:flex;flex-direction:column;padding:${p}px 62px;">
        <div class="h" style="font-size:${fitHeadline(ctx.copy.title, {
          max: 72,
          min: 44,
          per: 26,
        })}px;font-weight:700;line-height:1.08;color:#1D3B2A;">${esc(ctx.copy.title)}</div>
        <div style="width:110px;height:5px;background:var(--accent);margin-top:26px;"></div>
        <div style="font-size:32px;color:#5C6B60;margin-top:30px;font-style:italic;">${esc(ctx.copy.subtitle)}</div>
        <div style="display:flex;flex-direction:column;gap:28px;margin-top:40px;">
          ${ctx.copy.steps
            .slice(0, 4)
            .map((s) => `<div style="font-size:33px;line-height:1.45;color:#243329;">${esc(s)}</div>`)
            .join("")}
        </div>
        <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:36px;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:86%;max-height:${
            ctx.canvas.height * 0.36
          }px;object-fit:contain;"/>
        </div>
      </div>`,
    );
  },
};

// ── Crossed-out problems ─────────────────────────────────────────────

interface CrossedCopy {
  problems: string[];
  payoff: string;
  payoffSub: string;
}

const crossedOutProblems: FormatDef<CrossedCopy> = {
  id: "crossed-out-problems",
  name: "Crossed-Out Problems",
  category: "list",
  summary: "A list of struggles with a line struck through each, then the payoff.",
  useWhen: "You solve a cluster of related complaints. The strikethrough does the work of a whole paragraph.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    problems: ["Legs cramping up", "Hit the wall on long runs", "Had to walk home", "Felt slower than usual"],
    payoff: "New Year. Better You.",
    payoffSub: "Puresport Endurance",
  },
  guidance:
    "Each problem is written in the past tense, as something that used to happen — 3-6 words, no punctuation. " +
    "The payoff is two or three words. Restraint is the whole aesthetic here.",
  parse: shapeOf<CrossedCopy>({ problems: [""], payoff: "", payoffSub: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:#F4F2EF;display:flex;flex-direction:column;align-items:center;padding:${p}px 62px;text-align:center;">
        <div style="font-size:26px;letter-spacing:0.16em;text-transform:uppercase;color:var(--muted);">${esc(
          ctx.copy.payoffSub,
        )}</div>
        <div style="display:flex;flex-direction:column;gap:20px;margin-top:${p * 0.6}px;">
          ${ctx.copy.problems
            .slice(0, 6)
            .map(
              (pr) =>
                `<div style="font-size:38px;color:#8A9089;text-decoration:line-through;text-decoration-thickness:3px;">${esc(
                  pr,
                )}</div>`,
            )
            .join("")}
        </div>
        <div class="h" style="font-size:${fitHeadline(ctx.copy.payoff, {
          max: 76,
          min: 48,
          per: 22,
        })}px;font-weight:700;margin-top:${p * 0.6}px;line-height:1.14;">${esc(ctx.copy.payoff)}</div>
        <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:30px;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:72%;max-height:${
            ctx.canvas.height * 0.3
          }px;object-fit:contain;"/>
        </div>
      </div>`,
    );
  },
};

// ── Transformation timeline ──────────────────────────────────────────

interface TimelineCopy {
  milestones: string[];
  descriptions: string[];
}

const transformationTimeline: FormatDef<TimelineCopy> = {
  id: "transformation-timeline",
  name: "Transformation Timeline",
  category: "list",
  summary: "What changes at day 7, day 14, day 30 — staged down the canvas.",
  useWhen: "Results are real but gradual. Sets an honest expectation and pre-empts the week-one refund.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    milestones: ["After 7 days", "After 14 days", "After 30 days"],
    descriptions: [
      "The belly stops feeling like a bowling ball after every meal. You stop unbuttoning your jeans after lunch.",
      "The bloating settles. The morning mucus clears. You stop waking up at 3am to pee.",
      "You stop crashing at 3pm. Your clothes fit the way they used to and you feel like yourself again.",
    ],
  },
  guidance:
    "Three milestones on a realistic timeline. Each description is one concrete, physical, everyday observation — " +
    "never a number, never a percentage. Under 140 characters each.",
  parse: shapeOf<TimelineCopy>({ milestones: [""], descriptions: [""] }),
  build(ctx) {
    const p = pad(ctx);
    const count = Math.min(ctx.copy.milestones.length, 3);
    const stages = ctx.copy.milestones.slice(0, 3).map((m, i) => {
      // A filling bar, not decorative dots — the point is that progress
      // accumulates, and a row of circles reads as a rating instead.
      const pct = Math.round(((i + 1) / count) * 100);
      return `<div style="display:flex;flex-direction:column;gap:16px;padding:${i === 0 ? "0" : "34px"} 0 0;">
        <div style="display:flex;align-items:baseline;justify-content:space-between;">
          <div style="font-size:34px;font-weight:700;">${esc(m)}</div>
          <div class="tnum" style="font-size:24px;color:var(--muted);">${pct}%</div>
        </div>
        <div style="height:10px;border-radius:999px;background:var(--hairline);overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:var(--accent);border-radius:999px;"></div>
        </div>
        <div style="font-size:29px;line-height:1.45;color:var(--muted);">${esc(
          ctx.copy.descriptions[i] ?? "",
        )}</div>
      </div>`;
    });
    return shell(
      ctx,
      `<div style="flex:1;background:var(--bg);display:flex;flex-direction:column;padding:${p}px 62px;">
        ${stages.join(`<div style="height:1px;background:var(--hairline);margin-top:34px;"></div>`)}
        <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:34px;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:64%;max-height:${
            ctx.canvas.height * 0.22
          }px;object-fit:contain;"/>
        </div>
      </div>`,
    );
  },
};

// ── Diagram / flowchart ──────────────────────────────────────────────

interface FlowCopy {
  beforeLabel: string;
  before: string[];
  afterLabel: string;
  after: string;
}

const diagramFlowchart: FormatDef<FlowCopy> = {
  id: "diagram-flowchart",
  name: "Diagram / Flowchart",
  category: "list",
  summary: "A stack of scattered tools collapsing into one box: yours.",
  useWhen: "You replace a mess of things. The picture makes the consolidation argument instantly.",
  sizes: ["1:1", "4:5"],
  example: {
    beforeLabel: "You have",
    before: ["Projects", "Chat", "Email", "Recordings", "Documents", "Whiteboards", "Time tracking"],
    afterLabel: "It's time you had a single source for everything",
    after: "Northwind",
  },
  guidance:
    "The 'before' list is 5-7 single-word tool or task names — the sprawl is the point. " +
    "The 'after' is your product name alone. The after label is one sentence about consolidation.",
  parse: shapeOf<FlowCopy>({ beforeLabel: "", before: [""], afterLabel: "", after: "" }),
  build(ctx) {
    const p = pad(ctx);
    const nodes = ctx.copy.before
      .slice(0, 7)
      .map(
        (b) => `<div style="background:#1C2029;border:1px solid #2E3440;border-radius:10px;padding:16px 24px;
          font-size:26px;color:#C9CFDA;">${esc(b)}</div>`,
      )
      .join("");
    return shell(
      ctx,
      `<div style="flex:1;background:linear-gradient(160deg,#0B0E14 0%,#161B26 100%);display:flex;align-items:center;gap:36px;padding:${p}px 54px;">
        <div style="flex:1;display:flex;flex-direction:column;gap:14px;">
          <div style="font-size:28px;color:#7C8798;margin-bottom:10px;">${esc(ctx.copy.beforeLabel)}</div>
          ${nodes}
        </div>
        <svg width="70" height="40" viewBox="0 0 24 14" fill="none" stroke="#4A5567" stroke-width="1.6"><path d="M0 7h20M15 2l5 5-5 5"/></svg>
        <div style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:28px;">
          <div style="font-size:32px;line-height:1.35;color:#E7EAF0;">${esc(ctx.copy.afterLabel)}</div>
          <div style="background:var(--accent);color:var(--on-accent);border-radius:14px;padding:26px 40px;
            font-size:36px;font-weight:800;">${esc(ctx.copy.after)}</div>
        </div>
      </div>`,
    );
  },
};

export const LIST_FORMATS: AnyFormat[] = [
  xReasonsWhy,
  xSigns,
  tierList,
  the101,
  crossedOutProblems,
  transformationTimeline,
  diagramFlowchart,
];
