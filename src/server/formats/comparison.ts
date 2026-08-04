/**
 * Comparison formats — the creative puts two things side by side and lets the
 * viewer draw the conclusion.
 *
 * Six of these are structurally a split panel, so they share one `splitPanel`
 * primitive and differ in framing (rival / past self / myth / problem) and
 * treatment. The two that aren't — the Venn and the before/after — get bespoke
 * layouts because their geometry IS the argument.
 *
 * Legal note worth respecting: `comparison-to-winner` names a category leader.
 * Keep the claim to a verifiable attribute, never a slur.
 */

import { check, cross, esc, fitHeadline, kicker, pad, shell, tint } from "./kit";
import { shapeOf, type AnyFormat, type FormatCtx, type FormatDef } from "./types";

// ── Shared split-panel primitive ─────────────────────────────────────

interface PanelSide {
  label: string;
  items: string[];
  /** Background fill for the column. */
  bg: string;
  /** Text color inside the column. */
  fg: string;
  /** Marker drawn beside each row. */
  mark: "check" | "cross" | "dash" | "none";
  markColor: string;
}

function panelColumn(side: PanelSide, ctx: FormatCtx<unknown>): string {
  const marker =
    side.mark === "check"
      ? check(side.markColor, 30, 3.4)
      : side.mark === "cross"
        ? cross(side.markColor, 30, 3.4)
        : side.mark === "dash"
          ? `<span style="color:${side.markColor};font-size:30px;font-weight:800;line-height:1;">—</span>`
          : "";
  return `<div style="flex:1;background:${side.bg};color:${side.fg};display:flex;flex-direction:column;padding:${
    pad(ctx) * 0.72
  }px 44px;">
    <div style="font-size:30px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;opacity:0.72;">${esc(
      side.label,
    )}</div>
    <div style="display:flex;flex-direction:column;gap:28px;margin-top:36px;">
      ${side.items
        .slice(0, 6)
        .map(
          (i) => `<div style="display:flex;gap:18px;align-items:flex-start;">
            ${marker ? `<div style="flex-shrink:0;margin-top:4px;">${marker}</div>` : ""}
            <div style="font-size:31px;line-height:1.38;">${esc(i)}</div>
          </div>`,
        )
        .join("")}
    </div>
  </div>`;
}

/** Two columns under a shared headline. The workhorse of this file. */
function splitPanel(
  ctx: FormatCtx<unknown>,
  opts: { headline: string; kicker?: string; left: PanelSide; right: PanelSide; footer?: string },
): string {
  const p = pad(ctx);
  return shell(
    ctx,
    `<div style="flex:1;display:flex;flex-direction:column;background:var(--bg);">
      <div style="padding:${p * 0.85}px 54px ${p * 0.5}px;text-align:center;">
        ${opts.kicker ? kicker(opts.kicker) : ""}
        <div class="h" style="font-size:${fitHeadline(opts.headline, {
          max: 72,
          min: 42,
          per: 32,
        })}px;font-weight:800;line-height:1.1;margin-top:${opts.kicker ? "20px" : "0"};">${esc(opts.headline)}</div>
      </div>
      <div style="flex:1;display:flex;">
        ${panelColumn(opts.left, ctx)}
        ${panelColumn(opts.right, ctx)}
      </div>
      ${
        opts.footer
          ? `<div style="padding:34px 54px;text-align:center;font-size:30px;color:var(--muted);border-top:1px solid var(--hairline);">${esc(
              opts.footer,
            )}</div>`
          : ""
      }
    </div>`,
  );
}

// ── Us vs Them ───────────────────────────────────────────────────────

interface VsCopy {
  headline: string;
  usLabel: string;
  themLabel: string;
  us: string[];
  them: string[];
}

