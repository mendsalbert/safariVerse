"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Utensils,
  Languages,
  Landmark,
  Play,
  X,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";

const factsData: Record<
  string,
  {
    name: string;
    capital: string;
    foods: string[];
    languages: string[];
    spots: { name: string; img: string }[];
    blurb: string;
  }
> = {
  nigeria: {
    name: "Nigeria",
    capital: "Abuja",
    foods: ["Jollof Rice", "Suya", "Pounded Yam & Egusi"],
    languages: ["English", "Hausa", "Yoruba", "Igbo"],
    spots: [
      {
        name: "Zuma Rock",
        img: "/nigeria/zuma-rock.jpg",
      },
      {
        name: "Lekki-Ikoyi Bridge",
        img: "/nigeria/lekki-ikoyi.jpg",
      },
      {
        name: "Olumo Rock",
        img: "/nigeria/olumorock.jpg",
      },
    ],
    blurb:
      "Nigeria, the Giant of Africa, is renowned for its vibrant music, cinema, cuisine, and diverse cultures across 250+ ethnic groups.",
  },
  ethiopia: {
    name: "Ethiopia",
    capital: "Addis Ababa",
    foods: ["Doro Wat", "Injera", "Shiro"],
    languages: ["Amharic", "Oromo", "Tigrinya"],
    spots: [
      {
        name: "Lalibela",
        img: "https://images.unsplash.com/photo-1544966503-7cc4a7c22a7d?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Simien Mountains",
        img: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Axum",
        img: "https://images.unsplash.com/photo-1544966503-7cc4a7c22a7d?w=400&h=250&fit=crop&auto=format",
      },
    ],
    blurb:
      "Ethiopia is the cradle of humanity, home to ancient civilizations, unique wildlife, and the birthplace of coffee.",
  },
  egypt: {
    name: "Egypt",
    capital: "Cairo",
    foods: ["Koshary", "Ful Medames", "Ta'ameya"],
    languages: ["Arabic"],
    spots: [
      {
        name: "Pyramids of Giza",
        img: "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Luxor Temple",
        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Khan el-Khalili",
        img: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=250&fit=crop&auto=format",
      },
    ],
    blurb:
      "Egypt, the land of pharaohs and pyramids, is home to some of the world's most magnificent ancient monuments.",
  },
  "dr-congo": {
    name: "DR Congo",
    capital: "Kinshasa",
    foods: ["Moambe Chicken", "Fufu", "Liboke"],
    languages: ["French", "Lingala", "Swahili"],
    spots: [
      {
        name: "Virunga National Park",
        img: "https://images.unsplash.com/photo-1544966503-7cc4a7c22a7d?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Congo River",
        img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Mount Nyiragongo",
        img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format",
      },
    ],
    blurb:
      "The Democratic Republic of Congo is home to the world's second-largest rainforest and incredible biodiversity.",
  },
  tanzania: {
    name: "Tanzania",
    capital: "Dodoma",
    foods: ["Ugali", "Nyama Choma", "Mishkaki"],
    languages: ["Swahili", "English"],
    spots: [
      {
        name: "Serengeti National Park",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Mount Kilimanjaro",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Zanzibar",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
    ],
    blurb:
      "Tanzania offers the ultimate African safari experience with the Serengeti, Kilimanjaro, and pristine beaches of Zanzibar.",
  },
  "south-africa": {
    name: "South Africa",
    capital: "Pretoria",
    foods: ["Biltong", "Boerewors", "Bunny Chow"],
    languages: ["Zulu", "Xhosa", "Afrikaans", "English"],
    spots: [
      {
        name: "Table Mountain",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Kruger National Park",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Robben Island",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
    ],
    blurb:
      "South Africa, the Rainbow Nation, combines stunning landscapes, diverse wildlife, and a rich cultural heritage.",
  },
  kenya: {
    name: "Kenya",
    capital: "Nairobi",
    foods: ["Ugali", "Sukuma Wiki", "Nyama Choma"],
    languages: ["Swahili", "English"],
    spots: [
      {
        name: "Maasai Mara",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Lake Nakuru",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Mount Kenya",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
    ],
    blurb:
      "Kenya is the safari capital of the world, offering incredible wildlife viewing and stunning landscapes.",
  },
  uganda: {
    name: "Uganda",
    capital: "Kampala",
    foods: ["Matoke", "Luwombo", "Rolex"],
    languages: ["English", "Luganda", "Swahili"],
    spots: [
      {
        name: "Bwindi Impenetrable Forest",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Murchison Falls",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Lake Victoria",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
    ],
    blurb:
      "Uganda, the Pearl of Africa, is home to mountain gorillas and the source of the mighty Nile River.",
  },
  algeria: {
    name: "Algeria",
    capital: "Algiers",
    foods: ["Couscous", "Chakchouka", "Mhadjeb"],
    languages: ["Arabic", "Berber", "French"],
    spots: [
      {
        name: "Kasbah of Algiers",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Tassili n'Ajjer",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Roman Ruins of Timgad",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
    ],
    blurb:
      "Algeria is the largest country in Africa, featuring ancient Roman ruins, Saharan landscapes, and rich Berber culture.",
  },
  sudan: {
    name: "Sudan",
    capital: "Khartoum",
    foods: ["Gourrassa", "Kissra", "Ful Medames"],
    languages: ["Arabic", "English"],
    spots: [
      {
        name: "Pyramids of Meroë",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Sanganeb Marine National Park",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Dinder National Park",
        img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=250&fit=crop&auto=format",
      },
    ],
    blurb:
      "Sudan is home to more pyramids than Egypt, along with diverse wildlife and ancient Nubian culture.",
  },
  ghana: {
    name: "Ghana",
    capital: "Accra",
    foods: ["Jollof Rice", "Waakye", "Kelewele"],
    languages: ["English", "Akan", "Ewe", "Ga"],
    spots: [
      {
        name: "Cape Coast Castle",
        img: "https://images.unsplash.com/photo-1594624541633-9e90d670da31?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Kakum National Park",
        img: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=250&fit=crop&auto=format",
      },
      {
        name: "Kwame Nkrumah Mausoleum",
        img: "https://images.unsplash.com/photo-1558980394-0b3e26c72045?w=400&h=250&fit=crop&auto=format",
      },
    ],
    blurb:
      "Ghana, the Land of Gold, is known for its warm hospitality, rich history, and vibrant music and arts scene.",
  },
};

export default function CountryPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = params.countryId as string;
  const facts = factsData[countryId] ?? factsData["nigeria"];
  const [selectedImage, setSelectedImage] = useState<{
    name: string;
    img: string;
  } | null>(null);

  // --- Country Quiz (3 quick questions auto-generated from factsData) ---
  type Question = {
    id: string;
    prompt: string;
    options: string[];
    answer: string;
  };

  const allCountries = useMemo(() => Object.values(factsData), []);
  const shuffle = (arr: string[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const sampleDistinct = (pool: string[], exclude: Set<string>, n: number) => {
    const choices: string[] = [];
    const filtered = pool.filter((x) => !exclude.has(x));
    while (choices.length < n && filtered.length) {
      const idx = Math.floor(Math.random() * filtered.length);
      const pick = filtered.splice(idx, 1)[0];
      if (!choices.includes(pick)) choices.push(pick);
    }
    return choices;
  };

  const quizQuestions = useMemo<Question[]>(() => {
    const others = allCountries.filter((c) => c.name !== facts.name);
    const capitalsPool = others.map((c) => c.capital);
    const foodsPool = others.flatMap((c) => c.foods);
    const languagesPool = others.flatMap((c) => c.languages);

    const q1Answer = facts.capital;
    const q1Options = shuffle([
      q1Answer,
      ...sampleDistinct(capitalsPool, new Set([q1Answer]), 3),
    ]);

    const q2Answer = facts.foods[0];
    const q2Options = shuffle([
      q2Answer,
      ...sampleDistinct(foodsPool, new Set([q2Answer]), 3),
    ]);

    const q3Answer = facts.languages[0];
    const q3Options = shuffle([
      q3Answer,
      ...sampleDistinct(languagesPool, new Set([q3Answer]), 3),
    ]);

    return [
      {
        id: "capital",
        prompt: `What is the capital of ${facts.name}?`,
        options: q1Options,
        answer: q1Answer,
      },
      {
        id: "food",
        prompt: `Which of these is a popular food in ${facts.name}?`,
        options: q2Options,
        answer: q2Answer,
      },
      {
        id: "lang",
        prompt: `Which language is spoken in ${facts.name}?`,
        options: q3Options,
        answer: q3Answer,
      },
    ];
  }, [allCountries, facts]);

  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const currentQ = quizQuestions[qIndex];

  const submitAnswer = () => {
    if (!picked) return;
    if (picked === currentQ.answer) setScore((s) => s + 1);
    if (qIndex + 1 < quizQuestions.length) {
      setQIndex((i) => i + 1);
      setPicked(null);
    } else {
      setDone(true);
    }
  };

  const restartQuiz = () => {
    setQIndex(0);
    setScore(0);
    setPicked(null);
    setDone(false);
  };

  // --- Landmark Memory Match Mini-Game (emoji-based) ---
  type EmojiCard = {
    id: string;
    keyId: string;
    emoji: string;
    matched: boolean;
    flipped: boolean;
  };
  const seedPairs = useMemo(() => {
    const emojiPool: { keyId: string; emoji: string }[] = [
      { keyId: "lion", emoji: "🦁" },
      { keyId: "elephant", emoji: "🐘" },
      { keyId: "zebra", emoji: "🦓" },
      { keyId: "giraffe", emoji: "🦒" },
      { keyId: "rhino", emoji: "🦏" },
      { keyId: "baobab", emoji: "🌳" },
      { keyId: "desert", emoji: "🏜️" },
      { keyId: "pyramid", emoji: "🗿" },
      { keyId: "scroll", emoji: "📜" },
      { keyId: "drum", emoji: "🥁" },
      { keyId: "leopard", emoji: "🐆" },
      { keyId: "croc", emoji: "🐊" },
      { keyId: "camel", emoji: "🐪" },
      { keyId: "eagle", emoji: "🦅" },
      { keyId: "map", emoji: "🗺️" },
      { keyId: "hut", emoji: "🛖" },
      { keyId: "tent", emoji: "⛺" },
      { keyId: "mask", emoji: "🎭" },
      { keyId: "earth", emoji: "🌍" },
      { keyId: "palmtree", emoji: "🌴" },
      { keyId: "mountain", emoji: "🏞️" },
      { keyId: "camp", emoji: "🏕️" },
      { keyId: "compass", emoji: "🧭" },
      { keyId: "drum2", emoji: "🪘" },
      { keyId: "basket", emoji: "🧺" },
      { keyId: "monkey", emoji: "🐒" },
      { keyId: "parrot", emoji: "🦜" },
      { keyId: "feather", emoji: "🪶" },
      { keyId: "sun", emoji: "🔆" },
      { keyId: "snake", emoji: "🐍" },
      { keyId: "turtle", emoji: "🐢" },
    ];
    const pickCount = 12; // 12 pairs = 24 tiles
    const pool = [...emojiPool];
    const chosen: { keyId: string; emoji: string }[] = [];
    for (let i = 0; i < pickCount && pool.length; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      chosen.push(pool.splice(idx, 1)[0]);
    }
    const pairs = chosen.flatMap((it, i) => [
      { id: `${i}-a`, keyId: it.keyId, emoji: it.emoji },
      { id: `${i}-b`, keyId: it.keyId, emoji: it.emoji },
    ]);
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    return pairs;
  }, []);

  const [cards, setCards] = useState<EmojiCard[]>(
    seedPairs.map((c) => ({ ...c, matched: false, flipped: false }))
  );
  const [firstPick, setFirstPick] = useState<number | null>(null);
  const [secondPick, setSecondPick] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  useMemo(() => {
    // restart timer when country changes
    setSeconds(0);
    setRunning(true);
    setMoves(0);
  }, [countryId]);

  // simple timer
  useMemo(() => {
    const t = setInterval(() => {
      setSeconds((s) => (running ? s + 1 : s));
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const allMatched = cards.every((c) => c.matched);
  useMemo(() => {
    if (allMatched) setRunning(false);
  }, [allMatched]);

  const flipCard = (idx: number) => {
    if (allMatched) return;
    if (firstPick !== null && secondPick !== null) return;
    if (cards[idx].flipped || cards[idx].matched) return;
    setCards((cs) =>
      cs.map((c, i) => (i === idx ? { ...c, flipped: true } : c))
    );
    if (firstPick === null) {
      setFirstPick(idx);
    } else if (secondPick === null) {
      setSecondPick(idx);
      setMoves((m) => m + 1);
      const a = cards[firstPick];
      const b = cards[idx];
      const isMatch = a.keyId === b.keyId;
      setTimeout(() => {
        if (isMatch) {
          setCards((cs) =>
            cs.map((c, i) =>
              i === firstPick || i === idx ? { ...c, matched: true } : c
            )
          );
        } else {
          setCards((cs) =>
            cs.map((c, i) =>
              i === firstPick || i === idx ? { ...c, flipped: false } : c
            )
          );
        }
        setFirstPick(null);
        setSecondPick(null);
      }, 650);
    }
  };

  const resetMemory = () => {
    const randomized = [...seedPairs];
    for (let i = randomized.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomized[i], randomized[j]] = [randomized[j], randomized[i]];
    }
    setCards(randomized.map((c) => ({ ...c, matched: false, flipped: false })));
    setFirstPick(null);
    setSecondPick(null);
    setMoves(0);
    setSeconds(0);
    setRunning(true);
  };

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-b from-orange-900 via-red-800 to-amber-900">
      {/* SafariVerse Brand Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-lg border-b border-amber-500/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> SafariVerse
          </button>
          <h1 className="font-display text-3xl bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent">
            {facts.name}
          </h1>
          <div />
        </div>
      </div>

      <div className="pt-20 pb-10 max-w-6xl mx-auto px-4 space-y-8">
        {/* Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-black/40 border border-amber-500/30 rounded-2xl p-6 text-orange-100">
            <h2 className="font-semibold text-xl mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-300" /> Capital City
            </h2>
            <p className="text-2xl font-bold text-yellow-200">
              {facts.capital}
            </p>
            <p className="mt-3 text-sm text-orange-200">{facts.blurb}</p>
            <button
              onClick={() => router.push(`/safarimart/${countryId}`)}
              className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              <ShoppingCart className="w-4 h-4" /> SafariMart
            </button>
          </div>
          <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-6 text-orange-100">
            <h2 className="font-semibold text-xl mb-3 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-300" /> Popular Foods
            </h2>
            <ul className="space-y-2">
              {facts.foods.map((f) => (
                <li
                  key={f}
                  className="bg-orange-900/40 border border-amber-400/30 rounded-lg px-3 py-2 text-yellow-100"
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Languages & Spots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-6 text-orange-100">
            <h2 className="font-semibold text-xl mb-3 flex items-center gap-2">
              <Languages className="w-5 h-5 text-amber-300" /> Languages
            </h2>
            <div className="flex flex-wrap gap-2">
              {facts.languages.map((l) => (
                <span
                  key={l}
                  className="px-3 py-1 rounded-lg border border-yellow-400/30 bg-orange-900/40 text-yellow-100 text-sm"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {facts.spots.map((s) => (
              <div
                key={s.name}
                className="relative h-40 rounded-xl overflow-hidden border border-amber-500/30 cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => setSelectedImage(s)}
              >
                <Image src={s.img} alt={s.name} fill className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-yellow-100 text-sm flex items-center gap-2">
                    <Landmark className="w-4 h-4" /> {s.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Landmark Memory Match Mini-Game */}
      <div className="pt-2 pb-10 max-w-6xl mx-auto px-4">
        <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-6 text-orange-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-xl">Landmark Memory Match</h2>
            <div className="text-sm text-yellow-200 flex items-center gap-4">
              <span>Time: {seconds}s</span>
              <span>Moves: {moves}</span>
              <button
                onClick={resetMemory}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-colors"
              >
                Restart
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 gap-3">
            {cards.map((c, i) => (
              <button
                key={c.id + i}
                onClick={() => flipCard(i)}
                className="group relative h-24 sm:h-24 md:h-24 rounded-xl overflow-hidden border border-amber-500/30 bg-black/40 hover:bg-black/60 transition-transform duration-200 ease-out hover:scale-[1.03] shadow-sm hover:shadow-lg"
                aria-label="Flip card"
              >
                {/* Flip wrapper */}
                <div
                  className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    transform:
                      c.flipped || c.matched
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                    willChange: "transform",
                  }}
                >
                  {/* Back face */}
                  <div
                    className="absolute inset-0 flex items-center justify-center text-yellow-100/80 text-sm"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    Click
                  </div>
                  {/* Front face */}
                  <div
                    className="absolute inset-0 flex items-center justify-center text-4xl"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {c.emoji}
                  </div>
                </div>
                {/* Match glow */}
                {c.matched && (
                  <div className="absolute inset-0 ring-2 ring-amber-400/70 rounded-xl pointer-events-none animate-pulse" />
                )}
              </button>
            ))}
          </div>
          {allMatched && (
            <div className="mt-4 text-center text-yellow-100 space-y-3">
              <div>
                🎉 You matched all landmarks in {moves} moves and {seconds}s!
              </div>
              <button
                onClick={() => {
                  try {
                    const bal = Number(
                      localStorage.getItem("svtBalance") || "0"
                    );
                    const newBal = bal + 20;
                    localStorage.setItem("svtBalance", String(newBal));
                    const key = "svtBadges";
                    const arr = JSON.parse(localStorage.getItem(key) || "[]");
                    const badge = `Landmark Master: ${facts.name}`;
                    if (!arr.includes(badge)) {
                      arr.push(badge);
                      localStorage.setItem(key, JSON.stringify(arr));
                    }
                    alert("+20 SVT awarded and badge unlocked!");
                  } catch {}
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-colors"
              >
                Claim 20 SVT + Badge
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Country Quiz */}
      <div className="pt-4 pb-10 max-w-6xl mx-auto px-4">
        <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-6 text-orange-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-xl flex items-center gap-2">
              Country Quiz: {facts.name}
            </h2>
            <span className="text-yellow-200 text-sm">
              Score: {score}/{quizQuestions.length}
            </span>
          </div>

          {!done ? (
            <div>
              <p className="mb-4 text-yellow-100">{currentQ.prompt}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt) => {
                  const isSelected = picked === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setPicked(opt)}
                      className={
                        "text-left px-4 py-3 rounded-lg border transition-colors " +
                        (isSelected
                          ? "bg-amber-500/20 border-amber-400/60"
                          : "bg-black/40 border-amber-500/30 hover:bg-black/60")
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-yellow-200/80">
                  Question {qIndex + 1} of {quizQuestions.length}
                </span>
                <button
                  onClick={submitAnswer}
                  disabled={!picked}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-colors"
                >
                  {qIndex + 1 < quizQuestions.length ? "Next" : "Finish"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-lg text-yellow-100">
                Great job! You scored {score} out of {quizQuestions.length}.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={restartQuiz}
                  className="bg-black/40 border border-amber-500/30 text-yellow-100 px-4 py-2 rounded-lg font-medium hover:bg-black/60 transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={() => {
                    if (score <= 0)
                      return alert("Answer at least one correctly to claim.");
                    try {
                      const bal = Number(
                        localStorage.getItem("svtBalance") || "0"
                      );
                      const reward = score >= quizQuestions.length ? 30 : 10;
                      const newBal = bal + reward;
                      localStorage.setItem("svtBalance", String(newBal));
                      const key = "svtBadges";
                      const arr = JSON.parse(localStorage.getItem(key) || "[]");
                      const badge =
                        score >= quizQuestions.length
                          ? `Cultural Scholar: ${facts.name}`
                          : `Quiz Explorer: ${facts.name}`;
                      if (!arr.includes(badge)) {
                        arr.push(badge);
                        localStorage.setItem(key, JSON.stringify(arr));
                      }
                      alert(
                        `+${reward} SVT awarded${
                          score >= quizQuestions.length
                            ? " and Scholar badge!"
                            : "!"
                        }`
                      );
                    } catch {}
                  }}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-colors"
                >
                  Claim SVT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-amber-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={selectedImage.img}
                alt={selectedImage.name}
                fill
                className="object-contain rounded-xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-xl">
                <h3 className="text-white text-xl font-bold flex items-center gap-2">
                  <Landmark className="w-5 h-5" />
                  {selectedImage.name}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
