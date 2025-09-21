import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "safari";
  const page = Number(searchParams.get("page") || "1");
  const perPage = Math.min(Number(searchParams.get("per_page") || "20"), 30);

  // Use hardcoded Unsplash access key as fallback
  const accessKey =
    process.env.UNSPLASH_ACCESS_KEY || "your_unsplash_access_key_here";

  if (accessKey === "your_unsplash_access_key_here") {
    console.log("⚠️ Using fallback Unsplash key - images may be limited");
  }

  const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&orientation=landscape&content_filter=high&per_page=${perPage}&page=${page}`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
      // Edge-friendly
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ error: "Upstream error", detail: text }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const results = Array.isArray(data.results) ? data.results : [];
    const items = results.map((r: any) => ({
      id: r.id,
      // Hotlink directly to Unsplash-hosted image
      src: r.urls?.regular || r.urls?.full || r.urls?.small,
      alt: r.alt_description || r.description || "Unsplash image",
      width: r.width,
      height: r.height,
      // Attribution
      author: r.user?.name,
      authorUsername: r.user?.username,
      authorLink: r.user?.links?.html,
      photoLink: r.links?.html,
      // Required for triggering a download event
      downloadLocation: r.links?.download_location,
    }));

    return new Response(JSON.stringify({ items }), {
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
