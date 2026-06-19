import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "../store/uiStore";
import { CommandPalette } from "./CommandPalette";
import {
  Layers,
  BarChart3,
  Calendar,
  GitCommit,
  BookOpen,
  UserCheck,
  Trophy,
  FileText,
  Shield,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  ChevronRight,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme, setCommandPaletteOpen } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: "Overview", path: "/", icon: Layers },
    { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { name: "Timeline", path: "/timeline", icon: Calendar },
    { name: "Contributions DB", path: "/contributions", icon: GitCommit },
    { name: "Learning Journal", path: "/journal", icon: BookOpen },
    { name: "Reviewer KB", path: "/reviewers", icon: UserCheck },
    { name: "Analytics Suite", path: "/analytics", icon: BarChart3 },
    { name: "Achievements", path: "/achievements", icon: Trophy },
    { name: "Resume Export", path: "/resume", icon: FileText },
  ];

  const adminItem = { name: "Admin Portal", path: "/admin", icon: Shield };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background transition-colors duration-200">
      {/* Search Command Palette Overlay */}
      <CommandPalette />

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-surface border-r border-border-default h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-border-subtle shrink-0">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white font-mono text-base font-bold shadow-md shadow-accent/25">
              G
            </span>
            <div className="flex flex-col">
              <span className="text-primary leading-none text-sm font-semibold">Gautam K. Maurya</span>
              <span className="text-[10px] text-secondary font-mono leading-normal mt-[1px]">@GKM563 · Journey</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="text-[10px] font-mono text-secondary px-3 mb-2 uppercase tracking-widest">
            Modules
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                  active
                    ? "bg-accent/10 text-accent font-medium border border-accent/20"
                    : "text-secondary hover:text-primary hover:bg-surface-elevated border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-accent" : "text-secondary group-hover:text-primary"}`} />
                <span className="truncate">{item.name}</span>
                {active && <ChevronRight className="h-3 w-3 ml-auto text-accent" />}
              </Link>
            );
          })}

          <div className="pt-6 border-t border-border-subtle mt-6 space-y-1">
            <div className="text-[10px] font-mono text-secondary px-3 mb-2 uppercase tracking-widest">
              CMS Gated
            </div>
            <Link
              to={adminItem.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                isActive(adminItem.path)
                  ? "bg-accent/10 text-accent font-medium border border-accent/20"
                  : "text-secondary hover:text-primary hover:bg-surface-elevated border border-transparent"
              }`}
            >
              <adminItem.icon className={`h-4 w-4 shrink-0 ${isActive(adminItem.path) ? "text-accent" : "text-secondary group-hover:text-primary"}`} />
              <span className="truncate">{adminItem.name}</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border-subtle bg-background/30 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-status-merged animate-pulse" />
              <span className="text-[11px] text-secondary font-mono">Sync Bot: active</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-surface-elevated border border-border-subtle text-secondary hover:text-primary transition-all duration-150"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Header and Mobile Navigation */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="no-print h-16 bg-surface md:bg-surface/80 md:backdrop-blur-md border-b border-border-subtle px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
          {/* Left: Mobile hamburger menu & path summary */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-md border border-border-subtle text-secondary hover:text-primary hover:bg-surface-elevated"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-secondary">
              <span>gkm563</span>
              <span>/</span>
              <span className="text-primary font-medium">
                {location.pathname === "/"
                  ? "overview"
                  : location.pathname.substring(1).replace(/\//g, " / ")}
              </span>
            </div>
          </div>

          {/* Right: Search trigger, Theme switcher, Profile badge */}
          <div className="flex items-center gap-3">
            {/* Quick Search Box Button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated text-xs text-secondary hover:text-primary hover:border-border-default transition-all duration-150 w-32 sm:w-48 text-left"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Search...</span>
              <kbd className="hidden md:inline-flex ml-auto text-[9px] font-mono bg-background border border-border-subtle px-1 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Mobile-only theme toggle */}
            <button
              onClick={toggleTheme}
              className="md:hidden p-2 rounded-md border border-border-subtle text-secondary hover:text-primary hover:bg-surface-elevated"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Profile Avatar Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
              <img
                src="https://github.com/GKM563.png"
                alt="Gautam"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop";
                }}
                className="h-7 w-7 rounded-full border border-border-default object-cover"
              />
              <span className="hidden lg:inline-block text-xs font-medium text-primary">Gautam Kumar</span>
            </div>
          </div>
        </header>

        {/* Mobile Drawer (Collapsible) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

            {/* Drawer Body */}
            <div className="relative w-72 bg-surface h-full border-l border-border-default shadow-2xl flex flex-col p-6 z-10 transition-all duration-200">
              <div className="flex items-center justify-between mb-8">
                <span className="font-semibold text-primary">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md border border-border-subtle text-secondary hover:text-primary hover:bg-surface-elevated"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu List */}
              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                <div className="text-[10px] font-mono text-secondary px-3 mb-2 uppercase tracking-widest">
                  Modules
                </div>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                        active
                          ? "bg-accent/10 text-accent font-medium border border-accent/20"
                          : "text-secondary hover:text-primary hover:bg-surface-elevated border border-transparent"
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${active ? "text-accent" : "text-secondary"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <div className="pt-6 border-t border-border-subtle mt-6 space-y-1.5">
                  <div className="text-[10px] font-mono text-secondary px-3 mb-2 uppercase tracking-widest">
                    CMS Gated
                  </div>
                  <Link
                    to={adminItem.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                      isActive(adminItem.path)
                        ? "bg-accent/10 text-accent font-medium border border-accent/20"
                        : "text-secondary hover:text-primary hover:bg-surface-elevated border border-transparent"
                    }`}
                  >
                    <adminItem.icon className={`h-4.5 w-4.5 ${isActive(adminItem.path) ? "text-accent" : "text-secondary"}`} />
                    <span>{adminItem.name}</span>
                  </Link>
                </div>
              </nav>

              {/* Drawer Footer */}
              <div className="pt-6 border-t border-border-subtle mt-auto flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-status-merged" />
                <span className="text-xs text-secondary font-mono">Sync Bot: online</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
