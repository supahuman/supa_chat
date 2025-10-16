"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Database,
  Zap,
  FileText,
  GraduationCap,
  X,
  Users,
  Settings,
  BarChart3,
  ExternalLink,
  Wrench,
  Key,
  Home,
  LogOut,
} from "lucide-react";
import { Button } from "@/ui";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";

const Sidebar = ({
  activeTab,
  activeSidebarItem,
  setActiveSidebarItem,
  sidebarOpen,
  setSidebarOpen,
  onItemClick,
}) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };
  // Different sidebar items based on active tab
  const getSidebarItems = (tab) => {
    switch (tab) {
      case "build":
      case "train":
        return [
          { id: "agents", label: "Your Agents", icon: Users },
          { id: "ai-persona", label: "AI Persona", icon: Bot },
          { id: "knowledge-base", label: "Knowledge Base", icon: Database },
          { id: "actions", label: "Actions", icon: Zap },
          { id: "forms", label: "Forms", icon: FileText },
          { id: "tools", label: "Tools", icon: Wrench },
          { id: "teach-agent", label: "Teach Your Agent", icon: GraduationCap },
        ];
      case "deploy":
        return [
          { id: "agents", label: "Agents", icon: Users },
          { id: "embeds", label: "Embeds", icon: ExternalLink },
          { id: "api-keys", label: "Api Keys", icon: Key },
          { id: "settings", label: "Settings", icon: Settings },
          { id: "analytics", label: "Analytics", icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems(activeTab);

  // Prevent scrolling on the sidebar
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const sidebar = document.querySelector("aside");
    if (sidebar) {
      sidebar.addEventListener("wheel", handleWheel, { passive: false });
      return () => sidebar.removeEventListener("wheel", handleWheel);
    }
  }, []);

  const handleItemClick = (itemId) => {
    console.log("🔑 Sidebar item clicked:", itemId);
    if (onItemClick) {
      onItemClick(itemId);
    } else {
      setActiveSidebarItem(itemId);
      // Close sidebar on mobile after selection
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  };

  return (
    <aside
      className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } fixed md:relative md:translate-x-0 z-50 w-64 md:w-64 h-screen md:h-screen bg-card shadow-lg border-r border-card transition-transform duration-300 ease-in-out top-0 flex flex-col`}
    >
      <div className="p-4 md:p-6 flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-250px)] md:max-h-[calc(100vh-200px)]">
        {/* Mobile menu button for sidebar */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <h2 className="heading-lg">Menu</h2>
          <Button
            onClick={() => setSidebarOpen(false)}
            variant="ghost"
            size="sm"
            icon={X}
          />
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSidebarItem === item.id
                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                    : "text-secondary hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Mobile-only menu items */}
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 pt-2 mt-4">
            <Link
              href="/clients"
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Client Management</span>
            </Link>
            <Link
              href="/agents"
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Agent Dashboard</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Bottom section with homepage and logout */}
      <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
        <div className="space-y-2">
          <Link
            href="/"
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Homepage</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
