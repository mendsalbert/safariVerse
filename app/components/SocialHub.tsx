"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Users,
  Send,
  Smile,
  Camera,
  MapPin,
  Heart,
  Share2,
  Crown,
  Star,
} from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: Date;
  likes: number;
  isLiked?: boolean;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away" | "busy";
  location: string;
  level: number;
}

const sampleMessages: ChatMessage[] = [
  {
    id: "1",
    user: "KofiMansa",
    avatar: "K",
    message:
      "Welcome to SafariVerse! The African marketplace is amazing today 🌍",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    likes: 12,
  },
  {
    id: "2",
    user: "AdunniExplorer",
    avatar: "A",
    message:
      "Just discovered this beautiful Kente cloth NFT! The patterns are incredible ✨",
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    likes: 8,
  },
  {
    id: "3",
    user: "DesertDreamer",
    avatar: "D",
    message:
      "The 3D village environment is so immersive! Can't wait to explore more locations 🏘️",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    likes: 15,
  },
  {
    id: "4",
    user: "RhythmMaster",
    avatar: "R",
    message:
      "Anyone interested in collaborating on an African music NFT collection? 🥁",
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    likes: 6,
  },
];

const onlineUsers: OnlineUser[] = [
  {
    id: "1",
    name: "KofiMansa",
    avatar: "K",
    status: "online",
    location: "Marketplace",
    level: 25,
  },
  {
    id: "2",
    name: "AdunniExplorer",
    avatar: "A",
    status: "online",
    location: "Village",
    level: 18,
  },
  {
    id: "3",
    name: "DesertDreamer",
    avatar: "D",
    status: "away",
    location: "Sahara",
    level: 32,
  },
  {
    id: "4",
    name: "RhythmMaster",
    avatar: "R",
    status: "online",
    location: "Music Hall",
    level: 14,
  },
  {
    id: "5",
    name: "GoldenEmpire",
    avatar: "G",
    status: "busy",
    location: "Trading Post",
    level: 45,
  },
  {
    id: "6",
    name: "MaskCollector",
    avatar: "M",
    status: "online",
    location: "Gallery",
    level: 22,
  },
];

export default function SocialHub() {
  const [messages, setMessages] = useState<ChatMessage[]>(sampleMessages);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "users">("chat");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        user: "You",
        avatar: "Y",
        message: newMessage,
        timestamp: new Date(),
        likes: 0,
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleLikeMessage = (messageId: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              likes: msg.likes + (msg.isLiked ? -1 : 1),
              isLiked: !msg.isLiked,
            }
          : msg
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            SafariVerse Community
          </h1>
          <p className="text-orange-700">
            Connect with fellow explorers and share your African cultural
            journey
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-6 h-6 text-amber-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Global Chat
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>
                      {onlineUsers.filter((u) => u.status === "online").length}{" "}
                      online
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {message.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {message.user}
                          </span>
                          <span className="text-sm text-gray-500">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{message.message}</p>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLikeMessage(message.id)}
                            className={`flex items-center space-x-1 text-sm transition-colors ${
                              message.isLiked
                                ? "text-red-500"
                                : "text-gray-500 hover:text-red-500"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                message.isLiked ? "fill-current" : ""
                              }`}
                            />
                            <span>{message.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-500 hover:text-amber-600 transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Share your thoughts with the community..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-amber-600 transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Online Users Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg h-full">
              {/* Users Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-gray-900">Online Now</h3>
                </div>
              </div>

              {/* Users List */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.avatar}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                          user.status
                        )}`}
                      ></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 truncate">
                          {user.name}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-gray-500">
                            {user.level}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{user.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t border-gray-200">
                <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-colors">
                  Invite Friends
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
