import { createApp, createRoute, z } from "@clawnify/app";
import { get, query, run } from "./db.js";
import { deleteUpload, getUpload, initUploads, putUpload, rid } from "./uploads.js";
import {
  CANVASES,
  DEFAULT_ASPECT,
  DEFAULT_BRAND,
  EMPTY_BRIEF,
  FORMATS,
  canvasFor,
  formatCatalogue,
  getFormat,
  type AspectId,
  type Brief,
} from "./formats/index.js";
import {
  brandFromRow,
  buildCtx,
  generateBatch,
  photoDataUri,
  resolvePhotos,
  safeArray,
  type CreativeSeed,
  type GenerateEnv,
} from "./generate.js";

type Bindings = {
  DB: D1Database;
  UPLOADS: R2Bucket;
  OPENROUTER_API_KEY: string;
  CLAWNIFY_TOKEN?: string;
  SERVICES_URL?: string;
  AD_COPY_MODEL?: string;
};
type Env = { Bindings: Bindings };

const app = createApp<Env>({
  title: "OpenAdFormats API",
  version: "1.0.0",
  description:
    "Generates on-brand Meta ad creative across 42 proven static formats. One brief in, a batch of rendered PNGs out — " +
    "each format supplies its own copy shape, so the copy is written for the layout rather than poured into it.",
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message || String(err) }, 500);
});

app.use("*", async (c, next) => {
  initUploads(c.env.UPLOADS);
  await next();
});

// ── Rows ─────────────────────────────────────────────────────────────

interface BrandKitRow {
  id: string;
  name: string;
  colors: string;
  fonts: string;
  logo_r2_key: string | null;
  created_at: string;
}

interface BriefRow {
  id: string;
  brand_kit_id: string;
  product: string;
  category: string;
  audience: string;
  promise: string;
  proof: string;
  objections: string;
  offer: string;
  cta: string;
  domain: string;
  photo_r2_keys: string;
  created_at: string;
  updated_at: string;
}

type BriefBody = Partial<BriefRow> & { proof?: unknown; objections?: unknown };
type KitBody = { name?: string; colors?: unknown; fonts?: unknown };

interface BatchRow {
  id: string;
  brief_id: string;
  aspect: string;
  angle: string;
  status: string;
  error: string | null;
  created_at: string;
}

interface CreativeRow {
  id: string;
  batch_id: string;
  brief_id: string;
  format_id: string;
  aspect: string;
  width: number;
  height: number;
  copy: string | null;
  status: string;
  r2_key: string | null;
  error: string | null;
  created_at: string;
}

function briefFromRow(row: BriefRow): Brief {
  return {
    ...EMPTY_BRIEF,
    product: row.product,
    category: row.category,
    audience: row.audience,
    promise: row.promise,
    proof: safeArray(row.proof),
    objections: safeArray(row.objections),
    offer: row.offer,
    cta: row.cta || EMPTY_BRIEF.cta,
    domain: row.domain,
  };
}

function pageParams(c: { req: { query(k: string): string | undefined } }) {
  const limit = Math.min(Math.max(parseInt(c.req.query("limit") || "25", 10) || 25, 1), 100);
  const offset = Math.max(parseInt(c.req.query("offset") || "0", 10) || 0, 0);
  return { limit, offset, search: (c.req.query("search") || "").trim() };
}

function asAspect(v: unknown): AspectId {
  return v === "1:1" || v === "4:5" || v === "9:16" ? v : DEFAULT_ASPECT;
}

async function loadBrandKit(briefRow: BriefRow) {
  const kit = briefRow.brand_kit_id
    ? await get<BrandKitRow>("SELECT * FROM brand_kits WHERE id=?", [briefRow.brand_kit_id])
    : null;
  const logo = kit?.logo_r2_key ? `/api/uploads/${kit.logo_r2_key}` : undefined;
  // The render service fetches over the network, so a same-origin path won't
  // resolve — logos must be inlined the same way product photos are.
  const logoUri = kit?.logo_r2_key ? await photoDataUri([kit.logo_r2_key]) : undefined;
  void logo;
  return brandFromRow(kit, logoUri);
}

