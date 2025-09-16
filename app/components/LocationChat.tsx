"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Users,
  Send,
  MapPin,
  Crown,
  Heart,
  Share2,
  Camera,
  Smile,
} from "lucide-react";

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: Date;
  likes: number;
  isLiked?: boolean;
  location: string;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away" | "busy";
  location: string;
  isLocal: boolean;
}

interface City {
  id: string;
  name: string;
  type: "city" | "village" | "town";
  onlineUsers: number;
}

interface LocationChatProps {
  city: City;
  onBack: () => void;
}

const generateLocalMessages = (cityName: string): ChatMessage[] => [
  {
    id: "1",
    user: "Kwame_Accra",
    avatar: "K",
    message: `Welcome to ${cityName}! 🏙️ The weather is beautiful today, perfect for exploring our local markets!`,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    likes: 23,
    location: cityName,
  },
  {
    id: "2",
    user: "Ama_Local",
    avatar: "A",
    message:
      "Just finished making fresh banku and tilapia. Anyone want to learn the recipe? 🐟",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    likes: 18,
    location: cityName,
  },
  {
    id: "3",
    user: "Tourist_Explorer",
    avatar: "T",
    message:
      "This is my first time visiting! What are the must-see places around here?",
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    likes: 7,
    location: cityName,
  },
  {
    id: "4",
    user: "Culture_Guide",
    avatar: "C",
    message: `@Tourist_Explorer You must visit our cultural center and try the local kente weaving workshop! It's amazing 🎨`,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    likes: 12,
    location: cityName,
  },
  {
    id: "5",
    user: "Music_Lover",
    avatar: "M",
    message:
      "There's a traditional drumming session happening at the community center tonight! Everyone's welcome 🥁",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    likes: 15,
    location: cityName,
  },
];

const generateLocalUsers = (cityName: string): OnlineUser[] => [
  {
    id: "1",
    name: "Kwame_Accra",
    avatar: "K",
    status: "online",
    location: cityName,
    isLocal: true,
  },
  {
    id: "2",
    name: "Ama_Local",
    avatar: "A",
    status: "online",
    location: cityName,
    isLocal: true,
  },
  {
    id: "3",
    name: "Tourist_Explorer",
    avatar: "T",
    status: "online",
    location: cityName,
    isLocal: false,
  },
  {
    id: "4",
    name: "Culture_Guide",
    avatar: "C",
    status: "online",
    location: cityName,
    isLocal: true,
  },
  {
    id: "5",
    name: "Music_Lover",
    avatar: "M",
    status: "away",
    location: cityName,
    isLocal: true,
  },
  {
    id: "6",
    name: "Visitor_2024",
    avatar: "V",
    status: "online",
    location: cityName,
    isLocal: false,
  },
  {
    id: "7",
    name: "Local_Artist",
    avatar: "L",
    status: "busy",
    location: cityName,
    isLocal: true,
  },
  {
    id: "8",
    name: "Story_Teller",
    avatar: "S",
    status: "online",
    location: cityName,
    isLocal: true,
  },
];

export default function LocationChat({ city, onBack }: LocationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    // Generate location-specific content
    setMessages(generateLocalMessages(city.name));
    setOnlineUsers(generateLocalUsers(city.name));
  }, [city.name]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        user: "You",
        avatar: "Y",
        message: newMessage,
        timestamp: new Date(),
        likes: 0,
        location: city.name,
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

  const localUsers = onlineUsers.filter((user) => user.isLocal);
  const visitors = onlineUsers.filter((user) => !user.isLocal);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 backdrop-blur-md bg-opacity-90 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="text-white hover:text-yellow-300 transition-colors"
            >
              ← Back to Country
            </button>
            <div className="flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-yellow-300" />
              <h1 className="text-2xl font-bold text-white">
                {city.name} Community
              </h1>
              <span className="bg-yellow-500 text-amber-900 px-2 py-1 rounded-full text-xs font-bold uppercase">
                {city.type}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-white text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{onlineUsers.length} online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Location Info Banner */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-amber-900 mb-2">
                Welcome to {city.name}! 🌍
              </h2>
              <p className="text-gray-600">
                Connect with locals and fellow travelers. Share experiences, ask
                questions, and discover the best of {city.name} together.
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
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
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                        Local
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
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-500 hover:text-amber-600 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={`Share something with the ${city.name} community...`}
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

        {/* Sidebar with Users */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-gray-900">Community Members</h3>
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Locals */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                Locals ({localUsers.length})
              </h4>
              <div className="space-y-3">
                {localUsers.map((user) => (
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
                        <Crown className="w-3 h-3 text-amber-500" />
                      </div>
                      <p className="text-xs text-gray-500">Local Guide</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visitors */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Visitors ({visitors.length})
              </h4>
              <div className="space-y-3">
                {visitors.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.avatar}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                          user.status
                        )}`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900 truncate block">
                        {user.name}
                      </span>
                      <p className="text-xs text-gray-500">Explorer</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Community Actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-colors text-sm">
              Join Local Events
            </button>
            <button className="w-full border border-amber-500 text-amber-600 py-2 rounded-lg font-medium hover:bg-amber-50 transition-colors text-sm">
              Find Local Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