const usVsThem: FormatDef<VsCopy> = {
  id: "us-vs-them",
  name: "Us vs Them",
  category: "comparison",
  summary: "Your product against the category default, attribute by attribute.",
  useWhen: "Buyers are choosing between you and an obvious alternative. The single highest-intent format there is.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    headline: "Same job. Very different ingredients.",
    usLabel: "Northwind",
    themLabel: "Traditional cleaners",
    us: ["Clean ingredients", "Plastic-free tablets", "Fresh scents", "Refill forever"],
    them: ["Chlorine bleach", "Single-use plastic", "Chemical smell", "Buy a new bottle"],
  },
  guidance:
    "Pair each row: the same attribute stated as a positive on your side and a factual negative on theirs. " +
    "Four rows. Never name a competitor brand — describe the category ('traditional cleaners'). Under 30 characters per row.",
  parse: shapeOf<VsCopy>({ headline: "", usLabel: "", themLabel: "", us: [""], them: [""] }),
  build(ctx) {
    return splitPanel(ctx, {
      headline: ctx.copy.headline,
      left: {
        label: ctx.copy.themLabel,
        items: ctx.copy.them,
        bg: "var(--surface)",
        fg: "var(--muted)",
        mark: "cross",
        markColor: "#B0B6BF",
      },
      right: {
        label: ctx.copy.usLabel,
        items: ctx.copy.us,
        bg: "var(--accent)",
        fg: "var(--on-accent)",
        mark: "check",
        markColor: "var(--on-accent)",
      },
    });
  },
};

// ── Us vs Us ─────────────────────────────────────────────────────────

const usVsUs: FormatDef<VsCopy> = {
  id: "us-vs-us",
  name: "Us vs Us",
  category: "comparison",
  summary: "Your two products or tiers, so the buyer picks a lane instead of bouncing.",
  useWhen: "You have a range and the wrong pick causes refunds. Converts browsers who are stuck deciding.",
  sizes: ["1:1", "4:5"],
  example: {
    headline: "Which one is for you?",
    usLabel: "Thirsty? Hydrate",
    themLabel: "Thirsty? Focus",
    us: ["Electrolytes only", "Zero caffeine", "Any time of day", "Post-workout"],
    them: ["Electrolytes + L-theanine", "80mg caffeine", "Mornings", "Deep work"],
  },
  guidance:
    "Both columns are yours, so both are positive — the contrast is use case, not quality. " +
    "Four parallel rows. The headline asks which, never which is better.",
  parse: shapeOf<VsCopy>({ headline: "", usLabel: "", themLabel: "", us: [""], them: [""] }),
  build(ctx) {
    const a = ctx.brand.colors.accent;
    return splitPanel(ctx, {
      headline: ctx.copy.headline,
      left: {
        label: ctx.copy.themLabel,
        items: ctx.copy.them,
        bg: tint(a, 0.86),
        fg: "var(--ink)",
        mark: "check",
        markColor: a,
      },
      right: {
        label: ctx.copy.usLabel,
        items: ctx.copy.us,
        bg: tint(a, 0.6),
        fg: "var(--ink)",
        mark: "check",
        markColor: "var(--ink)",
      },
    });
  },
};

// ── New vs old ───────────────────────────────────────────────────────

const newVsOld: FormatDef<VsCopy> = {
  id: "new-vs-old",
  name: "New vs Old",
  category: "comparison",
  summary: "What the customer uses today against what they'd switch to.",
  useWhen: "You're a replacement, not a new habit. Frames the purchase as an upgrade rather than an addition.",
  sizes: ["1:1", "4:5"],
  example: {
    headline: "New protein vs the one I was using",
    usLabel: "What I use now",
    themLabel: "What I used before",
    us: ["Grass-fed isolate", "Six ingredients", "No artificial sweetener", "Batch tested"],
    them: ["Hydrolysed blend", "Twenty-one ingredients", "Sucralose", "No published tests"],
  },
  guidance:
    "Write it in the first person — this is one person's switch, not a brand's claim. " +
    "The old column is factual, never mocking. Four rows, one attribute each.",
  parse: shapeOf<VsCopy>({ headline: "", usLabel: "", themLabel: "", us: [""], them: [""] }),
  build(ctx) {
    return splitPanel(ctx, {
      headline: ctx.copy.headline,
      kicker: "The switch",
      left: {
        label: ctx.copy.themLabel,
        items: ctx.copy.them,
        bg: "#EFEFF2",
        fg: "#6B7280",
        mark: "dash",
        markColor: "#B0B6BF",
      },
      right: {
        label: ctx.copy.usLabel,
        items: ctx.copy.us,
        bg: "var(--surface)",
        fg: "var(--ink)",
        mark: "check",
        markColor: "var(--accent)",
      },
    });
  },
};

