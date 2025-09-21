"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Coins,
  Trophy,
  Star,
  Zap,
  Clock,
  Target,
  Award,
  TrendingUp,
  Flame,
  Shield,
} from "lucide-react";

interface RewardMilestone {
  id: string;
  type: "SURVIVAL" | "SCORE" | "ACHIEVEMENT" | "SPECIAL";
  title: string;
  description: string;
  reward: {
    tokens?: number;
    nft?: boolean;
    achievementId?: string;
  };
  threshold: number;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  completed: boolean;
  justCompleted?: boolean;
}

interface RealtimeRewardsProps {
  survivalTime: number;
  score: number;
  gameActive: boolean;
  onMilestoneReached?: (milestone: RewardMilestone) => void;
}

interface FloatingReward {
  id: string;
  type: "token" | "achievement" | "milestone";
  amount?: number;
  text: string;
  x: number;
  y: number;
  timestamp: number;
  color: string;
}

export default function RealtimeRewards({
  survivalTime,
  score,
  gameActive,
  onMilestoneReached,
}: RealtimeRewardsProps) {
  const [milestones, setMilestones] = useState<RewardMilestone[]>([]);
  const [floatingRewards, setFloatingRewards] = useState<FloatingReward[]>([]);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const lastSurvivalTime = useRef(0);
  const lastScore = useRef(0);

  // Initialize milestones
  useEffect(() => {
    const initialMilestones: RewardMilestone[] = [
      // Survival milestones
      {
        id: "survive-30",
        type: "SURVIVAL",
        title: "First Steps",
        description: "Survive 30 seconds",
        reward: { tokens: 50 },
        threshold: 30,
        icon: <Clock className="w-4 h-4" />,
        color: "text-green-400",
        glowColor: "shadow-green-400/40",
        completed: false,
      },
      {
        id: "survive-60",
        type: "SURVIVAL",
        title: "One Minute Hero",
        description: "Survive 1 minute",
        reward: { tokens: 100, achievementId: "FIRST_SURVIVOR" },
        threshold: 60,
        icon: <Trophy className="w-4 h-4" />,
        color: "text-blue-400",
        glowColor: "shadow-blue-400/40",
        completed: false,
      },
      {
        id: "survive-120",
        type: "SURVIVAL",
        title: "Endurance Test",
        description: "Survive 2 minutes",
        reward: { tokens: 200 },
        threshold: 120,
        icon: <Shield className="w-4 h-4" />,
        color: "text-purple-400",
        glowColor: "shadow-purple-400/40",
        completed: false,
      },
      {
        id: "survive-180",
        type: "SURVIVAL",
        title: "Endurance Runner",
        description: "Survive 3 minutes",
        reward: { tokens: 500, nft: true, achievementId: "ENDURANCE_RUNNER" },
        threshold: 180,
        icon: <Flame className="w-4 h-4" />,
        color: "text-orange-400",
        glowColor: "shadow-orange-400/40",
        completed: false,
      },
      {
        id: "survive-300",
        type: "SURVIVAL",
        title: "Safari Master",
        description: "Survive 5 minutes",
        reward: { tokens: 1000, nft: true, achievementId: "SAFARI_MASTER" },
        threshold: 300,
        icon: <Award className="w-4 h-4" />,
        color: "text-yellow-400",
        glowColor: "shadow-yellow-400/60 animate-pulse",
        completed: false,
      },

      // Score milestones
      {
        id: "score-100",
        type: "SCORE",
        title: "Century",
        description: "Reach 100 points",
        reward: { tokens: 25 },
        threshold: 100,
        icon: <Star className="w-4 h-4" />,
        color: "text-cyan-400",
        glowColor: "shadow-cyan-400/40",
        completed: false,
      },
      {
        id: "score-250",
        type: "SCORE",
        title: "Rising Star",
        description: "Reach 250 points",
        reward: { tokens: 50 },
        threshold: 250,
        icon: <TrendingUp className="w-4 h-4" />,
        color: "text-indigo-400",
        glowColor: "shadow-indigo-400/40",
        completed: false,
      },
      {
        id: "score-500",
        type: "SCORE",
        title: "High Scorer",
        description: "Reach 500 points",
        reward: { tokens: 100, nft: true },
        threshold: 500,
        icon: <Target className="w-4 h-4" />,
        color: "text-pink-400",
        glowColor: "shadow-pink-400/40",
        completed: false,
      },
      {
        id: "score-1000",
        type: "SCORE",
        title: "Score Master",
        description: "Reach 1000 points",
        reward: { tokens: 300, nft: true },
        threshold: 1000,
        icon: <Zap className="w-4 h-4" />,
        color: "text-red-400",
        glowColor: "shadow-red-400/40",
        completed: false,
      },
    ];

    setMilestones(initialMilestones);
  }, []);

  // Check for completed milestones
  const checkMilestones = useCallback(() => {
    setMilestones((prev) => {
      const updated = prev.map((milestone) => {
        const wasCompleted = milestone.completed;
        let isCompleted = false;

        if (milestone.type === "SURVIVAL") {
          isCompleted = survivalTime >= milestone.threshold;
        } else if (milestone.type === "SCORE") {
          isCompleted = score >= milestone.threshold;
        }

        if (isCompleted && !wasCompleted) {
          // Milestone just completed!
          const tokensEarned = milestone.reward.tokens || 0;
          setTotalTokensEarned((prev) => prev + tokensEarned);

          // Create floating reward
          const floatingReward: FloatingReward = {
            id: `reward-${milestone.id}-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            type: milestone.reward.nft ? "achievement" : "token",
            amount: tokensEarned,
            text: milestone.reward.nft
              ? `${milestone.title} NFT!`
              : `+${tokensEarned} SAFARI`,
            x: Math.random() * 200 + 200, // Center screen
            y: Math.random() * 150 + 150, // Middle area
            timestamp: Date.now(),
            color: milestone.color,
          };

          setFloatingRewards((prev) => [...prev, floatingReward]);

          // Trigger callback
          onMilestoneReached?.({
            ...milestone,
            completed: true,
            justCompleted: true,
          });

          return { ...milestone, completed: true, justCompleted: true };
        }

        return { ...milestone, completed: isCompleted };
      });

      return updated;
    });
  }, [survivalTime, score, onMilestoneReached]);

  // Check milestones when game state changes
  useEffect(() => {
    if (gameActive) {
      checkMilestones();
    }
  }, [survivalTime, score, gameActive, checkMilestones]);

  // Add continuous rewards for survival
  useEffect(() => {
    if (!gameActive) return;

    const currentMinute = Math.floor(survivalTime / 60);
    const lastMinute = Math.floor(lastSurvivalTime.current / 60);

    // Award tokens every minute
    if (currentMinute > lastMinute && survivalTime > 60) {
      const tokensEarned = 100; // 1 SAFARI per minute
      setTotalTokensEarned((prev) => prev + tokensEarned);

      const floatingReward: FloatingReward = {
        id: `minute-${currentMinute}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        type: "token",
        amount: tokensEarned,
        text: `+${tokensEarned} SAFARI`,
        x: Math.random() * 200 + 200, // Center screen
        y: Math.random() * 150 + 150, // Middle area
        timestamp: Date.now(),
        color: "text-yellow-400",
      };

      setFloatingRewards((prev) => [...prev, floatingReward]);
    }

    lastSurvivalTime.current = survivalTime;
  }, [survivalTime, gameActive]);

  // Add score-based continuous rewards
  useEffect(() => {
    if (!gameActive) return;

    const scoreIncrease = score - lastScore.current;
    if (scoreIncrease >= 100) {
      const tokensEarned = Math.floor(scoreIncrease / 100) * 10; // 0.1 SAFARI per 100 points
      setTotalTokensEarned((prev) => prev + tokensEarned);

      const floatingReward: FloatingReward = {
        id: `score-${score}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        type: "token",
        amount: tokensEarned,
        text: `+${tokensEarned} SAFARI`,
        x: Math.random() * 200 + 200, // Center screen
        y: Math.random() * 150 + 150, // Middle area
        timestamp: Date.now(),
        color: "text-blue-400",
      };

      setFloatingRewards((prev) => [...prev, floatingReward]);
    }

    lastScore.current = score;
  }, [score, gameActive]);

  // Clean up old floating rewards
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setFloatingRewards((prev) =>
        prev.filter((reward) => now - reward.timestamp < 3000)
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  // Reset on game restart
  useEffect(() => {
    if (!gameActive) {
      setMilestones((prev) =>
        prev.map((m) => ({ ...m, completed: false, justCompleted: false }))
      );
      setFloatingRewards([]);
      setTotalTokensEarned(0);
      setStreak(0);
      lastSurvivalTime.current = 0;
      lastScore.current = 0;
    }
  }, [gameActive]);

  const nextMilestone = milestones.find((m) => !m.completed);
  const completedCount = milestones.filter((m) => m.completed).length;

  return (
    <>
      {/* Milestone Progress Panel - Matching Native Game UI */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-lg p-4 rounded-xl border border-green-500/30 text-green-100 max-w-xs">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Progress
            </h3>
            <span className="text-sm text-gray-300">
              {completedCount}/{milestones.length}
            </span>
          </div>

          {/* Total Tokens Earned */}
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>
                Session Earned: {(totalTokensEarned / 100).toFixed(1)} SAFARI
              </span>
            </div>

            {/* Next Milestone */}
            {nextMilestone && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={nextMilestone.color}>
                    {nextMilestone.icon}
                  </span>
                  <span className="text-sm font-medium">
                    {nextMilestone.title}
                  </span>
                </div>
                <div className="text-xs text-gray-300">
                  {nextMilestone.description}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      nextMilestone.type === "SURVIVAL"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        ((nextMilestone.type === "SURVIVAL"
                          ? survivalTime
                          : score) /
                          nextMilestone.threshold) *
                          100
                      )}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400">
                  {nextMilestone.type === "SURVIVAL"
                    ? `${survivalTime}s / ${nextMilestone.threshold}s`
                    : `${score} / ${nextMilestone.threshold} points`}
                </div>
                {nextMilestone.reward.tokens && (
                  <div className="text-xs text-yellow-300">
                    🪙 Reward: +{nextMilestone.reward.tokens / 100} SAFARI
                  </div>
                )}
              </div>
            )}

            {/* Recent Completed Milestones */}
            {milestones
              .filter((m) => m.completed)
              .slice(-2)
              .map((milestone) => (
                <div
                  key={milestone.id}
                  className={`border border-green-500/50 bg-green-500/20 rounded-lg p-2 ${
                    milestone.justCompleted ? "animate-pulse" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">{milestone.icon}</span>
                    <span className="text-sm font-medium text-green-100">
                      ✅ {milestone.title}
                    </span>
                  </div>
                  {milestone.reward.tokens && (
                    <div className="text-xs text-yellow-300">
                      +{milestone.reward.tokens / 100} SAFARI earned
                    </div>
                  )}
                </div>
              ))}

            {/* All milestones completed */}
            {completedCount === milestones.length && (
              <div className="text-center py-2">
                <div className="text-2xl mb-1">🎉</div>
                <div className="text-sm font-bold text-yellow-400">
                  All Milestones Complete!
                </div>
                <div className="text-xs text-gray-300">
                  You're a Safari Legend!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Rewards - Improved Visibility */}
      <div className="absolute inset-0 pointer-events-none z-25">
        {floatingRewards.map((reward) => {
          const age = Date.now() - reward.timestamp;
          const progress = Math.min(age / 3000, 1);
          const opacity = Math.max(1 - progress, 0);
          const yOffset = -progress * 120;
          const scale = 1 + progress * 0.3;

          return (
            <div
              key={reward.id}
              className="absolute"
              style={{
                left: reward.x,
                top: reward.y + yOffset,
                opacity: opacity,
                transform: `scale(${scale})`,
                transition: "none",
                zIndex: 25,
              }}
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm px-3 py-1 rounded-full border-2 border-yellow-300 shadow-2xl">
                <div className="flex items-center gap-1">
                  {reward.type === "token" ? (
                    <Coins className="w-4 h-4" />
                  ) : (
                    <Trophy className="w-4 h-4" />
                  )}
                  {reward.text}
                </div>
              </div>
              {/* Sparkle effect */}
              <div className="absolute -top-1 -right-1 text-yellow-200 animate-ping text-lg">
                ✨
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
