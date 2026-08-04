export interface FormatMeta {
  id: string;
  name: string;
  category: string;
  summary: string;
  use_when: string;
  sizes: string[];
  copy_fields: string[];
}

export interface BriefRow {
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

/** Write shape: proof/objections travel as arrays, not the stored JSON string. */
export type BriefInput = Partial<Omit<BriefRow, "proof" | "objections">> & {
  proof?: string[];
  objections?: string[];
};

export interface BrandKitRow {
  id: string;
  name: string;
  colors: string;
  fonts: string;
  logo_r2_key: string | null;
}

export interface CreativeRow {
  id: string;
  format_id: string;
  format_name: string;
  aspect: string;
  width: number;
  height: number;
  status: string;
  url: string | null;
  error: string | null;
  copy: Record<string, unknown> | null;
}

export interface BatchRow {
  id: string;
  brief_id: string;
  aspect: string;
  angle: string;
  status: string;
  created_at: string;
  creative_count?: number;
  done_count?: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init?.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string });
    throw new Error((body as { error?: string }).error || `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => req<{ copy: boolean; render: boolean; formats: number }>("/api/health"),

  formats: () => req<FormatMeta[]>("/api/v1/formats"),

  listBriefs: (search = "") =>
    req<Page<BriefRow>>(`/api/v1/briefs?limit=50&search=${encodeURIComponent(search)}`),
  getBrief: (id: string) => req<BriefRow>(`/api/briefs/${id}`),
  createBrief: (body: BriefInput) => req<BriefRow>("/api/briefs", { method: "POST", body: JSON.stringify(body) }),
  updateBrief: (id: string, body: BriefInput) =>
    req<BriefRow>(`/api/briefs/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteBrief: (id: string) => req<{ ok: true }>(`/api/briefs/${id}`, { method: "DELETE" }),

  uploadPhoto: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return req<{ key: string; url: string; photo_r2_keys: string[] }>(`/api/briefs/${id}/photo`, {
      method: "POST",
      body: form,
    });
  },
  removePhoto: (id: string, r2_key: string) =>
    req<{ ok: true; photo_r2_keys: string[] }>(`/api/briefs/${id}/photo`, {
      method: "DELETE",
      body: JSON.stringify({ r2_key }),
    }),

  listKits: () => req<Page<BrandKitRow>>("/api/brand-kits?limit=50"),
  createKit: (body: { name?: string; colors?: unknown; fonts?: unknown }) =>
    req<BrandKitRow>("/api/brand-kits", { method: "POST", body: JSON.stringify(body) }),
  updateKit: (id: string, body: { name?: string; colors?: unknown; fonts?: unknown }) =>
    req<BrandKitRow>(`/api/brand-kits/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  createBatch: (body: { brief_id: string; formats?: string[]; aspect?: string; angle?: string }) =>
    req<{ id: string; status: string; creatives: CreativeRow[] }>("/api/v1/batches", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getBatch: (id: string) =>
    req<BatchRow & { creatives: CreativeRow[] }>(`/api/v1/batches/${id}`),
  listBatches: (briefId: string) => req<Page<BatchRow>>(`/api/briefs/${briefId}/batches?limit=25`),
  deleteBatch: (id: string) => req<{ ok: true }>(`/api/batches/${id}`, { method: "DELETE" }),
  exportBatch: (id: string) =>
    req<{ batch_id: string; files: Array<Record<string, unknown>> }>(`/api/v1/batches/${id}/export`),
};

export function parseList(raw: string): string[] {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
