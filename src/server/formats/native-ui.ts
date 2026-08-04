/**
 * Native-UI formats — creatives that borrow a familiar interface (Notes,
 * iMessage, Reddit, Trustpilot, search) so the ad reads as content the viewer
 * was already scrolling rather than as an ad.
 *
 * These lean on chrome accuracy: the status bar, the bubble tails, the vote
 * arrows. Get the chrome right and the copy can be plain; get it wrong and no
 * amount of copy saves it.
 */

import { esc, fitHeadline, iosStatusBar, pad, shell } from "./kit";
import { shapeOf, type AnyFormat, type FormatDef } from "./types";

// ── iPhone Notes ─────────────────────────────────────────────────────

interface NotesCopy {
  title: string;
  bullets: string[];
  signoff: string;
}

const iphoneNotes: FormatDef<NotesCopy> = {
  id: "iphone-notes",
  name: "iPhone Notes",
  category: "native-ui",
  summary: "A note screenshot: a blunt title and a short bulleted case, in the Notes app.",
  useWhen: "You want an unpolished, insider-feeling argument. Best for a founder's reasoning or a why-we-switched list.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    title: "Why we switched to X",
    bullets: [
      "50% off the first order and free shipping",
      "Third-party tested, every single batch",
      "Cancel any time — no minimum commitment",
      "Arrives in two days, not two weeks",
    ],
    signoff: "Try it once and compare.",
  },
  guidance:
    "Write it as a personal note to a friend — lowercase-ish, no marketing polish, no exclamation marks. " +
    "Title is a fragment, not a sentence. 4 bullets, each one concrete fact under 60 characters.",
  parse: shapeOf<NotesCopy>({ title: "", bullets: [""], signoff: "" }),
  build(ctx) {
    const p = pad(ctx);
    const bullets = ctx.copy.bullets
      .slice(0, 5)
      .map(
        (b) => `<div style="display:flex;gap:22px;align-items:flex-start;">
          <div style="flex-shrink:0;width:16px;height:16px;border-radius:50%;background:#E8B93B;margin-top:16px;"></div>
          <div style="font-size:36px;line-height:1.42;color:#F2F2F5;">${esc(b)}</div>
        </div>`,
      )
      .join("");
    return shell(
      ctx,
      `<div style="flex:1;background:#000000;display:flex;flex-direction:column;">
        ${iosStatusBar("#FFFFFF")}
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 40px 0;color:#E8B93B;font-size:32px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="22" height="36" viewBox="0 0 10 16" fill="none" stroke="#E8B93B" stroke-width="2"><path d="M8 1L2 8l6 7"/></svg>
            <span>Notes</span>
          </div>
          <span style="font-weight:600;">Done</span>
        </div>
        <div style="flex:1;padding:${p * 0.7}px 46px 0;display:flex;flex-direction:column;">
          <div style="font-size:26px;color:#8A8A8E;">Today</div>
          <div class="h" style="font-size:${fitHeadline(ctx.copy.title, {
            max: 62,
            min: 40,
            per: 30,
          })}px;font-weight:700;color:#FFFFFF;margin-top:22px;line-height:1.15;">${esc(ctx.copy.title)}</div>
          <div style="margin-top:44px;display:flex;flex-direction:column;gap:30px;">${bullets}</div>
          <div style="margin-top:46px;font-size:34px;color:#8A8A8E;font-style:italic;">${esc(ctx.copy.signoff)}</div>
        </div>
      </div>`,
    );
  },
};

// ── Text message ─────────────────────────────────────────────────────

interface TextCopy {
  them: string;
  you: string;
  themReply: string;
  youClose: string;
}

