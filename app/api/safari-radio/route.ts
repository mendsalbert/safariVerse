import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Load the chunks manifest
function loadManifest() {
  try {
    const manifestPath = path.join(
      process.cwd(),
      "public/radio/chunks/manifest.json"
    );
    const manifestData = fs.readFileSync(manifestPath, "utf-8");
    return JSON.parse(manifestData);
  } catch (error) {
    console.error("Failed to load radio manifest:", error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag") || "safari";
    const country = searchParams.get("country") || "";
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);

    const manifest = loadManifest();

    if (!manifest || !manifest.chunks) {
      return NextResponse.json({
        stations: [],
        total: 0,
        source: "safari-radio",
        error: "Safari radio manifest not found",
      });
    }

    // Convert chunks to radio station format
    const stations = manifest.chunks.map((chunk: any, index: number) => ({
      id: chunk.id,
      name: chunk.name,
      url: chunk.url,
      urlResolved: chunk.url,
      country: "Safari Africa",
      countryCode: "SA",
      tags: ["safari", "african", "music", "radio"],
      favicon: "/safari-bg/safari.png",
      bitrate: 128,
      language: ["English", "Swahili", "French"],
      lastCheckOk: true,
      clickCount: 1000 - index * 10, // Decreasing popularity
      source: "safari-radio",
      // Virtual chunk specific data
      startTime: chunk.startTime,
      endTime: chunk.endTime,
      duration: chunk.duration,
      virtual: chunk.virtual || false,
      chunkIndex: index,
    }));

    // Apply filters
    let filteredStations = stations;

    if (country && country.toLowerCase() !== "safari africa") {
      // If specific country requested, return empty (our safari radio is global)
      filteredStations = [];
    }

    // Limit results
    filteredStations = filteredStations.slice(0, limit);

    return NextResponse.json({
      stations: filteredStations,
      total: filteredStations.length,
      source: "safari-radio",
      manifest: {
        title: manifest.title,
        totalDuration: manifest.totalDuration,
        totalChunks: manifest.totalChunks,
        virtual: manifest.virtual,
      },
      message: "Safari Radio chunks from local audio file",
    });
  } catch (error) {
    console.error("Safari Radio API error:", error);

    return NextResponse.json({
      stations: [],
      total: 0,
      source: "safari-radio",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
