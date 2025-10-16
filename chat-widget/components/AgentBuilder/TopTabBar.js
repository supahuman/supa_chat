"use client";

import { Bot, Brain, Zap, Menu, Settings, Users } from "lucide-react";
import { Button } from "@/ui";
import Link from "next/link";

const TopTabBar = ({ activeTab, setActiveTab, onToggleSidebar }) => {
  const tabs = [
    { id: "build", label: "Build", icon: Bot },
    { id: "train", label: "Train", icon: Brain },
    { id: "deploy", label: "Deploy", icon: Zap },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between w-full">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center">
            <Button
              onClick={onToggleSidebar}
              variant="ghost"
              size="sm"
              icon={Menu}
              className="md:hidden"
            />
          </div>

          {/* Center - Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex-1 max-w-sm md:max-w-none md:flex-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-6 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 flex-1 md:w-40 ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50"
                  }`}
                >
                  <Icon className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden xs:inline md:inline">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right side menu items - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/clients"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Client Management</span>
            </Link>
            <Link
              href="/agents"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Agent Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopTabBar;
