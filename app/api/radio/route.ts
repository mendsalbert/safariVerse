import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Fallback radio stations for when the API fails - using verified working streams
const FALLBACK_STATIONS = [
  {
    id: "fallback-1",
    name: "BBC Radio 1",
    url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
    urlResolved: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
    country: "United Kingdom",
    countryCode: "GB",
    tags: ["pop", "music", "radio"],
    favicon: "",
    bitrate: 128,
    language: ["English"],
    lastCheckOk: true,
    clickCount: 1000,
  },
  {
    id: "fallback-2",
    name: "Radio France Inter",
    url: "https://icecast.radiofrance.fr/franceinter-midfi.mp3",
    urlResolved: "https://icecast.radiofrance.fr/franceinter-midfi.mp3",
    country: "France",
    countryCode: "FR",
    tags: ["french", "music", "talk"],
    favicon: "",
    bitrate: 128,
    language: ["French"],
    lastCheckOk: true,
    clickCount: 800,
  },
  {
    id: "fallback-3",
    name: "Radio Swiss Jazz",
    url: "https://stream.srg-ssr.ch/rsj/mp3_128.m3u",
    urlResolved: "https://stream.srg-ssr.ch/rsj/mp3_128.m3u",
    country: "Switzerland",
    countryCode: "CH",
    tags: ["jazz", "music", "instrumental"],
    favicon: "",
    bitrate: 128,
    language: ["English", "German", "French"],
    lastCheckOk: true,
    clickCount: 1200,
  },
  {
    id: "fallback-4",
    name: "Radio Caprice - African",
    url: "http://79.120.39.136:8000/african",
    urlResolved: "http://79.120.39.136:8000/african",
    country: "Global",
    countryCode: "WW",
    tags: ["african", "world", "music"],
    favicon: "",
    bitrate: 128,
    language: ["Various"],
    lastCheckOk: true,
    clickCount: 500,
  },
  {
    id: "fallback-5",
    name: "SomaFM - Groove Salad",
    url: "https://ice1.somafm.com/groovesalad-256-mp3",
    urlResolved: "https://ice1.somafm.com/groovesalad-256-mp3",
    country: "United States",
    countryCode: "US",
    tags: ["ambient", "electronic", "chill"],
    favicon: "",
    bitrate: 256,
    language: ["English"],
    lastCheckOk: true,
    clickCount: 1500,
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag") || "safari";
    const country = searchParams.get("country") || "";
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);

    let results: any[] = [];
    let lastError: string | null = null;
    let source = "safari-radio";

    // Only use Safari Radio chunks (local audio file)
    try {
      const safariParams = new URLSearchParams({
        tag,
        ...(country && { country }),
        limit: limit.toString(),
      });

      const safariResponse = await fetch(
        `${req.nextUrl.origin}/api/safari-radio?${safariParams}`,
        {
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      if (safariResponse.ok) {
        const safariData = await safariResponse.json();
        if (safariData.stations && safariData.stations.length > 0) {
          results = safariData.stations;
          source = "safari-radio";
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    // If Safari Radio chunks fail, use the original file as fallback
    if (results.length === 0) {
      results = [
        {
          id: "safari-original",
          name: "Safari Radio - Full Track",
          url: "/radio/radio.mp3",
          urlResolved: "/radio/radio.mp3",
          country: "Safari Africa",
          countryCode: "SA",
          tags: ["safari", "african", "music", "radio"],
          favicon: "/safari-bg/safari.png",
          bitrate: 128,
          language: ["English", "Swahili", "French"],
          lastCheckOk: true,
          clickCount: 10000,
          source: "safari-radio",
          startTime: 0,
          endTime: 3000, // 50 minutes
          duration: 3000,
          virtual: false,
          chunkIndex: 0,
        },
      ];
      source = "safari-radio";
    }

    // Map and filter the results
    const mapped = results.map((station: any) => ({
      id: station.stationuuid || station.id || crypto.randomUUID(),
      name: station.name || "Unknown Station",
      url: station.url || "",
      urlResolved:
        station.url_resolved || station.urlResolved || station.url || "",
      country: station.country || "Unknown",
      countryCode: station.countrycode || station.countryCode || "",
      tags: Array.isArray(station.tags)
        ? station.tags
        : (station.tags || "")
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean),
      favicon: station.favicon || "",
      bitrate: station.bitrate || 0,
      language: Array.isArray(station.language)
        ? station.language
        : (station.language || "")
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean),
      lastCheckOk: Boolean(station.lastcheckok ?? station.lastCheckOk ?? true),
      clickCount: station.clickcount || station.clickCount || 0,
    }));

    // Filter out stations without valid URLs
    const filtered = mapped.filter(
      (s) => s.urlResolved && s.urlResolved.startsWith("http")
    );

    return NextResponse.json({
      stations: filtered,
      total: filtered.length,
      source: source,
      fallback: results === FALLBACK_STATIONS,
      error: lastError,
    });
  } catch (error) {
    // Return fallback stations on complete failure
    return NextResponse.json({
      stations: FALLBACK_STATIONS,
      total: FALLBACK_STATIONS.length,
      fallback: true,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
