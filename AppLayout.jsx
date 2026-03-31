import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Zap, LayoutDashboard, FolderKanban, CheckSquare,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Plus, Bell, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getAvatarColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-5 border-b border-[rgba(99,102,241,0.12)] ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <Zap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-display text-lg font-bold text-white">TaskFlow</span>
            <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">PRO</span>
          </div>
        )}
      </div>

      {/* Quick Action */}
      {!collapsed && (
        <div className="px-4 py-4">
          <Link to="/projects/new"
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5">
            <Plus size={16} />New Project
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link key={path} to={path}
              className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? label : ''}>
              <Icon size={19} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[rgba(99,102,241,0.12)]">
        <div className={`flex items-center gap-3 p-3 rounded-xl hover:bg-brand-500/10 transition-all cursor-pointer group ${collapsed ? 'justify-center' : ''}`}>
          <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${getAvatarColor(user?.name)}`}>
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-[#4a5480] truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-[#4a5480] hover:text-red-400 transition-all">
              <LogOut size={15} />
            </button>
          )}
        </div>
        {collapsed && (
          <button onClick={handleLogout}
            className="w-full mt-2 p-2 rounded-xl hover:bg-red-500/10 text-[#4a5480] hover:text-red-400 transition-all flex justify-center">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-bg min-h-screen flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 border-r border-[rgba(99,102,241,0.12)]
        ${collapsed ? 'w-20' : 'w-64'}`}
        style={{ background: 'rgba(13,15,24,0.95)' }}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute top-20 -right-3 w-6 h-6 rounded-full bg-surface-800 border border-[rgba(99,102,241,0.2)] flex items-center justify-center text-[#8b9cc8] hover:text-white hover:bg-brand-500/20 transition-all z-10">
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col lg:hidden transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-[rgba(99,102,241,0.15)]`}
        style={{ background: 'rgba(13,15,24,0.98)' }}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[rgba(99,102,241,0.1)] flex-shrink-0"
          style={{ background: 'rgba(13,15,24,0.8)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-xl hover:bg-brand-500/10 text-[#8b9cc8] hover:text-white transition-all"
              onClick={() => setMobileOpen(true)}>
              <div className="w-5 space-y-1">
                <span className="block h-0.5 bg-current rounded" />
                <span className="block h-0.5 bg-current rounded w-3/4" />
                <span className="block h-0.5 bg-current rounded" />
              </div>
            </button>
            <div className="relative hidden md:block">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4a5480]" />
              <input placeholder="Search tasks, projects..." className="input-field pl-10 py-2 text-sm w-64 h-9" readOnly
                onClick={() => toast('Search coming soon! 🔍')} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-brand-500/10 text-[#8b9cc8] hover:text-white transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
            </button>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${getAvatarColor(user?.name)}`}>
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
