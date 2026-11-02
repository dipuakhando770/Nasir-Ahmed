import React from 'react';
import { LayoutDashboard, Link, BarChart2, Globe, Settings, Shield, User } from 'lucide-react';

interface SidebarProps {
  userTab: string;
  onTabChange: (tab: string) => void;
  role: 'admin' | 'user';
  onNavigate: (view: string, path: string) => void;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({ userTab, onTabChange, role, onNavigate }) => {
  const menuItems = [
    { id: 'shorten', label: 'Create Link', icon: Link },
    { id: 'links', label: 'My Links', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'domains', label: 'Custom Domains', icon: Globe },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
      <nav className="space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${userTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>
      {role === 'admin' && (
        <button
          onClick={() => onNavigate('admin', '/nachid/admin')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-900/20 transition-colors"
        >
          <Shield className="w-4 h-4" />
          Admin Console
        </button>
      )}
    </aside>
  );
};
