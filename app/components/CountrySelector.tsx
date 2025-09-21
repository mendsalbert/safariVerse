"use client";

import { useState } from "react";

interface CountrySelectorProps {
  onCountrySelect: (country: string, emoji: string, username: string) => void;
  onClose: () => void;
}

const countries = [
  { name: "Nigeria", emoji: "🇳🇬", code: "NG" },
  { name: "Ghana", emoji: "🇬🇭", code: "GH" },
  { name: "Kenya", emoji: "🇰🇪", code: "KE" },
  { name: "South Africa", emoji: "🇿🇦", code: "ZA" },
  { name: "Morocco", emoji: "🇲🇦", code: "MA" },
  { name: "Egypt", emoji: "🇪🇬", code: "EG" },
  { name: "Ethiopia", emoji: "🇪🇹", code: "ET" },
  { name: "Tanzania", emoji: "🇹🇿", code: "TZ" },
  { name: "Uganda", emoji: "🇺🇬", code: "UG" },
  { name: "Rwanda", emoji: "🇷🇼", code: "RW" },
  { name: "Senegal", emoji: "🇸🇳", code: "SN" },
  { name: "Mali", emoji: "🇲🇱", code: "ML" },
  { name: "Burkina Faso", emoji: "🇧🇫", code: "BF" },
  { name: "Ivory Coast", emoji: "🇨🇮", code: "CI" },
  { name: "Cameroon", emoji: "🇨🇲", code: "CM" },
  { name: "Chad", emoji: "🇹🇩", code: "TD" },
  { name: "Niger", emoji: "🇳🇪", code: "NE" },
  { name: "Benin", emoji: "🇧🇯", code: "BJ" },
  { name: "Togo", emoji: "🇹🇬", code: "TG" },
  { name: "Guinea", emoji: "🇬🇳", code: "GN" },
  { name: "Sierra Leone", emoji: "🇸🇱", code: "SL" },
  { name: "Liberia", emoji: "🇱🇷", code: "LR" },
  { name: "Gambia", emoji: "🇬🇲", code: "GM" },
  { name: "Guinea-Bissau", emoji: "🇬🇼", code: "GW" },
  { name: "Cape Verde", emoji: "🇨🇻", code: "CV" },
  { name: "Mauritania", emoji: "🇲🇷", code: "MR" },
  { name: "Algeria", emoji: "🇩🇿", code: "DZ" },
  { name: "Tunisia", emoji: "🇹🇳", code: "TN" },
  { name: "Libya", emoji: "🇱🇾", code: "LY" },
  { name: "Sudan", emoji: "🇸🇩", code: "SD" },
  { name: "South Sudan", emoji: "🇸🇸", code: "SS" },
  { name: "Somalia", emoji: "🇸🇴", code: "SO" },
  { name: "Djibouti", emoji: "🇩🇯", code: "DJ" },
  { name: "Eritrea", emoji: "🇪🇷", code: "ER" },
  { name: "Central African Republic", emoji: "🇨🇫", code: "CF" },
  { name: "Democratic Republic of Congo", emoji: "🇨🇩", code: "CD" },
  { name: "Republic of Congo", emoji: "🇨🇬", code: "CG" },
  { name: "Gabon", emoji: "🇬🇦", code: "GA" },
  { name: "Equatorial Guinea", emoji: "🇬🇶", code: "GQ" },
  { name: "São Tomé and Príncipe", emoji: "🇸🇹", code: "ST" },
  { name: "Angola", emoji: "🇦🇴", code: "AO" },
  { name: "Zambia", emoji: "🇿🇲", code: "ZM" },
  { name: "Zimbabwe", emoji: "🇿🇼", code: "ZW" },
  { name: "Botswana", emoji: "🇧🇼", code: "BW" },
  { name: "Namibia", emoji: "🇳🇦", code: "NA" },
  { name: "Lesotho", emoji: "🇱🇸", code: "LS" },
  { name: "Eswatini", emoji: "🇸🇿", code: "SZ" },
  { name: "Malawi", emoji: "🇲🇼", code: "MW" },
  { name: "Mozambique", emoji: "🇲🇿", code: "MZ" },
  { name: "Madagascar", emoji: "🇲🇬", code: "MG" },
  { name: "Mauritius", emoji: "🇲🇺", code: "MU" },
  { name: "Seychelles", emoji: "🇸🇨", code: "SC" },
  { name: "Comoros", emoji: "🇰🇲", code: "KM" },
  // Add some popular non-African countries too
  { name: "United States", emoji: "🇺🇸", code: "US" },
  { name: "United Kingdom", emoji: "🇬🇧", code: "GB" },
  { name: "Canada", emoji: "🇨🇦", code: "CA" },
  { name: "Australia", emoji: "🇦🇺", code: "AU" },
  { name: "Germany", emoji: "🇩🇪", code: "DE" },
  { name: "France", emoji: "🇫🇷", code: "FR" },
  { name: "Brazil", emoji: "🇧🇷", code: "BR" },
  { name: "India", emoji: "🇮🇳", code: "IN" },
  { name: "China", emoji: "🇨🇳", code: "CN" },
  { name: "Japan", emoji: "🇯🇵", code: "JP" },
];

export default function CountrySelector({
  onCountrySelect,
  onClose,
}: CountrySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [username, setUsername] = useState("");

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (country: string, emoji: string) => {
    if (!username.trim()) {
      alert("Please enter your name first!");
      return;
    }
    onCountrySelect(country, emoji, username.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Choose Your Country
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            Let others know where you're tuning in from! 🌍
          </p>
        </div>

        {/* Username Input */}
        <div className="p-4 border-b border-white/10">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400"
            maxLength={30}
          />
        </div>

        {/* Search */}
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Country
          </label>
          <input
            type="text"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Countries List */}
        <div className="overflow-y-auto max-h-96 px-4 pb-4">
          <div className="space-y-1">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountrySelect(country.name, country.emoji)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <span className="text-2xl">{country.emoji}</span>
                <span className="text-white font-medium">{country.name}</span>
              </button>
            ))}
          </div>

          {filteredCountries.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No countries found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