const textMessage: FormatDef<TextCopy> = {
  id: "text-message",
  name: "Text Message",
  category: "native-ui",
  summary: "An iMessage thread where a friend recommends the product.",
  useWhen: "The strongest social proof you have is word of mouth. Reads as a screenshot someone forwarded.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    them: "ok what is that thing you told me about",
    you: "the greens powder? been on it 3 weeks",
    themReply: "does it actually work or is it another tiktok thing",
    youClose: "bloating gone by week 2. link in a sec — 50% off first order",
  },
  guidance:
    "Write real texting: lowercase, no punctuation at line ends, contractions, one typo-free but casual voice. " +
    "The friend is skeptical first, convinced second. Never sound like a brand. Keep each message under 90 characters.",
  parse: shapeOf<TextCopy>({ them: "", you: "", themReply: "", youClose: "" }),
  build(ctx) {
    const bubble = (text: string, mine: boolean) =>
      `<div style="display:flex;justify-content:${mine ? "flex-end" : "flex-start"};">
        <div style="max-width:76%;background:${mine ? "#2C7CF6" : "#E9E9EB"};color:${
          mine ? "#FFFFFF" : "#111318"
        };border-radius:34px;padding:24px 32px;font-size:34px;line-height:1.35;">${esc(text)}</div>
      </div>`;
    return shell(
      ctx,
      `<div style="flex:1;background:#FFFFFF;display:flex;flex-direction:column;">
        ${iosStatusBar("#111318")}
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:10px 0 20px;border-bottom:1px solid #E5E5EA;">
          <div style="width:88px;height:88px;border-radius:50%;background:#C7C7CC;display:flex;align-items:center;justify-content:center;font-size:38px;color:#FFFFFF;font-weight:600;">${esc(
            (ctx.brief.product || "A").slice(0, 1).toUpperCase(),
          )}</div>
          <div style="font-size:26px;color:#111318;">Sarah</div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:20px;padding:40px 34px 34px;">
          ${bubble(ctx.copy.them, false)}
          ${bubble(ctx.copy.you, true)}
          ${bubble(ctx.copy.themReply, false)}
          ${bubble(ctx.copy.youClose, true)}
          <div style="text-align:right;font-size:22px;color:#8A8A8E;padding-right:12px;">Delivered</div>
        </div>
        <div style="display:flex;align-items:center;gap:18px;padding:24px 34px 40px;border-top:1px solid #E5E5EA;">
          <div style="flex:1;height:70px;border:2px solid #E5E5EA;border-radius:35px;display:flex;align-items:center;padding:0 28px;font-size:30px;color:#B0B0B5;">iMessage</div>
        </div>
      </div>`,
    );
  },
};

// ── Email screenshot ─────────────────────────────────────────────────

interface EmailCopy {
  sender: string;
  subject: string;
  preheader: string;
  body: string[];
}

