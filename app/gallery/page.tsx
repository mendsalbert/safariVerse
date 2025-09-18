"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, X } from "lucide-react";

// Static list of images from public/gallery. If you add more files there, include them here.
const galleryImages = [
  { src: "/gallery/kilimanjaro.png", alt: "Mount Kilimanjaro" },
  { src: "/gallery/pexels-pixabay-247376.jpg", alt: "Savanna Landscape" },
  { src: "/gallery/pexels-pixabay-34098.jpg", alt: "Elephant Herd" },
  {
    src: "/gallery/pexels-hendrikcornelissen-2862070.jpg",
    alt: "Table Mountain Cape Town",
  },
  {
    src: "/gallery/pexels-git-stephen-gitau-302905-1670732.jpg",
    alt: "Kenyan Landscape",
  },
  {
    src: "/gallery/pexels-frans-van-heerden-201846-631317.jpg",
    alt: "Namib Desert Dunes",
  },
  {
    src: "/gallery/pexels-tomas-malik-793526-1703312.jpg",
    alt: "Safari Sunset",
  },
  { src: "/gallery/pexels-basbrandwijk-885013.jpg", alt: "Victoria Falls" },
  { src: "/gallery/pexels-pixabay-39245.jpg", alt: "Giraffe in the Wild" },
  { src: "/gallery/pexels-pixabay-38280.jpg", alt: "Lion Resting" },
  { src: "/gallery/pexels-followalice-667201.jpg", alt: "Maasai Mara Balloon" },
  { src: "/gallery/pexels-yigithan02-773000.jpg", alt: "Desert Caravan" },
  {
    src: "/gallery/pexels-magda-ehlers-pexels-391230.jpg",
    alt: "Oryx in Desert",
  },
];

// Create a repeatable pattern for a bento layout using CSS grid row/col spans
function useBentoPattern(length: number) {
  return useMemo(() => {
    const pattern = [
      "col-span-2 row-span-2", // big
      "col-span-1 row-span-1",
      "col-span-1 row-span-2",
      "col-span-2 row-span-1",
      "col-span-1 row-span-1",
      "col-span-1 row-span-1",
    ];
    return Array.from(
      { length },
      (_, index) => pattern[index % pattern.length]
    );
  }, [length]);
}

type GalleryItem = {
  src: string;
  alt: string;
  id?: string;
  author?: string;
  authorUsername?: string;
  authorLink?: string;
  photoLink?: string;
  downloadLocation?: string;
};

export default function GalleryPage() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([...galleryImages]);
  const spans = useBentoPattern(items.length);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Fetch Unsplash images via proxy
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (isLoading || !hasMore) return;
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/unsplash?q=safari&page=${page}&per_page=24`,
          {
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const newItems: GalleryItem[] = (data?.items || [])
          .filter((it: any) => it?.src)
          .map((it: any) => ({
            src: it.src,
            alt: it.alt || "Unsplash image",
            id: it.id,
            // carry attribution and download metadata through item for UI and compliance
            author: it.author,
            authorUsername: it.authorUsername,
            authorLink: it.authorLink,
            photoLink: it.photoLink,
            downloadLocation: it.downloadLocation,
          }));
        if (!cancelled) {
          setItems((prev) => {
            const seen = new Set(prev.map((p) => p.id || p.src));
            const dedup = newItems.filter((n) => !seen.has(n.id || n.src));
            return [...prev, ...dedup];
          });
          setHasMore(newItems.length > 0);
        }
      } catch {
        if (!cancelled) setHasMore(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  // Infinite scroll intersection observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoading && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoading, hasMore]);

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-b from-orange-900 via-red-800 to-amber-900">
      {/* Brand Header (matching country page) */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-lg border-b border-amber-500/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> SafariVerse
          </button>
          <h1 className="font-display text-3xl bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent">
            Safari Gallery
          </h1>
          <div />
        </div>
      </div>

      {/* Bento Grid */}
      <main className="pt-24 pb-10 relative z-10 px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="grid auto-rows-[10rem] sm:auto-rows-[12rem] md:auto-rows-[14rem] lg:auto-rows-[16rem] grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((img: any, index) => (
            <div
              key={img.src}
              className={`${spans[index]} relative group overflow-hidden rounded-2xl border border-amber-500/40 hover:border-amber-400/70 transition-colors bg-black/40 backdrop-blur-md shadow-lg cursor-pointer`}
              onClick={() => setSelected(img)}
              aria-label={`View ${img.alt}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={index < 8}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 left-2 text-white text-sm sm:text-base drop-shadow-md">
                {img.alt}
                {img.author && (
                  <div className="text-xs text-amber-200/80 mt-0.5">
                    Photo by {img.author} on Unsplash
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* Sentinel */}
          <div
            ref={sentinelRef}
            className="col-span-full flex items-center justify-center py-6"
          >
            {isLoading ? (
              <span className="text-yellow-200 text-sm">Loading more...</span>
            ) : !hasMore ? (
              <span className="text-orange-200/70 text-sm">No more images</span>
            ) : null}
          </div>
        </div>
      </main>
      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-12 right-0 text-white hover:text-amber-300 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[75vh]">
              <Image
                src={selected.src}
                alt={selected.alt}
                fill
                className="object-contain rounded-xl"
                sizes="100vw"
                priority
              />
            </div>
            {/* Attribution & download compliance */}
            <div className="mt-3 flex items-center justify-between text-sm text-amber-200">
              <div>
                {selected.author ? (
                  <>
                    Photo by {selected.author} on{" "}
                    <a
                      href={selected.photoLink || "https://unsplash.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-amber-300"
                    >
                      Unsplash
                    </a>
                  </>
                ) : (
                  <span>Unsplash</span>
                )}
              </div>
              {selected.downloadLocation && (
                <button
                  onClick={async () => {
                    try {
                      await fetch("/api/unsplash/download", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          downloadLocation: selected.downloadLocation,
                        }),
                      });
                    } catch {}
                  }}
                  className="px-3 py-1 rounded bg-amber-700/60 hover:bg-amber-700 transition-colors"
                >
                  Trigger Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
