/**
 * Copy generation.
 *
 * One function, called once per creative. Each format declares the exact copy
 * object it renders, so the model is asked for that object and nothing else —
 * no free-form "write me an ad" step whose output then has to be parsed into
 * slots. The format's own `example` is the schema shown to the model, which
 * means a shape can never drift from what the template actually reads.
 *
 * Claim discipline lives here, not in the templates: the system prompt forbids
 * inventing statistics, prices, timeframes or scarcity, because the brief is
 * the only source of substantiated fact the app has.
 */

import type { Brief, FormatDef } from "./formats";

export interface AiEnv {
  OPENROUTER_API_KEY: string;
  AD_COPY_MODEL?: string;
}

const DEFAULT_MODEL = "anthropic/claude-sonnet-4";

const SYSTEM = `You are a senior direct-response copywriter who writes Meta ad creative.

Rules that override everything else:
- NEVER invent a statistic, price, discount, customer count, timeframe, certification or scarcity claim. If it is not in the brief, it does not exist. Write around a missing fact rather than inventing one.
- NEVER name a real competitor brand. Describe the category instead.
- NEVER make a medical, financial or income claim, or promise a specific result. Meta rejects these and they are the fastest way to lose an ad account.
- Write in the voice of the audience in the brief, not in the voice of a brand.
- No emoji unless the format's guidance explicitly asks for them. No exclamation marks unless the format is an apology or an announcement.
- Specific beats enthusiastic. A concrete mundane detail outperforms a superlative every time.

You reply with a single JSON object and nothing else. No markdown fence, no commentary.`;

function briefBlock(brief: Brief): string {
  const list = (label: string, items: string[]) =>
    items.length ? `${label}:\n${items.map((i) => `  - ${i}`).join("\n")}` : `${label}: (none given)`;
  return [
    `Product: ${brief.product || "(unnamed)"}`,
    `Category: ${brief.category || "(unspecified)"}`,
    `Audience: ${brief.audience || "(unspecified)"}`,
    `Core promise: ${brief.promise || "(unspecified)"}`,
    list("Substantiated proof (the ONLY facts you may state as fact)", brief.proof),
    list("Known objections", brief.objections),
    `Offer (the ONLY commercial terms you may state): ${brief.offer || "(no offer — do not invent one)"}`,
    `Call to action: ${brief.cta || "Shop now"}`,
    `Domain: ${brief.domain || "(none)"}`,
  ].join("\n");
}

/**
 * A type skeleton derived from the format's example: same keys, same array
 * lengths, but placeholders instead of words.
 *
 * Showing the filled example as "the shape" invites the model to hand it
 * straight back whenever the example's category happens to match the brief —
 * observed live with the Reddit format on a greens-powder brief, where every
 * field came back byte-identical. The skeleton carries the structure; the
 * example is shown separately and explicitly fenced off.
 */
function skeleton(example: Record<string, unknown>): string {
  const shape: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(example)) {
    if (Array.isArray(value)) {
      shape[key] = value.map((_, i) => `<string ${i + 1}>`);
    } else if (typeof value === "number") {
      shape[key] = 0;
    } else {
      shape[key] = "<string>";
    }
  }
  return JSON.stringify(shape, null, 2);
}

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    // Models occasionally prepend a sentence. Fall back to the outermost braces.
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("model did not return JSON");
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

async function callModel(env: AiEnv, messages: Array<{ role: string; content: string }>): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.AD_COPY_MODEL || DEFAULT_MODEL,
      messages,
      temperature: 0.9, // variants should differ; this is the whole product
      max_tokens: 1400,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`copy model ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("copy model returned an empty response");
  return content;
}

/**
 * Generate the copy object for one format. `angle` is an optional slant so the
 * same format can be run several times and produce genuinely different ads
 * ("lead with the price", "lead with the founder story").
 */
export async function generateCopy<C>(
  format: FormatDef<C>,
  brief: Brief,
  env: AiEnv,
  angle?: string,
): Promise<C> {
  const prompt = [
    `Write the copy for one Meta ad in the "${format.name}" format.`,
    ``,
    `FORMAT: ${format.summary}`,
    `WHEN IT WORKS: ${format.useWhen}`,
    `FORMAT RULES: ${format.guidance}`,
    ``,
    `BRIEF`,
    briefBlock(brief),
    ...(angle ? ["", `ANGLE FOR THIS VARIANT: ${angle}`] : []),
    ``,
    `Return JSON with exactly these keys and types (arrays keep roughly the same number of items):`,
    skeleton(format.example as Record<string, unknown>),
    ``,
    `Below is a sample of this format written for a DIFFERENT, UNRELATED product. It is here only so you can see`,
    `the register and rhythm the layout expects. Do NOT reuse its wording, its brand name, its numbers or its`,
    `claims — every word you return must be written fresh from the brief above.`,
    JSON.stringify(format.example, null, 2),
  ].join("\n");

  const messages = [
    { role: "system", content: SYSTEM },
    { role: "user", content: prompt },
  ];

  const exampleJson = JSON.stringify(format.example);

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await callModel(env, messages);
    try {
      const parsed = format.parse(extractJson(raw));
      // Belt and braces: if it handed the sample back anyway, that's a failure,
      // not a creative. Retrying is far cheaper than shipping another brand's
      // copy into a customer's ad account.
      if (JSON.stringify(parsed) === exampleJson) {
        throw new Error("you returned the sample copy verbatim — write original copy from the brief");
      }
      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      // Feed the validation failure back verbatim — models correct reliably
      // when told exactly which key was wrong.
      messages.push({ role: "assistant", content: raw });
      messages.push({
        role: "user",
        content: `That response was not valid for this format: ${lastError}. Return the corrected JSON object only.`,
      });
    }
  }
  throw new Error(`copy for "${format.id}" failed validation twice: ${lastError}`);
}