const emailScreenshot: FormatDef<EmailCopy> = {
  id: "email-screenshot",
  name: "Email Screenshot",
  category: "native-ui",
  summary: "An inbox screenshot: sender, subject line, and the opening of the email.",
  useWhen: "Announcing something — a restock, a price change, a policy update. Borrows the authority of a direct email.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    sender: "Priya at Northwind",
    subject: "heads up: your price is locked until Friday",
    preheader: "We're holding the launch price for existing customers only.",
    body: [
      "Hi — quick note before this goes out publicly.",
      "We're raising prices on Monday. Anyone who ordered before Friday keeps the current rate for a full year, no action needed.",
      "If you've been waiting, this is the moment.",
    ],
  },
  guidance:
    "Write a plain internal-sounding email, not a newsletter. Lowercase subject line. No emoji, no header image, " +
    "no 'Dear customer'. 3 short paragraphs maximum, each under 200 characters.",
  parse: shapeOf<EmailCopy>({ sender: "", subject: "", preheader: "", body: [""] }),
  build(ctx) {
    const p = pad(ctx);
    const initials = ctx.copy.sender.slice(0, 1).toUpperCase();
    return shell(
      ctx,
      `<div style="flex:1;background:#FFFFFF;display:flex;flex-direction:column;">
        ${iosStatusBar("#111318", "12:42")}
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 40px 26px;border-bottom:1px solid #E5E5EA;color:#2C7CF6;font-size:30px;">
          <svg width="24" height="40" viewBox="0 0 10 16" fill="none" stroke="#2C7CF6" stroke-width="2"><path d="M8 1L2 8l6 7"/></svg>
          <div style="display:flex;gap:34px;color:#2C7CF6;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2C7CF6" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2C7CF6" stroke-width="2"><path d="M9 17H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-3 4z"/></svg>
          </div>
        </div>
        <div style="padding:${p * 0.55}px 44px 0;flex:1;display:flex;flex-direction:column;">
          <div class="h" style="font-size:${fitHeadline(ctx.copy.subject, {
            max: 52,
            min: 34,
            per: 40,
          })}px;font-weight:700;line-height:1.2;">${esc(ctx.copy.subject)}</div>
          <div style="display:flex;align-items:center;gap:22px;margin-top:34px;padding-bottom:30px;border-bottom:1px solid #EFEFF2;">
            <div style="width:76px;height:76px;border-radius:50%;background:var(--accent);color:var(--on-accent);display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:700;">${esc(
              initials,
            )}</div>
            <div style="flex:1;">
              <div style="font-size:32px;font-weight:600;">${esc(ctx.copy.sender)}</div>
              <div style="font-size:26px;color:#8A8A8E;margin-top:6px;">to me</div>
            </div>
            <div style="font-size:26px;color:#8A8A8E;">now</div>
          </div>
          <div style="margin-top:36px;display:flex;flex-direction:column;gap:30px;">
            ${ctx.copy.body
              .slice(0, 4)
              .map((b) => `<div style="font-size:33px;line-height:1.5;color:#2A2D34;">${esc(b)}</div>`)
              .join("")}
          </div>
          <div style="margin-top:auto;padding-bottom:${p * 0.5}px;font-size:27px;color:#8A8A8E;">${esc(
            ctx.copy.preheader,
          )}</div>
        </div>
      </div>`,
    );
  },
};

// ── Reddit thread ────────────────────────────────────────────────────

interface RedditCopy {
  subreddit: string;
  question: string;
  reply: string;
  replyAuthor: string;
  upvotes: string;
}

const redditThread: FormatDef<RedditCopy> = {
  id: "reddit-thread",
  name: "Reddit Thread",
  category: "native-ui",
  summary: "A skeptical question and the top-voted answer that names your product.",
  useWhen: "Your category is full of hype and buyers are looking for an honest verdict. The most credible social proof there is.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    subreddit: "r/Supplements",
    question: "Anyone else sick of greens powders that taste like pond water? Is there one that's actually drinkable?",
    reply:
      "Went through six of them. Most are sweetened into oblivion to hide the taste. The one that finally stuck was Northwind — no stevia, mixes clear, and they publish the batch tests which basically nobody else does. Three months in and I'm not dreading it in the morning.",
    replyAuthor: "u/quietloops",
    upvotes: "1.2k",
  },
  guidance:
    "The question is a real complaint, phrased the way a frustrated buyer types it. The reply is a long, specific, " +
    "slightly grudging endorsement that mentions trying alternatives first. Never sound promotional. Mention the product once.",
  parse: shapeOf<RedditCopy>({ subreddit: "", question: "", reply: "", replyAuthor: "", upvotes: "" }),
  build(ctx) {
    const p = pad(ctx);
    const votes = (n: string) =>
      `<div style="display:flex;align-items:center;gap:14px;color:#818384;font-size:26px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF4500" stroke-width="2.4"><path d="M12 4l8 9h-5v7H9v-7H4z"/></svg>
        <span class="tnum" style="color:#D7DADC;font-weight:600;">${esc(n)}</span>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818384" stroke-width="2.4"><path d="M12 20l-8-9h5V4h6v7h5z"/></svg>
      </div>`;
    return shell(
      ctx,
      `<div style="flex:1;background:#1A1A1B;display:flex;flex-direction:column;padding:${p * 0.7}px 40px;">
        <div style="background:#1A1A1B;border:1px solid #343536;border-radius:20px;padding:36px 38px;">
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:44px;height:44px;border-radius:50%;background:#FF4500;"></div>
            <div style="font-size:26px;color:#D7DADC;font-weight:700;">${esc(ctx.copy.subreddit)}</div>
            <div style="font-size:26px;color:#818384;">· 9 hr. ago</div>
          </div>
          <div style="font-size:40px;line-height:1.3;color:#D7DADC;font-weight:600;margin-top:26px;">${esc(
            ctx.copy.question,
          )}</div>
          <div style="margin-top:28px;">${votes(ctx.copy.upvotes)}</div>
        </div>
        <div style="margin-top:26px;background:#1A1A1B;border:1px solid #343536;border-radius:20px;padding:36px 38px;flex:1;">
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="width:44px;height:44px;border-radius:50%;background:#4A9EFF;"></div>
            <div style="font-size:26px;color:#4FBCFF;font-weight:600;">${esc(ctx.copy.replyAuthor)}</div>
            <div style="font-size:26px;color:#818384;">· 7 hr. ago</div>
            <div style="margin-left:auto;font-size:22px;color:#818384;background:#272729;padding:6px 14px;border-radius:8px;">Top comment</div>
          </div>
          <div style="font-size:33px;line-height:1.55;color:#D7DADC;margin-top:26px;">${esc(ctx.copy.reply)}</div>
        </div>
      </div>`,
    );
  },
};

