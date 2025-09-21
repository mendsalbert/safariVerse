"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { database } from "../../lib/firebase";
import {
  ref,
  onValue,
  off,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";

interface TunedInUser {
  id: string;
  country: string;
  countryEmoji: string;
  username: string;
  joinedAt: number;
}

export default function TuneInList() {
  const [tunedInUsers, setTunedInUsers] = useState<TunedInUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayedUsers, setDisplayedUsers] = useState<TunedInUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(20); // Start with 20 users
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Optimized Firebase query - limit initial load for performance
  useEffect(() => {
    // Use a query to order by joinedAt and limit results for better performance
    const tunedInRef = query(
      ref(database, "tunedInUsers"),
      orderByChild("joinedAt"),
      limitToLast(100) // Load last 100 users initially
    );

    const unsubscribe = onValue(tunedInRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const users = Object.values(data) as TunedInUser[];
        // Sort by most recent first (reverse since limitToLast gives oldest first)
        users.sort((a, b) => b.joinedAt - a.joinedAt);
        setTunedInUsers(users);
      } else {
        setTunedInUsers([]);
      }
      setIsLoading(false);
    });

    // Cleanup function
    return () => {
      off(tunedInRef, "value", unsubscribe);
    };
  }, []);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return tunedInUsers;

    const lowercaseSearch = searchTerm.toLowerCase();
    return tunedInUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(lowercaseSearch) ||
        user.country.toLowerCase().includes(lowercaseSearch)
    );
  }, [tunedInUsers, searchTerm]);

  // Update displayed users when filtered users or visible count changes
  useEffect(() => {
    setDisplayedUsers(filteredUsers.slice(0, visibleCount));
  }, [filteredUsers, visibleCount]);

  // Load more users function
  const loadMoreUsers = useCallback(() => {
    if (isLoadingMore || displayedUsers.length >= filteredUsers.length) return;

    setIsLoadingMore(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 20, filteredUsers.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, displayedUsers.length, filteredUsers.length]);

  // Scroll handler for infinite scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      // Load more when scrolled to bottom (with 100px threshold)
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadMoreUsers();
      }
    },
    [loadMoreUsers]
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-xs">Loading listeners...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Listener count and search */}
      <div className="space-y-2">
        <div className="text-xs text-gray-300">
          {filteredUsers.length} listener{filteredUsers.length !== 1 ? "s" : ""}{" "}
          {searchTerm ? "found" : "tuned in"}
          {tunedInUsers.length !== filteredUsers.length && (
            <span className="text-gray-400">
              {" "}
              (of {tunedInUsers.length} total)
            </span>
          )}
        </div>

        {/* Search input - only show if there are users */}
        {tunedInUsers.length > 5 && (
          <input
            type="text"
            placeholder="Search listeners..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(20); // Reset visible count when searching
            }}
            className="w-full px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400"
          />
        )}
      </div>

      {/* Listeners list */}
      {filteredUsers.length > 0 ? (
        <div
          className="space-y-2 max-h-48 overflow-auto scrollbar-thin scrollbar-thumb-white/20"
          onScroll={handleScroll}
        >
          {displayedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 text-xs text-white/90 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title={`${user.username} from ${user.country} - Joined ${new Date(
                user.joinedAt
              ).toLocaleTimeString()}`}
            >
              <span className="text-lg">{user.countryEmoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{user.username}</div>
                <div className="text-gray-400 text-[10px] truncate">
                  {user.country}
                </div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
            </div>
          ))}

          {/* Load more indicator */}
          {displayedUsers.length < filteredUsers.length && (
            <div className="text-center py-2">
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Loading more...</span>
                </div>
              ) : (
                <button
                  onClick={loadMoreUsers}
                  className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                >
                  Load{" "}
                  {Math.min(20, filteredUsers.length - displayedUsers.length)}{" "}
                  more
                </button>
              )}
            </div>
          )}

          {/* Show total when scrolled to bottom */}
          {displayedUsers.length === filteredUsers.length &&
            filteredUsers.length > 20 && (
              <div className="text-center py-2 text-xs text-gray-400">
                All {filteredUsers.length} listeners loaded
              </div>
            )}
        </div>
      ) : (
        <div className="text-xs text-gray-400 text-center py-4">
          {searchTerm ? (
            <>No listeners found matching "{searchTerm}"</>
          ) : (
            <>No listeners yet. Hit "Tune In" to join! 🎵</>
          )}
        </div>
      )}
    </div>
  );
}
