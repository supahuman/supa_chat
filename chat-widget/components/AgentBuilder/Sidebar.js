'use client';

import { Bot, Database, Zap, FileText, GraduationCap, X } from 'lucide-react';
import { Button } from '@/ui';

const Sidebar = ({ 
  activeSidebarItem, 
  setActiveSidebarItem, 
  sidebarOpen, 
  setSidebarOpen 
}) => {
  const sidebarItems = [
    { id: 'ai-persona', label: 'AI Persona', icon: Bot },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: Database },
    { id: 'actions', label: 'Actions', icon: Zap },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'teach-agent', label: 'Teach Your Agent', icon: GraduationCap }
  ];

  const handleItemClick = (itemId) => {
    setActiveSidebarItem(itemId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside className={`${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } fixed md:relative md:translate-x-0 z-50 w-64 md:w-64 h-screen md:h-screen bg-card shadow-lg border-r border-card transition-transform duration-300 ease-in-out top-0`}>
      <div className="p-4 md:p-6 h-full overflow-y-auto">
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
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-secondary hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
