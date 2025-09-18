import { NextRequest } from "next/server";

// Proxy to trigger Unsplash download endpoint to comply with API guidelines
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const downloadLocation = body?.downloadLocation as string | undefined;
    if (!downloadLocation) {
      return new Response(
        JSON.stringify({ error: "Missing downloadLocation" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      return new Response(
        JSON.stringify({ error: "Missing UNSPLASH_ACCESS_KEY env var" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Trigger Unsplash download event
    const res = await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ error: "Upstream error", detail: text }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Request failed",
        message: String(err?.message || err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