// ── X post ───────────────────────────────────────────────────────────

interface XPostCopy {
  handle: string;
  name: string;
  lines: string[];
}

const xPost: FormatDef<XPostCopy> = {
  id: "x-post",
  name: "X Post",
  category: "native-ui",
  summary: "A short, punchy post with line breaks — the format that reads as a take, not an ad.",
  useWhen: "You have one sharp insight about the problem. Works best when the copy could stand alone as a tweet.",
  sizes: ["1:1", "4:5"],
  example: {
    name: "Tom Reeder",
    handle: "@tomreeder",
    lines: [
      "Sleep apnea isn't just snoring.",
      "It's waking up tired.",
      "Heart palpitations.",
      "Brain fog that won't go away.",
      "And a 400% higher risk of stroke.",
      "VitaVix Neck Support fixed all of that, from night 1.",
    ],
  },
  guidance:
    "Each line is its own beat — a fragment, not a sentence. Open with a myth-busting statement, stack 3-4 symptoms " +
    "or costs, then land the product in the final line. No hashtags, no emoji.",
  parse: shapeOf<XPostCopy>({ handle: "", name: "", lines: [""] }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:#000000;display:flex;flex-direction:column;justify-content:center;padding:${p}px 56px;">
        <div style="display:flex;align-items:center;gap:22px;">
          <div style="width:88px;height:88px;border-radius:50%;background:#333639;"></div>
          <div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:34px;font-weight:700;color:#E7E9EA;">${esc(ctx.copy.name)}</span>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="#1D9BF0"><path d="M12 2l2.4 2.1 3.1-.5 1 3 2.8 1.5-1 3 1 3-2.8 1.5-1 3-3.1-.5L12 22l-2.4-2.1-3.1.5-1-3L2.7 16l1-3-1-3 2.8-1.5 1-3 3.1.5z"/><path d="M10.6 15.3l-2.9-2.9 1.3-1.3 1.6 1.6 4-4 1.3 1.3z" fill="#000"/></svg>
            </div>
            <div style="font-size:30px;color:#71767B;margin-top:4px;">${esc(ctx.copy.handle)}</div>
          </div>
        </div>
        <div style="margin-top:46px;display:flex;flex-direction:column;gap:22px;">
          ${ctx.copy.lines
            .slice(0, 8)
            .map((l) => `<div style="font-size:42px;line-height:1.35;color:#E7E9EA;">${esc(l)}</div>`)
            .join("")}
        </div>
        <div style="display:flex;gap:74px;margin-top:52px;color:#71767B;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#71767B" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 01-9 8.4L3 21l1.1-4A8.4 8.4 0 1121 11.5z"/></svg>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#71767B" stroke-width="1.8"><path d="M17 2l4 4-4 4M3 10V8a2 2 0 012-2h16M7 22l-4-4 4-4M21 14v2a2 2 0 01-2 2H3"/></svg>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#71767B" stroke-width="1.8"><path d="M12 21s-8-4.9-8-10.4A4.6 4.6 0 0112 8a4.6 4.6 0 018 2.6C20 16.1 12 21 12 21z"/></svg>
        </div>
      </div>`,
    );
  },
};

// ── Google search ────────────────────────────────────────────────────

interface SearchCopy {
  query: string;
  suggestions: string[];
  resultTitle: string;
  resultSnippet: string;
}

const googleSearch: FormatDef<SearchCopy> = {
  id: "google-search",
  name: "Search Results",
  category: "native-ui",
  summary: "The search someone actually types, with your product as the answer.",
  useWhen: "Your buyer is already searching for a fix. Mirrors their exact query back at them.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    query: "why do I wake up at 3am every night",
    suggestions: [
      "why do I wake up at 3am and can't fall back asleep",
      "why do I wake up at 3am anxious",
      "why do I wake up at 3am every night cortisol",
    ],
    resultTitle: "Waking at 3am is a cortisol problem, not a sleep problem",
    resultSnippet:
      "Night-time cortisol spikes wake most people between 2 and 4am. Northwind's magnesium blend is formulated to blunt that spike — 89% of users report sleeping through by week 2.",
  },
  guidance:
    "The query is typed in lowercase the way a worried person types at midnight — a full question, not keywords. " +
    "Suggestions are three plausible autocomplete variants of the same fear. The result headline reframes the problem.",
  parse: shapeOf<SearchCopy>({ query: "", suggestions: [""], resultTitle: "", resultSnippet: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:#FFFFFF;display:flex;flex-direction:column;padding:${p * 0.6}px 44px;">
        <div style="display:flex;align-items:center;gap:22px;border:2px solid #DFE1E5;border-radius:60px;padding:26px 34px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3"/></svg>
          <div style="font-size:34px;color:#202124;flex:1;">${esc(ctx.copy.query)}</div>
        </div>
        <div style="margin-top:22px;display:flex;flex-direction:column;">
          ${ctx.copy.suggestions
            .slice(0, 3)
            .map(
              (s) => `<div style="display:flex;align-items:center;gap:24px;padding:22px 34px;">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9AA0A6" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3"/></svg>
                <div style="font-size:30px;color:#5F6368;">${esc(s)}</div>
              </div>`,
            )
            .join("")}
        </div>
        <div style="height:1px;background:#E8EAED;margin:20px 0 34px;"></div>
        <div style="border-left:8px solid var(--accent);padding-left:32px;">
          <div style="font-size:25px;color:#5F6368;">${esc(ctx.brief.domain || "example.com")}</div>
          <div class="h" style="font-size:44px;line-height:1.25;color:#1A0DAB;font-weight:600;margin-top:12px;">${esc(
            ctx.copy.resultTitle,
          )}</div>
          <div style="font-size:31px;line-height:1.5;color:#4D5156;margin-top:20px;">${esc(ctx.copy.resultSnippet)}</div>
        </div>
        <div style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding-top:30px;">
          <img src="${ctx.photoDataUri}" alt="" style="max-width:78%;max-height:${
            ctx.canvas.height * 0.34
          }px;object-fit:contain;"/>
        </div>
      </div>`,
    );
  },
};

