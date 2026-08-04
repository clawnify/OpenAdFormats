/**
 * Managed-render client: a self-contained HTML document in, PNG bytes out.
 *
 * The service runs real Chrome (Cloudflare Browser Rendering), which is why
 * the formats can rely on Google Fonts, flexbox and CSS gradients behaving
 * exactly as authored rather than as an SVG rasteriser approximates them.
 */

const DEFAULT_SERVICES_URL = "https://services.clawnify.com";

async function errorDetail(res: Response): Promise<string> {
  let detail = `render service returned ${res.status}`;
  try {
    const j = (await res.json()) as { error?: string; detail?: string };
    detail = j.detail || j.error || detail;
  } catch {
    /* non-JSON error body */
  }
  return detail;
}

/** HTML → PNG at 2× device scale, so a 1080px canvas exports at 2160px. */
export async function renderPng(a: {
  html: string;
  width: number;
  height: number;
  filename: string;
  token: string;
  servicesUrl?: string;
}): Promise<ArrayBuffer> {
  const res = await fetch(`${a.servicesUrl || DEFAULT_SERVICES_URL}/screenshot/render`, {
    method: "POST",
    headers: { Authorization: `Bearer ${a.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      html: a.html,
      viewport: { width: a.width, height: a.height, deviceScaleFactor: 2 },
      type: "png",
      filename: a.filename,
      // Fonts load over the network inside the render; without this the
      // capture can beat the stylesheet and fall back to a system face.
      goto_wait_until: "networkidle0",
    }),
  });
  if (!res.ok) throw new Error(await errorDetail(res));
  return res.arrayBuffer();
}