// ── Problem vs solution ──────────────────────────────────────────────

interface ProblemCopy {
  headline: string;
  problems: string[];
  solutions: string[];
}

const problemVsSolution: FormatDef<ProblemCopy> = {
  id: "problem-vs-solution",
  name: "Problem vs Solution",
  category: "comparison",
  summary: "The daily friction on the left, what changes on the right.",
  useWhen: "The problem is felt but never named. Naming it precisely is most of the persuasion.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    headline: "The problem / The solution",
    problems: ["Can't get past 3pm", "Stubborn belly fat", "Cravings by 4pm", "No energy to train"],
    solutions: ["Steady all-day energy", "Appetite under control", "Cravings gone", "Back in the gym"],
  },
  guidance:
    "Problems are written in the customer's own words — short, unglamorous, slightly defeated. " +
    "Each solution is the direct mirror of the problem on the same row. Four rows, under 28 characters each.",
  parse: shapeOf<ProblemCopy>({ headline: "", problems: [""], solutions: [""] }),
  build(ctx) {
    return splitPanel(ctx, {
      headline: ctx.copy.headline,
      left: {
        label: "The problem",
        items: ctx.copy.problems,
        bg: "#221E2B",
        fg: "#E7E3EE",
        mark: "cross",
        markColor: "#F0776B",
      },
      right: {
        label: "The solution",
        items: ctx.copy.solutions,
        bg: "var(--accent)",
        fg: "var(--on-accent)",
        mark: "check",
        markColor: "var(--on-accent)",
      },
    });
  },
};

// ── Myth vs fact ─────────────────────────────────────────────────────

interface MythCopy {
  myth: string;
  fact: string;
  footer: string;
}

const mythVsFact: FormatDef<MythCopy> = {
  id: "myth-vs-fact",
  name: "Myth vs Fact",
  category: "comparison",
  summary: "One widely believed wrong thing, corrected.",
  useWhen: "A false belief is the actual blocker to purchase. Correct it and the objection dissolves.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    myth: "If you can't fall asleep, lie there with your eyes closed and keep trying.",
    fact: "Lying in bed awake makes your mind more alert and frustrated. A gentle reset helps you unwind naturally.",
    footer: "Try Northwind free to ease into sleep.",
  },
  guidance:
    "The myth must be something a reasonable person actually believes — not a straw man. " +
    "The fact corrects it with a mechanism, not an assertion. Two sentences maximum each.",
  parse: shapeOf<MythCopy>({ myth: "", fact: "", footer: "" }),
  build(ctx) {
    const p = pad(ctx);
    const card = (tag: string, text: string, bg: string, fg: string, dot: string) =>
      `<div style="flex:1;background:${bg};color:${fg};border-radius:28px;padding:44px 40px;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:26px;height:26px;border-radius:50%;background:${dot};"></div>
          <div style="font-size:30px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">${esc(tag)}</div>
        </div>
        <div style="font-size:34px;line-height:1.42;margin-top:26px;">${esc(text)}</div>
      </div>`;
    return shell(
      ctx,
      `<div style="flex:1;background:var(--surface);display:flex;flex-direction:column;padding:${p}px 56px;gap:28px;">
        ${card("Myth", ctx.copy.myth, "#8E7CC3", "#FFFFFF", "#FFFFFF")}
        ${card("Fact", ctx.copy.fact, "#1F6FEB", "#FFFFFF", "#7BE3A0")}
        <div style="text-align:center;font-size:32px;color:var(--muted);padding-top:8px;">${esc(ctx.copy.footer)}</div>
      </div>`,
    );
  },
};