// ── Sticky note ──────────────────────────────────────────────────────

interface StickyCopy {
  notes: string[];
  headline: string;
}

const stickyNote: FormatDef<StickyCopy> = {
  id: "sticky-note",
  name: "Sticky Notes",
  category: "native-ui",
  summary: "Handwritten-feeling sticky notes annotating the product photo.",
  useWhen: "You want the ad to look like a real person marked up a real object. Cheap-looking on purpose.",
  sizes: ["1:1", "4:5"],
  example: {
    headline: "in over 100,000 homes",
    notes: ["the best under-sink water filter", "no plumber needed", "try me — risk free"],
  },
  guidance:
    "Each note is 3-6 words, lowercase, like something scribbled in a hurry. No punctuation. " +
    "The headline is equally casual. Never use a full sentence.",
  parse: shapeOf<StickyCopy>({ notes: [""], headline: "" }),
  build(ctx) {
    const colors = ["#FFE45C", "#FFD1DC", "#B9F3C6"];
    const rotations = [-6, 4, -3];
    const positions = [
      "left:5%;bottom:26%;",
      "right:6%;bottom:34%;",
      "left:24%;bottom:8%;",
    ];
    const notes = ctx.copy.notes
      .slice(0, 3)
      .map(
        (n, i) => `<div style="position:absolute;${positions[i]}width:290px;min-height:290px;background:${
          colors[i % 3]
        };transform:rotate(${rotations[i % 3]}deg);box-shadow:0 18px 40px rgba(0,0,0,0.22);
          display:flex;align-items:center;justify-content:center;padding:34px;text-align:center;
          font-size:34px;line-height:1.25;font-weight:600;color:#2A2D34;">${esc(n)}</div>`,
      )
      .join("");
    return shell(
      ctx,
      `<div style="flex:1;position:relative;background:#EFEAE2;display:flex;flex-direction:column;">
        <img src="${ctx.photoDataUri}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"/>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg, rgba(0,0,0,0.34) 0%, transparent 34%, rgba(0,0,0,0.18) 100%);"></div>
        <div style="position:relative;padding:${pad(ctx) * 0.7}px 54px 0;">
          <div class="h" style="font-size:${fitHeadline(ctx.copy.headline, {
            max: 76,
            min: 46,
            per: 26,
          })}px;font-weight:800;color:#FFFFFF;line-height:1.08;text-shadow:0 4px 24px rgba(0,0,0,0.4);">${esc(
            ctx.copy.headline,
          )}</div>
        </div>
        ${notes}
      </div>`,
    );
  },
};

