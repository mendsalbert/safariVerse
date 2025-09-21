import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function isAllowedAudioUrl(u: URL): boolean {
  if (u.protocol !== "https:") return false;
  const allowedExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".aac"];
  const hasAllowedExtension = allowedExtensions.some((ext) =>
    u.pathname.toLowerCase().endsWith(ext)
  );
  if (!hasAllowedExtension) return false;

  // Allow specific S3 bucket or any https host
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
    if (!isAllowedAudioUrl(target)) {
      return new Response("Forbidden target", { status: 403 });
    }

    const upstream = await fetch(target.toString(), {
      // Forward range requests for better streaming
      headers: {
        Range: req.headers.get("range") || "",
        Accept: "audio/mpeg,audio/wav,audio/ogg,audio/*,*/*",
        "User-Agent": "SafariVerse-RadioProxy/1.0",
      },
      cache: "no-store",
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new Response(`Upstream error: ${upstream.status}`, {
        status: 502,
      });
    }

    const headers = new Headers(upstream.headers);

    // Set appropriate content type based on file extension
    const url = new URL(raw);
    if (url.pathname.toLowerCase().endsWith(".mp3")) {
      headers.set("Content-Type", "audio/mpeg");
    } else if (url.pathname.toLowerCase().endsWith(".wav")) {
      headers.set("Content-Type", "audio/wav");
    } else if (url.pathname.toLowerCase().endsWith(".ogg")) {
      headers.set("Content-Type", "audio/ogg");
    } else {
      headers.set("Content-Type", "audio/mpeg"); // Default to mp3
    }

    // Remove potentially problematic headers
    headers.delete("content-disposition");

    // Set CORS headers to allow cross-origin requests
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Range, Accept, Content-Type");

    // Set caching headers
    headers.set("Cache-Control", "public, max-age=300, s-maxage=300");

    // Allow range pass-through for large audio files
    const status = upstream.status === 206 ? 206 : 200;

    return new Response(upstream.body, { status, headers });
  } catch (e: any) {
    console.error("Radio proxy error:", e);
    return new Response(`Proxy error: ${e?.message || e}`, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Accept, Content-Type",
    },
  });
}
