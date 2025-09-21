"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, BookOpen, Globe2, X, MessageCircle } from "lucide-react";

type Story = { title: string; img: string; blurb: string };

const FEATURED_STORIES: Story[] = [
  {
    title: "Nile Civilizations",
    img: "/history/ancient-egypt-scene-mythology-egyptian-600nw-788658802.webp",
    blurb:
      "Along the Nile, knowledge in engineering, astronomy, and governance flourished, shaping world heritage for millennia.",
  },
  {
    title: "Timbuktu Manuscripts",
    img: "/history/2_Manuscrit_parchemin_3_det-1024x691.png",
    blurb:
      "Libraries in Timbuktu preserved science, law, and poetry — a beacon of scholarship across the Sahara.",
  },
  {
    title: "Great Zimbabwe",
    img: "/history/Conical_Tower_-_Great_Enclosure_III_(33736918448).jpg",
    blurb:
      "Stone cities rose through trade and craftsmanship, linking inland cultures to the Indian Ocean world.",
  },
  {
    title: "Swahili Coast",
    img: "/history/18Swahili-Coast.webp",
    blurb:
      "Maritime towns thrived on trade and language exchange, where Africa met Arabia and Asia.",
  },
];

const TIMELINE: Story[] = [
  {
    title: "Iron Age Innovation",
    img: "/history/Iron Age Innovation.avif",
    blurb:
      "Early mastery of iron transformed tools, agriculture, and city-building across the continent.",
  },
  {
    title: "Trans‑Saharan Routes",
    img: "/history/Trans‑Saharan Routes .png",
    blurb:
      "Caravans exchanged gold, salt, and ideas — forging cultural connections across vast deserts.",
  },
  {
    title: "Scholarly Cities",
    img: "/history/Scholarly Cities .jpg",
    blurb:
      "Universities and courts fostered jurisprudence, medicine, mathematics, and literature.",
  },
  {
    title: "Diaspora Renaissance",
    img: "/history/Diaspora Renaissance .jpg",
    blurb:
      "Music, art, and tech movements echo across continents, renewing ties to ancestral heritage.",
  },
];

export default function SocialPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Story | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: "Hi! Ask me about African history, cultures, empires, or notable figures.",
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const sendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    if (isThinking) return;
    setChatMessages((m) => [...m, { role: "user", text: trimmed }]);
    setChatInput("");
    setIsThinking(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, { role: "user", text: trimmed }],
        }),
      });
      const data = await res.json();
      const answer = data?.text ?? "Sorry, I couldn't find that.";
      setChatMessages((m) => [...m, { role: "assistant", text: answer }]);
    } catch {
      setChatMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Connection issue. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };
  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-gradient-to-b from-orange-900 via-red-800 to-amber-900">
      <div className="absolute top-0 left-0 right-0 z-30 bg-black/40 backdrop-blur-lg border-b border-amber-500/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> SafariVerse
          </button>
          <h1 className="font-display text-3xl bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent">
            African History Hub
          </h1>
          <div />
        </div>
      </div>

      <div className="relative z-0 flex items-start justify-center p-6 pt-20">
        <div className="bg-black/60 backdrop-blur-lg p-6 rounded-2xl border border-amber-500/30 text-orange-100 max-w-6xl w-full">
          <div className="flex items-center gap-3 mb-4 text-yellow-100">
            <Globe2 className="w-5 h-5" />
            <span className="font-semibold">Across Time and Continent</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            A Journey Through Africa's Past
          </h2>
          <p className="opacity-90 mb-6">
            From ancient civilizations along the Nile and the Niger, to the
            scholarly cities of Timbuktu and powerful empires like Mali,
            Songhai, and Great Zimbabwe, Africa's history is rich, diverse, and
            foundational to the world. Explore these stories through images —
            click to learn more.
          </p>

          {/* Featured Stories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {FEATURED_STORIES.map((s) => (
              <div
                key={s.title}
                className="relative h-48 rounded-xl overflow-hidden border border-amber-500/30 cursor-pointer group"
                onClick={() => setSelected(s)}
              >
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-yellow-100 text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-300" /> {s.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline – Horizontal Scroll */}
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" /> Threads Through Time
          </h3>
          <div className="relative -mx-4 px-4">
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
              {TIMELINE.map((t) => (
                <div
                  key={t.title}
                  className="min-w-[260px] snap-start bg-black/50 border border-amber-500/20 rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setSelected(t)}
                >
                  <div className="relative h-36">
                    <Image
                      src={t.img}
                      alt={t.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-yellow-100 text-sm font-semibold mb-1">
                      {t.title}
                    </div>
                    <p className="text-xs text-yellow-100/90 line-clamp-2">
                      {t.blurb}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="bg-black/50 border border-amber-500/20 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-300" /> Ancient
                Civilizations
              </h3>
              <p className="text-sm text-yellow-100/90">
                Egypt and Nubia pioneered monumental architecture, mathematics,
                and astronomy. Farther west, the Nok culture mastered
                ironworking, while Aksum in the Horn rose as a powerful trading
                kingdom linking Africa and Asia.
              </p>
            </section>
            <section className="bg-black/50 border border-amber-500/20 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-300" /> Empires and
                Trade
              </h3>
              <p className="text-sm text-yellow-100/90">
                Trans-Saharan caravans carried gold, salt, and ideas across vast
                distances. Empires like Ghana, Mali, and Songhai fostered
                centers of knowledge, with Timbuktu renowned for scholarship and
                manuscripts.
              </p>
            </section>
            <section className="bg-black/50 border border-amber-500/20 rounded-xl p-4 md:col-span-2">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-300" /> Heritage and
                Modern Renaissance
              </h3>
              <p className="text-sm text-yellow-100/90">
                From art and music to science and tech, contemporary Africa
                reimagines tradition and propels innovation. The diaspora
                continues to shape global culture while reconnecting with
                ancestral roots.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Modal Viewer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-12 right-0 text-white hover:text-amber-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-black/70 border border-amber-500/30 rounded-2xl overflow-hidden">
              <div className="relative h-[55vh] min-h-[320px]">
                <Image
                  src={selected.img}
                  alt={selected.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 text-orange-100">
                <h4 className="text-xl font-semibold text-yellow-100 mb-1">
                  {selected.title}
                </h4>
                <p className="text-sm opacity-90">{selected.blurb}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 rounded-full p-4 shadow-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-colors"
        aria-label="Open history chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Dialog */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[90vw] max-w-sm bg-black/70 border border-amber-500/30 rounded-2xl overflow-hidden backdrop-blur-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/20">
            <div className="text-yellow-100 font-semibold">Ask SafariVerse</div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-yellow-100/80 hover:text-yellow-100"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto p-3 space-y-2">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={
                  m.role === "assistant"
                    ? "bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-yellow-100"
                    : "bg-amber-500/20 border border-amber-400/30 rounded-lg px-3 py-2 text-sm text-yellow-100 self-end"
                }
              >
                {m.text}
              </div>
            ))}
            {isThinking && (
              <div className="bg-black/50 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-yellow-100 inline-flex items-center gap-2">
                <span className="relative inline-flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Thinking…
              </div>
            )}
          </div>
          <div className="p-3 border-t border-amber-500/20 flex items-center gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isThinking) sendChat();
              }}
              placeholder="Ask about history, culture, people..."
              className="flex-1 bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-sm text-yellow-100 placeholder:text-yellow-100/60 outline-none focus:border-amber-400/50"
              disabled={isThinking}
            />
            <button
              onClick={sendChat}
              disabled={isThinking}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isThinking ? "Thinking…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
