"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AfricaMap from "./components/AfricaMap";
import GlobeAfrica from "./components/GlobeAfrica";
import CountryExplorer from "./components/CountryExplorer";
import LocationChat from "./components/LocationChat";
import Marketplace from "./components/Marketplace";
import SocialHub from "./components/SocialHub";

interface Country {
  id: string;
  name: string;
  cities: string[];
  description: string;
  population: string;
}

interface City {
  id: string;
  name: string;
  type: "city" | "village" | "town";
  onlineUsers: number;
}

type ViewState = "map" | "country" | "city" | "marketplace" | "social";

export default function Home() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewState>("map");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const showBrandTitle =
    currentView !== "map" && !(currentView === "country" && !selectedCountry);

  const handleCountrySelect = (country: any) => {
    const formattedCountry: Country = {
      id: country.id,
      name: country.name,
      cities: country.cities,
      description: country.description,
      population: country.population,
    };
    setSelectedCountry(formattedCountry);
    setCurrentView("country");
  };

  const handleCitySelect = (city: any) => {
    const formattedCity: City = {
      id: city.id,
      name: city.name,
      type: city.type,
      onlineUsers: city.onlineUsers,
    };
    setSelectedCity(formattedCity);
    setCurrentView("city");
  };

  const handleBackToMap = () => {
    setCurrentView("map");
    setSelectedCountry(null);
    setSelectedCity(null);
  };

  const handleBackToCountry = () => {
    setCurrentView("country");
    setSelectedCity(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "map":
        return (
          <>
            <GlobeAfrica />
          </>
        );

      case "country":
        return selectedCountry ? (
          <CountryExplorer
            country={selectedCountry}
            onBack={handleBackToMap}
            onCitySelect={handleCitySelect}
          />
        ) : (
          <AfricaMap onCountrySelect={handleCountrySelect} />
        );

      case "city":
        return selectedCity ? (
          <LocationChat city={selectedCity} onBack={handleBackToCountry} />
        ) : (
          <AfricaMap onCountrySelect={handleCountrySelect} />
        );

      case "marketplace":
        return <Marketplace />;

      case "social":
        return <SocialHub />;

      default:
        return <AfricaMap onCountrySelect={handleCountrySelect} />;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Sky background with clouds */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.6) 20%, rgba(255,255,255,0) 45%), " +
            "radial-gradient(ellipse at 70% 25%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.55) 22%, rgba(255,255,255,0) 46%), " +
            "radial-gradient(ellipse at 40% 38%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.5) 18%, rgba(255,255,255,0) 42%), " +
            "radial-gradient(ellipse at 85% 50%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.45) 20%, rgba(255,255,255,0) 44%), " +
            "linear-gradient(to bottom, #76b6ff 0%, #a7d3ff 50%, #dbefff 100%)",
          filter: "saturate(1.05)",
        }}
      />
      {/* Brand Title */}
      {showBrandTitle && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-40 text-center">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,140,0,0.35)]">
            SafariVerse
          </h1>
        </div>
      )}
      {/* Main Content */}
      {renderCurrentView()}

      {/* Navigation Menu - Only show on map view */}
      {currentView === "map" && (
        <div className="absolute bottom-6 right-6 z-20 bg-black/60 backdrop-blur-lg p-4 rounded-xl border border-amber-500/30 text-orange-100">
          <div className="flex flex-col gap-2 w-48">
            <button
              onClick={() => router.push("/nft")}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-colors shadow-lg flex items-center justify-center gap-2"
              aria-label="Open Marketplace"
            >
              Marketplace NFT
            </button>
            <button
              onClick={() => router.push("/social")}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-colors shadow-lg flex items-center justify-center gap-2"
              aria-label="Open Global Social"
            >
              Global Social
            </button>
          </div>
        </div>
      )}

      {/* Back to Map Button for marketplace and social */}
      {(currentView === "marketplace" || currentView === "social") && (
        <button
          onClick={() => setCurrentView("map")}
          className="absolute top-4 left-4 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-colors shadow-lg"
        >
          ← Back to Africa Map
        </button>
      )}
    </div>
  );
}