// ── Venn diagram ─────────────────────────────────────────────────────

interface VennCopy {
  headline: string;
  left: string;
  right: string;
  overlap: string;
  subline: string;
}

const vennDiagram: FormatDef<VennCopy> = {
  id: "venn-diagram",
  name: "Venn Diagram",
  category: "comparison",
  summary: "Two circles whose overlap is the product.",
  useWhen: "Your product sits at the intersection of two things people already want but think are mutually exclusive.",
  sizes: ["1:1", "4:5"],
  example: {
    headline: "Fertility is 50/50.",
    left: "Egg support",
    right: "Sperm support",
    overlap: "Both",
    subline: "Now your supplements are, too.",
  },
  guidance:
    "Each circle is 1-3 words naming one half of a pair everyone treats as separate. " +
    "The overlap label is the product's category. The headline states the thesis in under 6 words.",
  parse: shapeOf<VennCopy>({ headline: "", left: "", right: "", overlap: "", subline: "" }),
  build(ctx) {
    const p = pad(ctx);
    const a = ctx.brand.colors.accent;
    const circle = (label: string, offset: string) =>
      `<div style="position:absolute;${offset}width:400px;height:400px;border-radius:50%;background:${a};opacity:0.5;
        display:flex;align-items:center;justify-content:center;"></div>
       <div style="position:absolute;${offset}width:400px;height:400px;display:flex;align-items:center;justify-content:center;">
         <span style="font-size:34px;font-weight:700;color:var(--ink);transform:translateX(${
           offset.startsWith("left") ? "-70px" : "70px"
         });">${esc(label)}</span>
       </div>`;
    return shell(
      ctx,
      `<div style="flex:1;background:var(--bg);display:flex;flex-direction:column;align-items:center;padding:${p}px 60px;text-align:center;">
        <div class="h" style="font-size:${fitHeadline(ctx.copy.headline, {
          max: 78,
          min: 48,
          per: 26,
        })}px;font-weight:800;line-height:1.1;">${esc(ctx.copy.headline)}</div>
        <div style="font-size:36px;color:var(--muted);margin-top:24px;">${esc(ctx.copy.subline)}</div>
        <div style="position:relative;width:700px;height:420px;margin-top:${p * 0.6}px;">
          ${circle(ctx.copy.left, "left:0;top:10px;")}
          ${circle(ctx.copy.right, "right:0;top:10px;")}
          <div style="position:absolute;left:50%;top:210px;transform:translate(-50%,-50%);font-size:30px;font-weight:800;color:var(--on-accent);z-index:2;">${esc(
            ctx.copy.overlap,
          )}</div>
        </div>
        <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:70%;max-height:${
            ctx.canvas.height * 0.26
          }px;object-fit:contain;"/>
        </div>
      </div>`,
    );
  },
};

// ── Comparison to a category winner ──────────────────────────────────

interface WinnerCopy {
  headline: string;
  lines: string[];
}

