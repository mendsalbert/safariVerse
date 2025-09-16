"use client";

import { useState } from "react";
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
  const [currentView, setCurrentView] = useState<ViewState>("map");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

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
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <a
                href="/babylon"
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:from-green-600 hover:to-teal-600"
              >
                Launch Babylon.js Demo (Smooth Controls)
              </a>
            </div>
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
      {/* Brand Title */}
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-40 text-center">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl bg-gradient-to-r from-amber-200 via-yellow-200 to-red-200 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,140,0,0.35)]">
          SafariVerse
        </h1>
      </div>
      {/* Main Content */}
      {renderCurrentView()}

      {/* Navigation Menu - Only show on map view */}
      {currentView === "map" && (
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setCurrentView("marketplace")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-colors shadow-lg flex items-center gap-2"
            aria-label="Open Marketplace"
          >
            Marketplace
          </button>
          <button
            onClick={() => setCurrentView("social")}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-colors shadow-lg flex items-center gap-2"
            aria-label="Open Global Social"
          >
            Global Social
          </button>
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
