"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Routes to prefetch for better performance
const ROUTES_TO_PREFETCH = [
  '/game/nigeria',
  '/nft',
  '/socialhub',
  '/gallery',
  '/social',
  '/safarimart/nigeria',
  '/artgallery/nigeria',
  '/music/nigeria',
];

export default function PerformanceOptimizer() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch critical routes after initial load
    const prefetchRoutes = async () => {
      // Wait for the page to be fully loaded
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(void 0);
        } else {
          window.addEventListener('load', () => resolve(void 0));
        }
      });

      // Prefetch routes with a slight delay to not interfere with initial page load
      setTimeout(() => {
        ROUTES_TO_PREFETCH.forEach(route => {
          router.prefetch(route);
        });
      }, 1000);
    };

    prefetchRoutes();
  }, [router]);

  useEffect(() => {
    // Optimize images loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.loading = 'eager';
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    return () => imageObserver.disconnect();
  }, []);

  return null; // This component doesn't render anything
}
