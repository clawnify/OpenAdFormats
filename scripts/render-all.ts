/**
 * Render every registered format to a PNG using its own example copy.
 *
 * This is the visual regression harness: no model calls, no database, just
 * registry → HTML → the real render service. Run it after touching any format
 * and look at the output before shipping.
 *
 *   CLAWNIFY_TOKEN=... npx tsx scripts/render-all.ts [outDir] [aspect]
 */

import { mkdir, writeFile } from "node:fs/promises";
import { FORMATS, PLACEHOLDER_PHOTO, canvasFor, type AspectId } from "../src/server/formats/index.js";
import { DEFAULT_BRAND, EMPTY_BRIEF } from "../src/server/formats/types.js";
import { renderPng } from "../src/server/render.js";

const OUT = process.argv[2] || "preview";
const ASPECT = (process.argv[3] as AspectId) || "4:5";
const TOKEN = process.env.CLAWNIFY_TOKEN;
const CONCURRENCY = 4;

const BRIEF = {
  ...EMPTY_BRIEF,
  product: "Northwind",
  category: "greens powder",
  audience: "people who bloat after every meal",
  promise: "no bloating by week two",
  cta: "Shop now",
  domain: "northwind.com",
};

async function main() {
  await mkdir(OUT, { recursive: true });
  const queue = [...FORMATS];
  const failures: Array<{ id: string; error: string }> = [];
  let done = 0;

  async function worker() {
    for (;;) {
      const format = queue.shift();
      if (!format) return;
      const canvas = canvasFor(format, ASPECT);
      const index = String(FORMATS.indexOf(format) + 1).padStart(2, "0");
      try {
        const html = format.build({
          brief: BRIEF,
          brand: DEFAULT_BRAND,
          copy: format.example,
          photoDataUri: PLACEHOLDER_PHOTO,
          photos: [PLACEHOLDER_PHOTO],
          canvas,
        });
        await writeFile(`${OUT}/${index}-${format.id}.html`, html);

        if (TOKEN) {
          const bytes = await renderPng({
            html,
            width: canvas.width,
            height: canvas.height,
            filename: `${format.id}.png`,
            token: TOKEN,
          });
          await writeFile(`${OUT}/${index}-${format.id}.png`, Buffer.from(bytes));
        }
        done++;
        console.log(`  ok  ${index} ${format.id} (${canvas.id})`);
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        failures.push({ id: format.id, error });
        console.log(`  FAIL ${index} ${format.id}: ${error}`);
      }
    }
  }

  console.log(`Rendering ${FORMATS.length} formats at ${ASPECT}${TOKEN ? "" : " (HTML only — no CLAWNIFY_TOKEN)"}`);
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`\n${done}/${FORMATS.length} rendered into ${OUT}/`);
  if (failures.length) {
    console.log(`\n${failures.length} failed:`);
    for (const f of failures) console.log(`  ${f.id}: ${f.error}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