const comparisonToWinner: FormatDef<WinnerCopy> = {
  id: "comparison-to-winner",
  name: "Comparison to Winner",
  category: "comparison",
  summary: "“Like [famous thing], but for [your category].”",
  useWhen: "Your category is unfamiliar and needs one borrowed reference to click. Explains the product in four words.",
  sizes: ["1:1", "4:5"],
  example: {
    headline: "Like Duolingo, but for History",
    lines: ["Stop scrolling.", "Download Nibble.", "Learn History for 5 minutes a day.", "Become the most interesting person in the room."],
  },
  guidance:
    "Name a product everyone knows and is neutral-to-positive about, then pivot to your category. " +
    "Never name a direct competitor — pick an analogue from a different market. Four short imperative lines.",
  parse: shapeOf<WinnerCopy>({ headline: "", lines: [""] }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:#12161C;display:flex;flex-direction:column;padding:${p}px 66px;">
        <div style="border:3px solid #C8A96A;border-radius:8px;padding:56px 48px;flex:1;display:flex;flex-direction:column;">
          <div class="h" style="font-size:${fitHeadline(ctx.copy.headline, {
            max: 74,
            min: 44,
            per: 28,
          })}px;font-weight:700;color:#F3EEE3;line-height:1.14;">${esc(ctx.copy.headline)}</div>
          <div style="display:flex;flex-direction:column;gap:18px;margin-top:44px;">
            ${ctx.copy.lines
              .slice(0, 5)
              .map((l) => `<div style="font-size:33px;line-height:1.4;color:#CFC7B8;">${esc(l)}</div>`)
              .join("")}
          </div>
          <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:34px;">
            <img src="${ctx.photoDataUri}" alt="" style="max-width:90%;max-height:${
              ctx.canvas.height * 0.32
            }px;object-fit:contain;border-radius:6px;"/>
          </div>
        </div>
      </div>`,
    );
  },
};

// ── Before / after ───────────────────────────────────────────────────

interface BeforeAfterCopy {
  beforeLabel: string;
  afterLabel: string;
  caption: string;
  timeframe: string;
}

const beforeAfter: FormatDef<BeforeAfterCopy> = {
  id: "before-after",
  name: "Before / After",
  category: "comparison",
  summary: "A split image with the two states labelled.",
  useWhen: "The result is visible. Nothing outperforms it when you have honest imagery — and nothing is riskier when you don't.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    beforeLabel: "BEFORE",
    afterLabel: "AFTER",
    caption: "Same person. Same lighting. 60 days apart.",
    timeframe: "60 days",
  },
  guidance:
    "Labels stay single words in caps. The caption pre-empts the 'this is faked' objection by naming what was held " +
    "constant. Never promise a timeframe the brief doesn't support.",
  parse: shapeOf<BeforeAfterCopy>({ beforeLabel: "", afterLabel: "", caption: "", timeframe: "" }),
  build(ctx) {
    const label = (text: string, bg: string) =>
      `<div style="position:absolute;bottom:26px;left:50%;transform:translateX(-50%);background:${bg};color:#FFFFFF;
        font-size:32px;font-weight:800;letter-spacing:0.1em;padding:14px 30px;border-radius:8px;">${esc(text)}</div>`;
    // Two genuinely different photos when the user uploaded them. With only
    // one, the "before" is visibly desaturated so the panel reads as a
    // placeholder rather than pretending to be a real result.
    const after = ctx.photos[1] ?? ctx.photoDataUri;
    const hasPair = ctx.photos.length > 1;
    return shell(
      ctx,
      `<div style="flex:1;display:flex;flex-direction:column;background:var(--bg);">
        <div style="flex:1;display:flex;">
          <div style="flex:1;position:relative;overflow:hidden;">
            <img src="${ctx.photoDataUri}" alt="" style="width:100%;height:100%;object-fit:cover;${
              hasPair ? "" : "filter:grayscale(0.55) brightness(0.9);"
            }"/>
            ${label(ctx.copy.beforeLabel, "#C0392B")}
          </div>
          <div style="width:6px;background:#FFFFFF;"></div>
          <div style="flex:1;position:relative;overflow:hidden;">
            <img src="${after}" alt="" style="width:100%;height:100%;object-fit:cover;"/>
            ${label(ctx.copy.afterLabel, "#1E8E4E")}
            <div style="position:absolute;top:26px;right:26px;background:rgba(0,0,0,0.6);color:#FFFFFF;font-size:26px;padding:10px 20px;border-radius:999px;">${esc(
              ctx.copy.timeframe,
            )}</div>
          </div>
        </div>
        <div style="padding:36px 54px;text-align:center;font-size:30px;color:var(--muted);border-top:1px solid var(--hairline);">${esc(
          ctx.copy.caption,
        )}</div>
      </div>`,
    );
  },
};

export const COMPARISON_FORMATS: AnyFormat[] = [
  usVsThem,
  usVsUs,
  newVsOld,
  problemVsSolution,
  mythVsFact,
  vennDiagram,
  comparisonToWinner,
  beforeAfter,
];
