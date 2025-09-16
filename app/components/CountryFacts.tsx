"use client";

import Image from "next/image";
import { useState } from "react";
import {
  MapPin,
  Utensils,
  Languages,
  Landmark,
  ArrowLeft,
  Play,
  X,
} from "lucide-react";

interface CountryFactsProps {
  countryId: string;
  onBack: () => void;
}

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
};

export default function CountryFacts({ countryId, onBack }: CountryFactsProps) {
  const facts = factsData[countryId] ?? factsData["nigeria"];
  const [selectedImage, setSelectedImage] = useState<{
    name: string;
    img: string;
  } | null>(null);

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-orange-900 via-red-800 to-amber-900 overflow-y-auto">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-lg border-b border-amber-500/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-orange-100 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Globe
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
            <button className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600">
              <Play className="w-4 h-4" /> Play Game
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
