import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function isAllowedGlbUrl(u: URL): boolean {
  if (u.protocol !== "https:") return false;
  if (!u.pathname.toLowerCase().endsWith(".glb")) return false;
  // Allow any https host (S3, CloudFront, etc.)
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const urlParam = req.nextUrl.searchParams.get("url");
    if (!urlParam) {
      return new Response("Missing url param", { status: 400 });
    }
    // Some environments double-encode query params. Decode defensively.
    let raw = urlParam;
    try {
      raw = decodeURIComponent(raw);
    } catch {}
    if (/%25[0-9a-fA-F]{2}/.test(raw)) {
      try {
        raw = decodeURIComponent(raw);
      } catch {}
    }
    const target = new URL(raw);
    if (!isAllowedGlbUrl(target)) {
      return new Response("Forbidden target", { status: 403 });
    }

    const upstream = await fetch(target.toString(), {
      // Forward range requests for better streaming
      headers: {
        Range: req.headers.get("range") || "",
        Accept: "model/gltf-binary,application/octet-stream,*/*",
      },
      cache: "no-store",
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new Response(`Upstream error: ${upstream.status}`, {
        status: 502,
      });
    }

    const headers = new Headers(upstream.headers);
    headers.set("Content-Type", "model/gltf-binary");
    headers.delete("content-disposition");
    headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
    // Allow range pass-through for large GLBs
    const status = upstream.status === 206 ? 206 : 200;
    return new Response(upstream.body, { status, headers });
  } catch (e: any) {
    return new Response(`Proxy error: ${e?.message || e}`, { status: 500 });
  }
}