// ── Health ───────────────────────────────────────────────────────────

app.get("/api/health", (c) =>
  c.json({
    copy: !!c.env.OPENROUTER_API_KEY,
    render: !!c.env.CLAWNIFY_TOKEN,
    formats: FORMATS.length,
  }),
);

// ── Format catalogue ─────────────────────────────────────────────────
// A fixed reference set (it changes only when the app ships new code), so this
// is the documented exception to the no-unbounded-collection rule.

const FormatSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  summary: z.string(),
  use_when: z.string(),
  sizes: z.array(z.string()),
  copy_fields: z.array(z.string()),
});

const listFormatsRoute = createRoute({
  method: "get",
  path: "/api/v1/formats",
  summary:
    "The full ad-format catalogue (fixed set of 42). Read `use_when` to pick formats for a brief before calling /api/v1/batches.",
  responses: {
    200: { content: { "application/json": { schema: z.array(FormatSchema) } }, description: "OK" },
  },
});
app.openapi(listFormatsRoute, (c) => c.json(formatCatalogue(), 200));

app.get("/api/v1/canvases", (c) => c.json(Object.values(CANVASES)));

// ── Brand kits ───────────────────────────────────────────────────────

app.get("/api/brand-kits", async (c) => {
  const { limit, offset, search } = pageParams(c);
  const where = search ? "WHERE name LIKE ?" : "";
  const args = search ? [`%${search}%`] : [];
  const total = await get<{ n: number }>(`SELECT COUNT(*) AS n FROM brand_kits ${where}`, args);
  const items = await query<BrandKitRow>(
    `SELECT * FROM brand_kits ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...args, limit, offset],
  );
  return c.json({ items, total: total?.n ?? 0, limit, offset });
});

app.post("/api/brand-kits", async (c) => {
  const b = await c.req.json<KitBody>().catch(() => ({}) as KitBody);
  const id = crypto.randomUUID();
  await run("INSERT INTO brand_kits (id, name, colors, fonts) VALUES (?, ?, ?, ?)", [
    id,
    (typeof b.name === "string" && b.name.trim()) || "Untitled brand",
    JSON.stringify(b.colors ?? DEFAULT_BRAND.colors),
    JSON.stringify(b.fonts ?? DEFAULT_BRAND.fonts),
  ]);
  return c.json(await get<BrandKitRow>("SELECT * FROM brand_kits WHERE id=?", [id]), 201);
});

app.put("/api/brand-kits/:id", async (c) => {
  const id = c.req.param("id");
  const cur = await get<BrandKitRow>("SELECT * FROM brand_kits WHERE id=?", [id]);
  if (!cur) return c.json({ error: "Not found" }, 404);
  const b = await c.req.json<KitBody & { logo_r2_key?: string | null }>();
  await run("UPDATE brand_kits SET name=?, colors=?, fonts=?, logo_r2_key=? WHERE id=?", [
    typeof b.name === "string" && b.name.trim() ? b.name : cur.name,
    b.colors !== undefined ? JSON.stringify(b.colors) : cur.colors,
    b.fonts !== undefined ? JSON.stringify(b.fonts) : cur.fonts,
    b.logo_r2_key !== undefined ? b.logo_r2_key : cur.logo_r2_key,
    id,
  ]);
  return c.json(await get<BrandKitRow>("SELECT * FROM brand_kits WHERE id=?", [id]));
});

app.delete("/api/brand-kits/:id", async (c) => {
  await run("DELETE FROM brand_kits WHERE id=?", [c.req.param("id")]);
  return c.json({ ok: true });
});

// ── Briefs ───────────────────────────────────────────────────────────

const BriefSchema = z.object({
  id: z.string(),
  product: z.string(),
  category: z.string(),
  audience: z.string(),
  promise: z.string(),
  offer: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

const listBriefsRoute = createRoute({
  method: "get",
  path: "/api/v1/briefs",
  summary: "List briefs (bounded page). Use ?search= to narrow by product name rather than paging.",
  request: {
    query: z.object({
      limit: z.string().optional().openapi({ description: "Page size, default 25, max 100." }),
      offset: z.string().optional(),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            items: z.array(BriefSchema),
            total: z.number(),
            limit: z.number(),
            offset: z.number(),
          }),
        },
      },
      description: "OK",
    },
  },
});
app.openapi(listBriefsRoute, async (c) => {
  const { limit, offset, search } = pageParams(c);
  const where = search ? "WHERE product LIKE ? OR category LIKE ?" : "";
  const args = search ? [`%${search}%`, `%${search}%`] : [];
  const total = await get<{ n: number }>(`SELECT COUNT(*) AS n FROM briefs ${where}`, args);
  const items = await query<BriefRow>(
    `SELECT * FROM briefs ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    [...args, limit, offset],
  );
  return c.json(
    {
      items: items.map((r) => ({
        id: r.id,
        product: r.product,
        category: r.category,
        audience: r.audience,
        promise: r.promise,
        offer: r.offer,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
      total: total?.n ?? 0,
      limit,
      offset,
    },
    200,
  );
});

app.post("/api/briefs", async (c) => {
  const b = await c.req.json<BriefBody>().catch(() => ({}) as BriefBody);
  if (!b.product || !String(b.product).trim()) return c.json({ error: "product is required" }, 400);
  const id = crypto.randomUUID();
  await run(
    `INSERT INTO briefs (id, brand_kit_id, product, category, audience, promise, proof, objections, offer, cta, domain)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      b.brand_kit_id ?? "",
      String(b.product).trim(),
      b.category ?? "",
      b.audience ?? "",
      b.promise ?? "",
      JSON.stringify(safeArray(b.proof)),
      JSON.stringify(safeArray(b.objections)),
      b.offer ?? "",
      b.cta || "Shop now",
      b.domain ?? "",
    ],
  );
  return c.json(await get<BriefRow>("SELECT * FROM briefs WHERE id=?", [id]), 201);
});

app.get("/api/briefs/:id", async (c) => {
  const row = await get<BriefRow>("SELECT * FROM briefs WHERE id=?", [c.req.param("id")]);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

app.put("/api/briefs/:id", async (c) => {
  const id = c.req.param("id");
  const cur = await get<BriefRow>("SELECT * FROM briefs WHERE id=?", [id]);
  if (!cur) return c.json({ error: "Not found" }, 404);
  const b = await c.req.json<BriefBody>();
  await run(
    `UPDATE briefs SET brand_kit_id=?, product=?, category=?, audience=?, promise=?, proof=?, objections=?,
     offer=?, cta=?, domain=?, updated_at=datetime('now') WHERE id=?`,
    [
      b.brand_kit_id ?? cur.brand_kit_id,
      (typeof b.product === "string" && b.product.trim()) || cur.product,
      b.category ?? cur.category,
      b.audience ?? cur.audience,
      b.promise ?? cur.promise,
      b.proof !== undefined ? JSON.stringify(safeArray(b.proof)) : cur.proof,
      b.objections !== undefined ? JSON.stringify(safeArray(b.objections)) : cur.objections,
      b.offer ?? cur.offer,
      b.cta ?? cur.cta,
      b.domain ?? cur.domain,
      id,
    ],
  );
  return c.json(await get<BriefRow>("SELECT * FROM briefs WHERE id=?", [id]));
});

app.delete("/api/briefs/:id", async (c) => {
  await run("DELETE FROM briefs WHERE id=?", [c.req.param("id")]);
  return c.json({ ok: true });
});

app.post("/api/briefs/:id/photo", async (c) => {
  const id = c.req.param("id");
  const brief = await get<BriefRow>("SELECT * FROM briefs WHERE id=?", [id]);
  if (!brief) return c.json({ error: "Not found" }, 404);
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return c.json({ error: "file is required" }, 400);
  const ext = (file.name.split(".").pop() || "png").replace(/[^a-z0-9]/gi, "").toLowerCase() || "png";
  const key = `${rid("photo")}.${ext}`;
  await putUpload(key, await file.arrayBuffer(), file.type || "image/png");
  const keys = safeArray(brief.photo_r2_keys).concat(key);
  await run("UPDATE briefs SET photo_r2_keys=?, updated_at=datetime('now') WHERE id=?", [JSON.stringify(keys), id]);
  return c.json({ key, url: `/api/uploads/${key}`, photo_r2_keys: keys }, 201);
});

app.delete("/api/briefs/:id/photo", async (c) => {
  const id = c.req.param("id");
  const brief = await get<BriefRow>("SELECT * FROM briefs WHERE id=?", [id]);
  if (!brief) return c.json({ error: "Not found" }, 404);
  const b = await c.req.json<{ r2_key?: string }>().catch(() => ({}) as { r2_key?: string });
  if (!b.r2_key) return c.json({ error: "r2_key is required" }, 400);
  const keys = safeArray(brief.photo_r2_keys).filter((k) => k !== b.r2_key);
  await run("UPDATE briefs SET photo_r2_keys=?, updated_at=datetime('now') WHERE id=?", [JSON.stringify(keys), id]);
  await deleteUpload(b.r2_key).catch(() => {});
  return c.json({ ok: true, photo_r2_keys: keys });
});

// ── Live HTML preview (no model call, no render spend) ────────────────

app.get("/api/preview/:formatId", async (c) => {
  const format = getFormat(c.req.param("formatId"));
  if (!format) return c.json({ error: "Unknown format" }, 404);
  const aspect = asAspect(c.req.query("aspect"));
  const briefId = c.req.query("brief_id");

  let brief: Brief = { ...EMPTY_BRIEF, product: "Your product", cta: "Shop now", domain: "example.com" };
  let brand = DEFAULT_BRAND;
  let photos = await resolvePhotos([]);

  if (briefId) {
    const row = await get<BriefRow>("SELECT * FROM briefs WHERE id=?", [briefId]);
    if (row) {
      brief = briefFromRow(row);
      brand = await loadBrandKit(row);
      photos = await resolvePhotos(safeArray(row.photo_r2_keys));
    }
  }

  // The format's own example copy — so the gallery is fully populated before a
  // single token is spent.
  const html = format.build(
    buildCtx({ format, brief, brand, copy: format.example, photos, aspect }),
  );
  return c.html(html);
});

/** Re-render a saved creative from its stored copy — free, no model call. */
app.get("/api/creatives/:id/html", async (c) => {
  const row = await get<CreativeRow>("SELECT * FROM creatives WHERE id=?", [c.req.param("id")]);
  if (!row) return c.json({ error: "Not found" }, 404);
  const format = getFormat(row.format_id);
  if (!format) return c.json({ error: "Unknown format" }, 404);
  const briefRow = await get<BriefRow>("SELECT * FROM briefs WHERE id=?", [row.brief_id]);
  if (!briefRow) return c.json({ error: "Brief not found" }, 404);
  const copy = row.copy ? JSON.parse(row.copy) : format.example;
  const html = format.build(
    buildCtx({
      format,
      brief: briefFromRow(briefRow),
      brand: await loadBrandKit(briefRow),
      copy,
      photos: await resolvePhotos(safeArray(briefRow.photo_r2_keys)),
      aspect: asAspect(row.aspect),
    }),
  );
  return c.html(html);
});

// ── Generate a batch ─────────────────────────────────────────────────

const createBatchRoute = createRoute({
  method: "post",
  path: "/api/v1/batches",
  summary:
    "Generate a batch of ad creatives. Pick format ids from /api/v1/formats; omit `formats` to let the app choose a " +
    "spread across categories. This SPENDS the user's model budget — one copy call per creative.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            brief_id: z.string(),
            formats: z.array(z.string()).optional().openapi({
              description: "Format ids. Defaults to one format from each of the six categories.",
            }),
            aspect: z.enum(["1:1", "4:5", "9:16"]).optional(),
            angle: z.string().optional().openapi({
              description: "Optional slant applied to every creative, e.g. 'lead with the guarantee'.",
            }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.string(),
            status: z.string(),
            aspect: z.string(),
            creatives: z.array(
              z.object({
                id: z.string(),
                format_id: z.string(),
                status: z.string(),
                url: z.string().nullable(),
                error: z.string().nullable(),
              }),
            ),
          }),
        },
      },
      description: "Created",
    },
  },
});

/** One format per category — a spread, not six variations on a theme. */
function defaultFormatSpread(): string[] {
  const seen = new Set<string>();
  const picks: string[] = [];
  for (const f of FORMATS) {
    if (seen.has(f.category)) continue;
    seen.add(f.category);
    picks.push(f.id);
  }
  return picks;
}

app.openapi(createBatchRoute, async (c) => {
  const body = c.req.valid("json");
  const briefRow = await get<BriefRow>("SELECT * FROM briefs WHERE id=?", [body.brief_id]);
  if (!briefRow) throw new Error(`brief "${body.brief_id}" not found`);
  if (!c.env.OPENROUTER_API_KEY) throw new Error("Copy generation needs OPENROUTER_API_KEY");

  const requested = body.formats?.length ? body.formats : defaultFormatSpread();
  const unknown = requested.filter((id) => !getFormat(id));
  if (unknown.length) throw new Error(`unknown format id(s): ${unknown.join(", ")}`);

  const aspect = asAspect(body.aspect);
  const batchId = crypto.randomUUID();
  await run("INSERT INTO batches (id, brief_id, aspect, angle, status) VALUES (?, ?, ?, ?, 'running')", [
    batchId,
    briefRow.id,
    aspect,
    body.angle ?? "",
  ]);

  const seeds: CreativeSeed[] = requested.map((formatId) => ({ id: crypto.randomUUID(), formatId }));
  for (const seed of seeds) {
    const canvas = canvasFor(getFormat(seed.formatId)!, aspect);
    await run(
      `INSERT INTO creatives (id, batch_id, brief_id, format_id, aspect, width, height, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [seed.id, batchId, briefRow.id, seed.formatId, canvas.id, canvas.width, canvas.height],
    );
  }

  const results = await generateBatch(seeds, {
    brief: briefFromRow(briefRow),
    brand: await loadBrandKit(briefRow),
    photos: await resolvePhotos(safeArray(briefRow.photo_r2_keys)),
    aspect,
    angle: body.angle || undefined,
    env: c.env as GenerateEnv,
    onResult: async (r) => {
      await run("UPDATE creatives SET status=?, copy=?, r2_key=?, error=? WHERE id=?", [
        r.status,
        r.copy ? JSON.stringify(r.copy) : null,
        r.r2Key,
        r.error,
        r.id,
      ]);
    },
  });

  const failed = results.filter((r) => r.status === "failed").length;
  const status = failed === results.length ? "failed" : "ready";
  await run("UPDATE batches SET status=?, error=? WHERE id=?", [
    status,
    failed ? `${failed} of ${results.length} creatives failed` : null,
    batchId,
  ]);

  return c.json(
    {
      id: batchId,
      status,
      aspect,
      creatives: results.map((r) => ({
        id: r.id,
        format_id: r.formatId,
        status: r.status,
        url: r.r2Key ? `/api/uploads/${r.r2Key}` : null,
        error: r.error,
      })),
    },
    201,
  );
});

const getBatchRoute = createRoute({
  method: "get",
  path: "/api/v1/batches/{id}",
  summary: "One batch with its creatives — download urls, per-creative status, and the copy that was generated.",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.string(),
            brief_id: z.string(),
            aspect: z.string(),
            status: z.string(),
            creatives: z.array(z.record(z.unknown())),
          }),
        },
      },
      description: "OK",
    },
  },
});
app.openapi(getBatchRoute, async (c) => {
  const id = c.req.valid("param").id;
  const batch = await get<BatchRow>("SELECT * FROM batches WHERE id=?", [id]);
  if (!batch) throw new Error(`batch "${id}" not found`);
  const rows = await query<CreativeRow>(
    "SELECT * FROM creatives WHERE batch_id=? ORDER BY created_at ASC LIMIT 100",
    [id],
  );
  return c.json(
    {
      id: batch.id,
      brief_id: batch.brief_id,
      aspect: batch.aspect,
      status: batch.status,
      creatives: rows.map((r) => ({
        ...r,
        copy: r.copy ? JSON.parse(r.copy) : null,
        url: r.r2_key ? `/api/uploads/${r.r2_key}` : null,
        format_name: getFormat(r.format_id)?.name ?? r.format_id,
      })),
    },
    200,
  );
});

