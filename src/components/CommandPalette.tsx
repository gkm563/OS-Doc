import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import { useUIStore } from "../store/uiStore";
import { useContributions, useReviewers } from "../hooks/useData";
import {
  Search,
  BookOpen,
  GitCommit,
  Trophy,
  Calendar,
  FileText,
  Shield,
} from "lucide-react";

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const navigate = useNavigate();
  const { data: contributions = [] } = useContributions();
  const { data: reviewers = [] } = useReviewers();
  const [search, setSearch] = useState("");

  // Close palette on shortcut or clicking outside
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Prepare searchable items
  const staticPages = [
    { id: "nav-home", title: "Journey Feed", category: "Navigation", path: "/", icon: Calendar, description: "Chronological feed of Gautam's open source journey" },
    { id: "nav-journal", title: "Learning Journal", category: "Navigation", path: "/journal", icon: BookOpen, description: "Lessons learned, feedback applied, and post-mortems" },
    { id: "nav-achieve", title: "Achievements & Milestones", category: "Navigation", path: "/achievements", icon: Trophy, description: "Earned badges and contributions milestones" },
    { id: "nav-resume", title: "Auto-generated Resume (CV)", category: "Navigation", path: "/resume", icon: FileText, description: "Printable professional portfolio snapshot" },
    { id: "nav-admin", title: "Admin Portal (CMS)", category: "Navigation", path: "/admin", icon: Shield, description: "Log contributions and edit database" },
  ];

  const searchItems = [
    ...staticPages.map(p => ({ ...p, type: "page" })),
    ...contributions.map(c => ({
      id: `contrib-${c.id}`,
      title: c.title,
      description: `${c.platform.toUpperCase()} · ${c.repository} · ${c.status}`,
      category: "Contributions",
      path: `/contributions/${c.id}`,
      type: "contribution",
      platform: c.platform,
    })),
    ...reviewers.map(r => ({
      id: `reviewer-${r.id}`,
      title: r.name,
      description: `Reviewer on: ${r.platforms.join(", ")}`,
      category: "Reviewers",
      path: `/reviewers/${r.name}`,
      type: "reviewer",
    })),
  ];

  // Fuzzy Search
  const fuse = new Fuse(searchItems, {
    keys: ["title", "description", "category"],
    threshold: 0.4,
  });

  const filteredItems = search
    ? fuse.search(search).map(r => r.item)
    : searchItems.slice(0, 15); // Show top items when empty query

  const handleSelect = (path: string) => {
    navigate(path);
    setCommandPaletteOpen(false);
    setSearch("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 sm:px-6"
      onClick={() => setCommandPaletteOpen(false)}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-border-default bg-surface shadow-2xl transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Palette" loop>
          <div className="flex items-center border-b border-border-subtle px-4 py-3">
            <Search className="mr-3 h-5 w-5 text-secondary shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search contributions..."
              className="w-full bg-transparent text-primary placeholder-secondary focus:outline-none focus:ring-0"
              value={search}
              onValueChange={setSearch}
            />
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-secondary bg-surface-elevated border border-border-subtle rounded font-mono shrink-0">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[350px] overflow-y-auto p-2 scroll-py-2">
            <Command.Empty className="py-6 text-center text-sm text-secondary">
              No results found for "{search}".
            </Command.Empty>

            {/* Group results by category */}
            {["Navigation", "Contributions", "Reviewers"].map((category) => {
              const categoryItems = filteredItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <Command.Group
                  key={category}
                  heading={category}
                  className="px-2 py-1.5 text-xs font-semibold text-secondary uppercase tracking-wider"
                >
                  {categoryItems.map((item) => {
                    const Icon = (item as any).icon || GitCommit;
                    return (
                      <Command.Item
                        key={item.id}
                        value={`${item.category} ${item.title} ${item.description || ""}`}
                        onSelect={() => handleSelect(item.path)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal text-primary hover:bg-accent/10 aria-selected:bg-accent/15 transition-all select-none"
                      >
                        <div className="p-1.5 rounded-md bg-surface-elevated border border-border-subtle text-accent shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">{item.title}</span>
                          {item.description && (
                            <span className="text-xs text-secondary truncate">{item.description}</span>
                          )}
                        </div>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              );
            })}
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
