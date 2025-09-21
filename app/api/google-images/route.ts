import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "food";
  const num = Math.min(Number(searchParams.get("num") || "3"), 10);

  // Hardcoded Google API credentials
  const apiKey = "AIzaSyC6zWRnQPaQHmfx1a22YzuojIti04uuVTw";
  const searchEngineId = "400b9d65c299b48ef";

  console.log("🔑 Using hardcoded Google API credentials");
  console.log("API Key:", apiKey.substring(0, 10) + "...");
  console.log("Search Engine ID:", searchEngineId);

  const endpoint = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(
    query
  )}&searchType=image&num=${num}&safe=medium&imgSize=large&imgType=photo&fileType=jpg`;

  console.log("🔍 Google Images API: Searching for:", query);
  console.log("📊 Requesting", num, "images");

  try {
    const res = await fetch(endpoint, {
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ error: "Google API error", detail: text }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const results = Array.isArray(data.items) ? data.items : [];

    console.log(
      "✅ Google Images API: Found",
      results.length,
      "images for query:",
      query
    );

    const items = results.map((item: any) => ({
      id: item.link,
      src: item.link,
      alt: item.title || "Google image",
      width: item.image?.width || 400,
      height: item.image?.height || 300,
      // Google doesn't provide author info like Unsplash
      author: "Google Images",
      authorUsername: "google",
      authorLink: item.image?.contextLink || "",
      photoLink: item.link,
      thumbnail: item.image?.thumbnailLink || item.link,
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
