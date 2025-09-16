import { NextRequest, NextResponse } from "next/server";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    const {
      messages,
    }: { messages: { role: "user" | "assistant"; text: string }[] } =
      await req.json();
    const systemPreamble =
      "You are SafariVerse Guide, an expert storyteller of African history and culture. Be concise (2-4 sentences), accurate, and celebratory. Cite notable examples when helpful.";

    // Convert chat messages to Gemini's contents format
    const contents = [
      { role: "user", parts: [{ text: systemPreamble }] },
      ...messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    ];

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "Gemini error", detail: errText },
        { status: 500 }
      );
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn't find that.";
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", detail: e?.message },
      { status: 500 }
    );
  }
}