// ── Instagram story ──────────────────────────────────────────────────

interface StoryCopy {
  hook: string;
  subline: string;
  swipe: string;
}

const igStory: FormatDef<StoryCopy> = {
  id: "ig-story",
  name: "Instagram Story",
  category: "native-ui",
  summary: "A full-bleed story frame with a big hook and a tap-through prompt.",
  useWhen: "Story and Reels placements. The only format designed 9:16 first.",
  sizes: ["9:16", "4:5"],
  example: {
    hook: "WANTED:",
    subline:
      "300 cat parents who want to trial 12 tins of Untamed for just £7. One of the UK's meatiest cat foods, packed with human grade ingredients your cat needs.",
    swipe: "Tap below to get yours",
  },
  guidance:
    "The hook is 1-3 words in caps — a call-out, not a headline. The subline is one paragraph that explains the " +
    "offer plainly. Written to be read in under three seconds while a thumb hovers.",
  parse: shapeOf<StoryCopy>({ hook: "", subline: "", swipe: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:linear-gradient(160deg, #7B2FF7 0%, #E5484D 52%, #FF9A3C 100%);
        display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:${p}px 78px;">
        <div class="h" style="font-size:96px;font-weight:800;color:#FFFFFF;letter-spacing:0.02em;">${esc(
          ctx.copy.hook,
        )}</div>
        <div style="font-size:40px;line-height:1.45;color:#FFFFFF;margin-top:46px;max-width:840px;opacity:0.96;">${esc(
          ctx.copy.subline,
        )}</div>
        <img src="${ctx.photoDataUri}" alt="" style="max-width:74%;max-height:${
          ctx.canvas.height * 0.3
        }px;object-fit:contain;margin-top:56px;filter:drop-shadow(0 30px 60px rgba(0,0,0,0.3));"/>
        <div style="margin-top:auto;padding-top:60px;font-size:34px;color:#FFFFFF;opacity:0.94;display:flex;align-items:center;gap:14px;">
          ${esc(ctx.copy.swipe)}
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.6"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </div>`,
    );
  },
};

