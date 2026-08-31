-- OpenAdFormats — canonical schema.
--
-- A BRIEF is the durable object: one product, its proof, its offer, its brand
-- kit. A BATCH is one generation run against that brief (pick formats, pick a
-- ratio, go), and a CREATIVE is one rendered ad inside a batch. Creatives keep
-- their generated copy as JSON so a user can re-render after an edit without
-- paying for the model again.

CREATE TABLE IF NOT EXISTS brand_kits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled brand',
  colors TEXT NOT NULL DEFAULT '{}',   -- JSON { ink, background, accent, muted, surface }
  fonts TEXT NOT NULL DEFAULT '{}',    -- JSON { heading, body } — Google Fonts families
  logo_r2_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);


CREATE TABLE IF NOT EXISTS briefs (
  id TEXT PRIMARY KEY,
  brand_kit_id TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT '',
  promise TEXT NOT NULL DEFAULT '',
  proof TEXT NOT NULL DEFAULT '[]',       -- JSON array of substantiated claims
  objections TEXT NOT NULL DEFAULT '[]',  -- JSON array
  offer TEXT NOT NULL DEFAULT '',
  cta TEXT NOT NULL DEFAULT 'Shop now',
  domain TEXT NOT NULL DEFAULT '',
  photo_r2_keys TEXT NOT NULL DEFAULT '[]', -- JSON array of uploaded photo keys
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);


CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  brief_id TEXT NOT NULL,
  aspect TEXT NOT NULL DEFAULT '4:5',      -- 1:1 | 4:5 | 9:16
  angle TEXT NOT NULL DEFAULT '',          -- optional slant applied to every creative
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | running | ready | failed
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_batches_brief ON batches(brief_id);

CREATE TABLE IF NOT EXISTS creatives (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  brief_id TEXT NOT NULL,
  format_id TEXT NOT NULL,                 -- formats registry id
  aspect TEXT NOT NULL DEFAULT '4:5',
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  copy TEXT,                               -- JSON — the format's validated copy object
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | copy | rendering | done | failed
  r2_key TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_creatives_batch ON creatives(batch_id);
CREATE INDEX IF NOT EXISTS idx_creatives_brief ON creatives(brief_id);
