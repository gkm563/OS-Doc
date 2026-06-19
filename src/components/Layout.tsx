import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "../store/uiStore";
import { CommandPalette } from "./CommandPalette";
import {
  Calendar,
  BookOpen,
  Trophy,
  FileText,
  Shield,
  Menu,
  X,
  Sun,
  Moon,
  Search,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme, setCommandPaletteOpen } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: "Journey Feed", path: "/", icon: Calendar },
    { name: "Learning Journal", path: "/journal", icon: BookOpen },
    { name: "Achievements", path: "/achievements", icon: Trophy },
    { name: "Resume / CV", path: "/resume", icon: FileText },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-200">
      {/* Search Command Palette Overlay */}
      <CommandPalette />

      {/* Global Header (Top Navigation Bar) */}
      <header className="no-print w-full bg-surface/80 backdrop-blur-md border-b border-border-subtle sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
              <span className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white font-mono text-base font-bold shadow-md shadow-accent/25">
                G
              </span>
              <div className="flex flex-col">
                <span className="text-primary leading-none text-sm font-bold">Gautam Kumar Maurya</span>
                <span className="text-[9px] text-secondary font-mono leading-normal mt-[2px] tracking-wide uppercase">
                  @GKM563 · Open Source
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                    active
                      ? "bg-accent/10 text-accent font-bold border border-accent/20"
                      : "text-secondary hover:text-primary hover:bg-surface-elevated border border-transparent"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities (Search, Theme, Admin, Hamburger) */}
          <div className="flex items-center gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated text-xs text-secondary hover:text-primary hover:border-border-default transition-all duration-150 w-28 sm:w-40 text-left"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Search (⌘K)</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border-subtle bg-surface-elevated hover:bg-surface text-secondary hover:text-primary transition-all duration-150"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Subtle Gated Admin Access */}
            <Link
              to="/admin"
              className={`p-2 rounded-lg border transition-all duration-150 bg-surface-elevated hover:bg-surface ${
                isActive("/admin")
                  ? "bg-accent/10 border-accent/20 text-accent"
                  : "border-border-subtle text-secondary hover:text-primary"
              }`}
              title="CMS Admin Gated Access"
            >
              <Shield className="h-4 w-4" />
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg border border-border-subtle bg-surface-elevated text-secondary hover:text-primary hover:bg-surface"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation (Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

          {/* Drawer Body */}
          <div className="relative w-64 bg-surface h-full border-l border-border-default shadow-2xl flex flex-col p-6 z-10 transition-all duration-200">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-sm uppercase tracking-wider text-primary">Modules</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg border border-border-subtle text-secondary hover:text-primary hover:bg-surface-elevated"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Navigation List */}
            <nav className="flex-1 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-150 ${
                      active
                        ? "bg-accent/10 text-accent font-bold border border-accent/20"
                        : "text-secondary hover:text-primary hover:bg-surface-elevated border border-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Drawer Footer with subtle admin shield */}
            <div className="pt-6 border-t border-border-subtle mt-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-status-merged animate-pulse" />
                <span className="text-[10px] font-mono text-secondary">Sync: Active</span>
              </div>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded-lg border transition-all duration-150 ${
                  isActive("/admin")
                    ? "bg-accent/10 border-accent/20 text-accent font-medium"
                    : "border-border-subtle text-secondary hover:text-primary hover:bg-surface-elevated"
                }`}
                title="Admin Gated Portal"
              >
                <Shield className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};