// ── Instagram question sticker ───────────────────────────────────────

interface QuestionCopy {
  question: string;
  answerChip: string;
  payoff: string;
}

const igQuestion: FormatDef<QuestionCopy> = {
  id: "ig-question",
  name: "Question Sticker",
  category: "native-ui",
  summary: "An Instagram question sticker with the answer tagged underneath.",
  useWhen: "Turning a common customer question into the hook. Invites the viewer to self-identify.",
  sizes: ["1:1", "4:5", "9:16"],
  example: {
    question: "I'm seeing fine lines after 30?",
    answerChip: "Collagen Levels Red Flag",
    payoff: "One scoop. 12g of marine collagen. Zero taste.",
  },
  guidance:
    "The question is written as the customer would ask it, ending in a question mark, under 45 characters. " +
    "The chip is a 2-4 word diagnosis. The payoff is one line of mechanism.",
  parse: shapeOf<QuestionCopy>({ question: "", answerChip: "", payoff: "" }),
  build(ctx) {
    const p = pad(ctx);
    return shell(
      ctx,
      `<div style="flex:1;background:#FF4E64;display:flex;flex-direction:column;align-items:center;padding:${
        p * 0.9
      }px 70px;position:relative;">
        <div style="position:absolute;left:0;top:0;bottom:0;width:56px;background:linear-gradient(180deg,#7B2FF7,#FF9A3C);"></div>
        <div style="position:absolute;right:0;top:0;bottom:0;width:56px;background:linear-gradient(180deg,#7B2FF7,#FF9A3C);"></div>
        <div style="position:relative;width:100%;max-width:760px;background:#FFC2CC;border-radius:34px;padding:52px 44px 40px;text-align:center;">
          <div style="position:absolute;top:-34px;left:50%;transform:translateX(-50%);width:78px;height:78px;border-radius:50%;background:#FFFFFF;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:700;color:#FF4E64;">?</div>
          <div class="h" style="font-size:${fitHeadline(ctx.copy.question, {
            max: 52,
            min: 36,
            per: 34,
          })}px;font-weight:600;color:#3A2E31;line-height:1.28;">${esc(ctx.copy.question)}</div>
          <div style="display:inline-flex;align-items:center;gap:14px;margin-top:30px;background:#FFFFFF;border-radius:999px;padding:18px 34px;font-size:30px;font-weight:600;color:#FF4E64;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF4E64" stroke-width="2.6"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>
            ${esc(ctx.copy.answerChip)}
          </div>
        </div>
        <img src="${ctx.photoDataUri}" alt="" style="max-width:80%;max-height:${
          ctx.canvas.height * 0.36
        }px;object-fit:contain;margin-top:56px;filter:drop-shadow(0 26px 50px rgba(0,0,0,0.26));"/>
        <div style="margin-top:auto;padding-top:44px;font-size:34px;color:#FFFFFF;font-weight:600;text-align:center;">${esc(
          ctx.copy.payoff,
        )}</div>
      </div>`,
    );
  },
};
export const NATIVE_UI_FORMATS: AnyFormat[] = [
  iphoneNotes,
  textMessage,
  emailScreenshot,
  redditThread,
  xPost,
  googleSearch,
  stickyNote,
  igStory,
  igQuestion,
];
