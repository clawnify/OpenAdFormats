import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Grid2x2, Images, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import {
  api,
  parseList,
  type BatchRow,
  type BriefRow,
  type CreativeRow,
  type FormatMeta,
} from "./api";
import { Badge, Button, Card, Chip, EmptyState, Eyebrow, Field, Input, Segmented, Spinner, Textarea, Zone } from "./components/ui";

const CATEGORY_ORDER = ["native-ui", "social-proof", "comparison", "list", "urgency", "offer"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  "native-ui": "Native UI",
  "social-proof": "Social proof",
  comparison: "Comparison",
  list: "List & teaching",
  urgency: "Urgency & warning",
  offer: "Offer & hook",
};

const ASPECTS = [
  { value: "1:1", label: "1:1" },
  { value: "4:5", label: "4:5" },
  { value: "9:16", label: "9:16" },
] as const;
type Aspect = (typeof ASPECTS)[number]["value"];

type View = "briefs" | "formats" | "batch";

export default function App() {
  const [view, setView] = useState<View>("briefs");
  const [formats, setFormats] = useState<FormatMeta[]>([]);
  const [briefs, setBriefs] = useState<BriefRow[]>([]);
  const [activeBrief, setActiveBrief] = useState<BriefRow | null>(null);
  const [activeBatch, setActiveBatch] = useState<(BatchRow & { creatives: CreativeRow[] }) | null>(null);
  const [health, setHealth] = useState<{ copy: boolean; render: boolean; formats: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshBriefs = useCallback(async () => {
    const page = await api.listBriefs();
    setBriefs(page.items);
    return page.items;
  }, []);

  useEffect(() => {
    api.formats().then(setFormats).catch((e) => setError(String(e.message)));
    api.health().then(setHealth).catch(() => {});
    refreshBriefs().catch((e) => setError(String(e.message)));
  }, [refreshBriefs]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Agent mode: bigger targets, no hover-only affordances (see DESIGN.md).
    if (params.has("agent") || params.get("mode") === "agent") {
      document.documentElement.setAttribute("data-agent", "true");
    }
    // The app follows the OS colour scheme by default. `?theme=light|dark`
    // pins it — used for documentation screenshots and for checking both
    // palettes without changing your system setting.
    const theme = params.get("theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    }
    // Deep-link a view so an agent (or a doc screenshot) can land straight on
    // the format library instead of having to click into it.
    const v = params.get("view");
    if (v === "briefs" || v === "formats" || v === "batch") setView(v);
  }, []);

  const NAV: Array<{ id: View; label: string; icon: typeof FileText }> = [
    { id: "briefs", label: "Briefs", icon: FileText },
    { id: "formats", label: "Format library", icon: Grid2x2 },
    { id: "batch", label: "Creatives", icon: Images },
  ];

  return (
    <div className="flex h-full">
      <aside className="hidden w-[16.25rem] shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-14 items-center border-b border-border px-5">
          <span className="text-base font-bold tracking-[-0.01em]">Ad Formats</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          <div className="px-2 pb-2 pt-1">
            <Eyebrow>Workspace</Eyebrow>
          </div>
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setView(n.id)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-[0.4375rem] text-sm transition-colors duration-150 ${
                  active ? "bg-primary/12 font-semibold text-primary" : "text-foreground hover:bg-sunken"
                }`}
              >
                <Icon className="size-4 shrink-0" strokeWidth={2} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border p-4">
          <Eyebrow>Status</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip>{formats.length} formats</Chip>
            {health && !health.copy ? <Badge tone="warning">No copy key</Badge> : null}
            {health && !health.render ? <Badge tone="warning">No render token</Badge> : null}
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {error ? (
          <div className="border-b border-border bg-danger-tint px-6 py-2 text-[0.8125rem] text-danger">{error}</div>
        ) : null}

        {view === "briefs" ? (
          <BriefsView
            briefs={briefs}
            formats={formats}
            active={activeBrief}
            setActive={setActiveBrief}
            refresh={refreshBriefs}
            onBatch={(b) => {
              setActiveBatch(b);
              setView("batch");
            }}
            onError={setError}
          />
        ) : null}

        {view === "formats" ? <FormatsView formats={formats} briefId={activeBrief?.id ?? null} /> : null}

        {view === "batch" ? (
          <BatchView batch={activeBatch} onReload={async (id) => setActiveBatch(await api.getBatch(id))} />
        ) : null}
      </main>
    </div>
  );
}

// ── Briefs ───────────────────────────────────────────────────────────

function BriefsView({
  briefs,
  formats,
  active,
  setActive,
  refresh,
  onBatch,
  onError,
}: {
  briefs: BriefRow[];
  formats: FormatMeta[];
  active: BriefRow | null;
  setActive: (b: BriefRow | null) => void;
  refresh: () => Promise<BriefRow[]>;
  onBatch: (b: BatchRow & { creatives: CreativeRow[] }) => void;
  onError: (e: string) => void;
}) {
  if (active) {
    return (
      <BriefEditor
        brief={active}
        formats={formats}
        onBack={() => setActive(null)}
        onSaved={async (b) => {
          setActive(b);
          await refresh();
        }}
        onBatch={onBatch}
        onError={onError}
      />
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
        <h1 className="text-xl font-bold tracking-[-0.01em]">Briefs</h1>
        <Button
          variant="primary"
          onClick={async () => {
            try {
              const b = await api.createBrief({ product: "New product" });
              await refresh();
              setActive(b);
            } catch (e) {
              onError((e as Error).message);
            }
          }}
        >
          <Plus className="size-4 shrink-0" strokeWidth={2} />
          New brief
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <Eyebrow>{`Briefs · ${briefs.length}`}</Eyebrow>
        {briefs.length === 0 ? (
          <EmptyState title="No briefs yet. A brief holds one product's promise, proof and offer — every creative is generated from it." />
        ) : (
          <div className="-mx-6 mt-3 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-y border-border bg-sunken">
                  {["Product", "Category", "Audience", "Offer", "Updated"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-3 py-2.5 text-left text-xs font-semibold tracking-[0.04em] text-muted first:pl-6 last:pr-6 ${
                        i === 4 ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {briefs.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setActive(b)}
                    className="cursor-pointer border-b border-border transition-colors duration-150 hover:bg-sunken"
                  >
                    <td className="px-3 py-2.5 text-[0.8125rem] font-medium first:pl-6">{b.product}</td>
                    <td className="px-3 py-2.5 text-[0.8125rem] text-muted">{b.category || "—"}</td>
                    <td className="max-w-xs truncate px-3 py-2.5 text-[0.8125rem] text-muted">{b.audience || "—"}</td>
                    <td className="px-3 py-2.5 text-[0.8125rem] text-muted">{b.offer || "—"}</td>
                    <td className="tnum px-3 py-2.5 text-right text-[0.8125rem] text-muted last:pr-6">
                      {b.updated_at?.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function BriefEditor({
  brief,
  formats,
  onBack,
  onSaved,
  onBatch,
  onError,
}: {
  brief: BriefRow;
  formats: FormatMeta[];
  onBack: () => void;
  onSaved: (b: BriefRow) => Promise<void>;
  onBatch: (b: BatchRow & { creatives: CreativeRow[] }) => void;
  onError: (e: string) => void;
}) {
  const [draft, setDraft] = useState(brief);
  const [proof, setProof] = useState(parseList(brief.proof).join("\n"));
  const [objections, setObjections] = useState(parseList(brief.objections).join("\n"));
  const [photos, setPhotos] = useState(parseList(brief.photo_r2_keys));
  const [picked, setPicked] = useState<string[]>([]);
  const [aspect, setAspect] = useState<Aspect>("4:5");
  const [angle, setAngle] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setDraft(brief);
    setProof(parseList(brief.proof).join("\n"));
    setObjections(parseList(brief.objections).join("\n"));
    setPhotos(parseList(brief.photo_r2_keys));
  }, [brief]);

  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

  const save = async () => {
    setBusy("Saving");
    try {
      const saved = await api.updateBrief(brief.id, {
        ...draft,
        proof: lines(proof),
        objections: lines(objections),
      });
      await onSaved(saved);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const generate = async () => {
    setBusy(`Generating ${picked.length || "a spread of"} creatives`);
    try {
      await api.updateBrief(brief.id, { ...draft, proof: lines(proof), objections: lines(objections) });
      const batch = await api.createBatch({
        brief_id: brief.id,
        formats: picked.length ? picked : undefined,
        aspect,
        angle: angle || undefined,
      });
      onBatch(await api.getBatch(batch.id));
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const set = (k: keyof BriefRow) => (e: { target: { value: string } }) =>
    setDraft({ ...draft, [k]: e.target.value });

  const byCategory = useMemo(() => {
    const map = new Map<string, FormatMeta[]>();
    for (const f of formats) map.set(f.category, [...(map.get(f.category) ?? []), f]);
    return map;
  }, [formats]);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            Briefs
          </Button>
          <h1 className="truncate text-xl font-bold tracking-[-0.01em]">{draft.product || "Untitled"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {busy ? <Spinner label={busy} /> : null}
          <Button onClick={save} disabled={!!busy}>
            Save
          </Button>
          <Button variant="primary" onClick={generate} disabled={!!busy}>
            <RefreshCw className="size-4 shrink-0" strokeWidth={2} />
            Generate creatives
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="mx-auto grid max-w-[75rem] gap-5 lg:grid-cols-2">
          <Card>
            <Zone label="Product" first>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Product name">
                  <Input value={draft.product} onChange={set("product")} />
                </Field>
                <Field label="Category" hint="How a customer would describe it">
                  <Input value={draft.category} onChange={set("category")} placeholder="greens powder" />
                </Field>
              </div>
              <div className="mt-3 grid gap-3">
                <Field label="Audience" hint="Drives voice more than any other field">
                  <Input value={draft.audience} onChange={set("audience")} placeholder="people who bloat after every meal" />
                </Field>
                <Field label="Core promise" hint="The one outcome the ad sells">
                  <Input value={draft.promise} onChange={set("promise")} placeholder="no bloating by week two" />
                </Field>
              </div>
            </Zone>

            <Zone label="Proof">
              <Textarea
                rows={5}
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder={"One substantiated fact per line.\n82% would buy again (survey of 221 customers)\nThird-party tested every batch"}
              />
              <p className="mt-2 text-[0.6875rem] text-faint">
                The only facts the copywriter may state. Anything missing here will not appear in a creative — statistics
                and scarcity are never invented.
              </p>
            </Zone>

            <Zone label="Objections">
              <Textarea
                rows={3}
                value={objections}
                onChange={(e) => setObjections(e.target.value)}
                placeholder={"One per line.\nToo expensive versus the supermarket brand\nTried greens before and hated the taste"}
              />
            </Zone>

            <Zone label="Offer & destination">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Offer" hint="The only commercial terms that may appear">
                  <Input value={draft.offer} onChange={set("offer")} placeholder="50% off first order" />
                </Field>
                <Field label="Call to action">
                  <Input value={draft.cta} onChange={set("cta")} placeholder="Shop now" />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Display domain">
                  <Input value={draft.domain} onChange={set("domain")} placeholder="northwind.com" />
                </Field>
              </div>
            </Zone>

            <Zone
              label={`Photos · ${photos.length}`}
              action={
                <label className="inline-flex h-8 cursor-pointer items-center gap-x-1.5 rounded-sm border border-border bg-surface px-2 text-sm font-medium transition-colors duration-150 hover:bg-sunken">
                  <Upload className="size-4 shrink-0" strokeWidth={2} />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const r = await api.uploadPhoto(brief.id, file);
                        setPhotos(r.photo_r2_keys);
                      } catch (err) {
                        onError((err as Error).message);
                      }
                    }}
                  />
                </label>
              }
            >
              {photos.length === 0 ? (
                <p className="text-[0.8125rem] text-muted">
                  No photo yet — creatives render with a placeholder. The before/after format uses a second photo when
                  you upload one.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {photos.map((k) => (
                    <div key={k} className="group relative">
                      <img
                        src={`/api/uploads/${k}`}
                        alt=""
                        className="size-20 rounded-sm border border-border object-cover"
                      />
                      <button
                        type="button"
                        aria-label="Remove photo"
                        onClick={async () => {
                          const r = await api.removePhoto(brief.id, k);
                          setPhotos(r.photo_r2_keys);
                        }}
                        className="absolute -right-1.5 -top-1.5 rounded-full border border-border bg-surface p-1 text-muted hover:text-danger"
                      >
                        <Trash2 className="size-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Zone>
          </Card>

          <Card className="self-start">
            <Zone
              label={`Formats · ${picked.length || "spread"} selected`}
              first
              action={
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setPicked([])}>
                    Clear
                  </Button>
                  <Segmented value={aspect} options={ASPECTS as never} onChange={setAspect} />
                </div>
              }
            >
              <p className="mb-3 text-[0.8125rem] text-muted">
                Leave everything unselected to get one format from each category — a spread rather than six variations on
                a theme.
              </p>
              <div className="flex flex-col gap-4">
                {CATEGORY_ORDER.map((cat) => {
                  const list = byCategory.get(cat) ?? [];
                  if (!list.length) return null;
                  return (
                    <div key={cat}>
                      <Eyebrow>{CATEGORY_LABELS[cat]}</Eyebrow>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {list.map((f) => {
                          const on = picked.includes(f.id);
                          return (
                            <button
                              key={f.id}
                              type="button"
                              title={f.use_when}
                              aria-pressed={on}
                              onClick={() =>
                                setPicked(on ? picked.filter((x) => x !== f.id) : [...picked, f.id])
                              }
                              className={`rounded-sm border px-2 py-1 text-[0.6875rem] transition-colors duration-150 ${
                                on
                                  ? "border-primary bg-primary/12 text-primary"
                                  : "border-border bg-sunken text-muted hover:text-foreground"
                              }`}
                            >
                              {f.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Zone>

            <Zone label="Angle">
              <Field label="Optional slant applied to every creative" hint="e.g. lead with the guarantee">
                <Input value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="lead with the guarantee" />
              </Field>
            </Zone>
          </Card>
        </div>
      </div>
    </>
  );
}

// ── Format library ───────────────────────────────────────────────────

/**
 * The real 1080px-wide template in an iframe, scaled down to fit its card —
 * so the gallery shows exactly what renders to PNG, not a mock of it.
 *
 * The scale has to be measured rather than expressed in CSS: `transform:
 * scale()` takes a unitless number, so there is no percentage or container
 * unit that resolves to "container width ÷ 1080".
 */
function FormatPreview({ title, src, ratio }: { title: string; src: string; ratio: number }) {
  const [scale, setScale] = useState(0);
  const [visible, setVisible] = useState(false);
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!host) return;
    const measure = () => setScale(host.clientWidth / 1080);
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(host);

    // Mount the iframe only once the card approaches the viewport. `loading="lazy"`
    // is not enough: 42 iframes, each a full document pulling Google Fonts, locks
    // the tab for seconds on first paint. Once mounted it stays mounted, so
    // scrolling back up doesn't re-fetch.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(host);

    return () => {
      resize.disconnect();
      io.disconnect();
    };
  }, [host]);

  return (
    <div ref={setHost} style={{ aspectRatio: String(ratio) }} className="relative w-full overflow-hidden">
      {scale > 0 && visible ? (
        <iframe
          title={title}
          src={src}
          loading="lazy"
          scrolling="no"
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
          style={{ width: 1080, height: Math.round(1080 / ratio), transform: `scale(${scale})` }}
        />
      ) : null}
    </div>
  );
}

function FormatsView({ formats, briefId }: { formats: FormatMeta[]; briefId: string | null }) {
  const [aspect, setAspect] = useState<Aspect>("4:5");
  const [category, setCategory] = useState<string>("all");

  const shown = formats.filter((f) => category === "all" || f.category === category);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-6">
        <h1 className="text-xl font-bold tracking-[-0.01em]">Format library</h1>
        <Segmented value={aspect} options={ASPECTS as never} onChange={setAspect} />
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {[{ id: "all", label: `All · ${formats.length}` }, ...CATEGORY_ORDER.map((c) => ({ id: c, label: CATEGORY_LABELS[c] }))].map(
            (c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={category === c.id}
                onClick={() => setCategory(c.id)}
                className={`rounded-sm border px-2 py-1 text-[0.6875rem] transition-colors duration-150 ${
                  category === c.id
                    ? "border-primary bg-primary/12 text-primary"
                    : "border-border bg-sunken text-muted hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ),
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((f) => {
            const supported = f.sizes.includes(aspect) ? aspect : (f.sizes[0] as Aspect);
            const src = `/api/preview/${f.id}?aspect=${encodeURIComponent(supported)}${
              briefId ? `&brief_id=${briefId}` : ""
            }`;
            const ratio = supported === "1:1" ? 1 : supported === "4:5" ? 1080 / 1350 : 1080 / 1920;
            return (
              <Card key={f.id}>
                <div className="overflow-hidden rounded-t-lg border-b border-border bg-sunken">
                  <FormatPreview title={f.name} src={src} ratio={ratio} />
                </div>
                <Zone label={f.category.replace("-", " ")} first>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold">{f.name}</h2>
                    <div className="flex shrink-0 gap-1">
                      {f.sizes.map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1.5 text-[0.8125rem] text-muted">{f.summary}</p>
                  <p className="mt-2 text-[0.6875rem] text-faint">{f.use_when}</p>
                </Zone>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Batch ────────────────────────────────────────────────────────────

function BatchView({
  batch,
  onReload,
}: {
  batch: (BatchRow & { creatives: CreativeRow[] }) | null;
  onReload: (id: string) => Promise<void>;
}) {
  if (!batch) {
    return (
      <>
        <header className="flex h-14 shrink-0 items-center border-b border-border px-6">
          <h1 className="text-xl font-bold tracking-[-0.01em]">Creatives</h1>
        </header>
        <EmptyState title="No batch open. Pick a brief and hit Generate creatives." />
      </>
    );
  }

  const done = batch.creatives.filter((c) => c.status === "done");
  const failed = batch.creatives.filter((c) => c.status === "failed");

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
        <h1 className="text-xl font-bold tracking-[-0.01em]">Creatives</h1>
        <div className="flex items-center gap-2">
          {failed.length ? <Badge tone="warning">{failed.length} failed</Badge> : null}
          <Button onClick={() => onReload(batch.id)}>
            <RefreshCw className="size-4 shrink-0" strokeWidth={2} />
            Refresh
          </Button>
          <a
            href={`/api/v1/batches/${batch.id}/export`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center rounded-sm bg-primary px-2 text-sm font-medium text-on-primary transition-colors duration-150 hover:bg-primary-hover"
          >
            Export manifest
          </a>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <Eyebrow>{`Batch · ${done.length} of ${batch.creatives.length} rendered · ${batch.aspect}`}</Eyebrow>
        <div className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {batch.creatives.map((c) => (
            <Card key={c.id}>
              <div className="border-b border-border bg-sunken">
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noreferrer">
                    <img src={c.url} alt={c.format_name} className="w-full rounded-t-lg" />
                  </a>
                ) : (
                  <div className="flex h-48 items-center justify-center px-4 text-center text-[0.8125rem] text-muted">
                    {c.error || "Not rendered"}
                  </div>
                )}
              </div>
              <Zone label={c.format_name} first>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <Chip>{c.aspect}</Chip>
                    <Chip>
                      <span className="tnum">
                        {c.width}×{c.height}
                      </span>
                    </Chip>
                  </div>
                  {c.status === "done" ? (
                    <Badge tone="success">Ready</Badge>
                  ) : (
                    <Badge tone="danger">Failed</Badge>
                  )}
                </div>
                {c.copy ? (
                  <dl className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
                    {Object.entries(c.copy)
                      .slice(0, 4)
                      .map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[7rem_1fr] gap-2">
                          <dt className="text-[0.6875rem] font-semibold tracking-[0.04em] text-muted">{k}</dt>
                          <dd className="truncate text-[0.6875rem] text-foreground">
                            {Array.isArray(v) ? v.join(" · ") : String(v)}
                          </dd>
                        </div>
                      ))}
                  </dl>
                ) : null}
              </Zone>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