app.get("/api/briefs/:id/batches", async (c) => {
  const { limit, offset } = pageParams(c);
  const briefId = c.req.param("id");
  const total = await get<{ n: number }>("SELECT COUNT(*) AS n FROM batches WHERE brief_id=?", [briefId]);
  const items = await query<BatchRow & { creative_count: number; done_count: number }>(
    `SELECT b.*,
       (SELECT COUNT(*) FROM creatives c WHERE c.batch_id = b.id) AS creative_count,
       (SELECT COUNT(*) FROM creatives c WHERE c.batch_id = b.id AND c.status='done') AS done_count
     FROM batches b WHERE b.brief_id=? ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
    [briefId, limit, offset],
  );
  return c.json({ items, total: total?.n ?? 0, limit, offset });
});

app.delete("/api/batches/:id", async (c) => {
  const id = c.req.param("id");
  const rows = await query<CreativeRow>("SELECT * FROM creatives WHERE batch_id=?", [id]);
  for (const r of rows) if (r.r2_key) await deleteUpload(r.r2_key).catch(() => {});
  await run("DELETE FROM creatives WHERE batch_id=?", [id]);
  await run("DELETE FROM batches WHERE id=?", [id]);
  return c.json({ ok: true });
});

// ── Export manifest ──────────────────────────────────────────────────

const exportRoute = createRoute({
  method: "get",
  path: "/api/v1/batches/{id}/export",
  summary:
    "Download manifest for a finished batch: one row per creative with its PNG url, dimensions and the ad copy, " +
    "ready to hand to a media buyer or paste into Ads Manager.",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ batch_id: z.string(), files: z.array(z.record(z.unknown())) }) } },
      description: "OK",
    },
  },
});
app.openapi(exportRoute, async (c) => {
  const id = c.req.valid("param").id;
  const rows = await query<CreativeRow>(
    "SELECT * FROM creatives WHERE batch_id=? AND status='done' ORDER BY created_at ASC LIMIT 100",
    [id],
  );
  return c.json(
    {
      batch_id: id,
      files: rows.map((r) => ({
        filename: `${r.format_id}-${r.aspect.replace(":", "x")}.png`,
        url: r.r2_key ? `/api/uploads/${r.r2_key}` : null,
        format: getFormat(r.format_id)?.name ?? r.format_id,
        width: r.width,
        height: r.height,
        copy: r.copy ? JSON.parse(r.copy) : null,
      })),
    },
    200,
  );
});

// ── Uploads ──────────────────────────────────────────────────────────

app.get("/api/uploads/:key", async (c) => {
  const file = await getUpload(c.req.param("key"));
  if (!file) return c.json({ error: "Not found" }, 404);
  return new Response(file.data, {
    headers: { "Content-Type": file.contentType, "Cache-Control": "public, max-age=31536000, immutable" },
  });
});

export default app;
