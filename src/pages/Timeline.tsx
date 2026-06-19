import React, { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useContributions } from "../hooks/useData";
import { formatLocalDate } from "../lib/dateUtils";
import { StatusPill } from "../components/StatusPill";
import { PlatformBadge } from "../components/PlatformBadge";
import { Calendar, MessageSquare, Info } from "lucide-react";

type ViewType = "day" | "week" | "month" | "year";

export const Timeline: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: contributions = [], isLoading } = useContributions();

  // Selected tab from URL or state
  const currentTab = (searchParams.get("view") as ViewType) || "month";
  const highlightedDate = searchParams.get("date"); // Deep link to specific date

  const setView = (view: ViewType) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", view);
    setSearchParams(newParams);
  };

  // Group contributions by range
  const groupedData = useMemo(() => {
    const sorted = [...contributions].sort(
      (a, b) => new Date(b.date_started).getTime() - new Date(a.date_started).getTime()
    );

    if (currentTab === "day") {
      const groups: Record<string, typeof contributions> = {};
      sorted.forEach((c) => {
        const d = c.date_completed || c.date_started;
        if (!groups[d]) groups[d] = [];
        groups[d].push(c);
      });
      return Object.entries(groups).map(([key, list]) => ({
        id: key,
        title: formatLocalDate(key),
        date: new Date(key),
        items: list,
      }));
    }

    if (currentTab === "week") {
      const groups: Record<string, typeof contributions> = {};
      sorted.forEach((c) => {
        const d = new Date(c.date_completed || c.date_started);
        // Align to Sunday
        const day = d.getDay();
        const diff = d.getDate() - day;
        const sunday = new Date(d.setDate(diff));
        const sundayStr = sunday.toISOString().split("T")[0];
        
        if (!groups[sundayStr]) groups[sundayStr] = [];
        groups[sundayStr].push(c);
      });
      return Object.entries(groups).map(([key, list]) => {
        const sun = new Date(key);
        const sat = new Date(sun);
        sat.setDate(sat.getDate() + 6);
        return {
          id: key,
          title: `Week of ${sun.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${sat.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
          date: sun,
          items: list,
        };
      });
    }

    if (currentTab === "month") {
      const groups: Record<string, typeof contributions> = {};
      sorted.forEach((c) => {
        const d = new Date(c.date_completed || c.date_started);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!groups[monthKey]) groups[monthKey] = [];
        groups[monthKey].push(c);
      });
      return Object.entries(groups).map(([key, list]) => {
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          id: key,
          title: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          date,
          items: list,
        };
      });
    }

    // Yearly
    const groups: Record<string, typeof contributions> = {};
    sorted.forEach((c) => {
      const d = new Date(c.date_completed || c.date_started);
      const yearKey = `${d.getFullYear()}`;
      if (!groups[yearKey]) groups[yearKey] = [];
      groups[yearKey].push(c);
    });
    return Object.entries(groups).map(([key, list]) => ({
      id: key,
      title: `${key} Contributions`,
      date: new Date(parseInt(key), 0, 1),
      items: list,
    }));
  }, [contributions, currentTab]);

  // Client-side Natural Language Summary Generator
  const generateSummary = (items: typeof contributions) => {
    const total = items.length;
    const merged = items.filter((i) => i.status === "merged").length;
    const review = items.filter((i) => i.status === "under_review" || i.status === "open").length;
    const repos = Array.from(new Set(items.map((i) => i.repository)));
    const platforms = Array.from(new Set(items.map((i) => i.platform)));

    const platformBreakdown = platforms
      .map((p) => {
        const count = items.filter((i) => i.platform === p).length;
        const name = p === "wikipedia" ? "Wikimedia" : p.charAt(0).toUpperCase() + p.slice(1);
        return `${count} on ${name}`;
      })
      .join(", ");

    const repoText = repos.length === 1 ? `repository (${repos[0]})` : `${repos.length} repositories`;

    return `Gautam made ${total} contribution${total !== 1 ? "s" : ""} across ${repoText} (${platformBreakdown}). Of these, ${merged} ${merged === 1 ? "was" : "were"} merged successfully, and ${review} remain under review or open.`;
  };

  return (
    <div className="space-y-8">
      {/* Page Title & View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Historical Timeline</h1>
          <p className="text-xs text-secondary mt-1">Navigate your open source journey chronologically.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex rounded-lg border border-border-subtle bg-surface p-1 self-start shrink-0">
          {(["day", "week", "month", "year"] as ViewType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                currentTab === tab
                  ? "bg-accent text-white shadow-sm"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Deep linked / Highlighted Date banner */}
      {highlightedDate && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Info className="h-5 w-5 text-accent shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-accent">Viewing highlighted date:</span>{" "}
              <span className="text-primary font-mono font-medium">{formatLocalDate(highlightedDate)}</span>
            </div>
          </div>
          <button
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete("date");
              setSearchParams(newParams);
            }}
            className="text-xs font-semibold text-accent hover:text-accent-hover"
          >
            Show full timeline
          </button>
        </div>
      )}

      {/* Main Timeline Stream */}
      {isLoading ? (
        <div className="py-24 text-center text-secondary">Analyzing project history...</div>
      ) : groupedData.length === 0 ? (
        <div className="py-24 text-center text-secondary border border-dashed border-border-default bg-surface rounded-xl">
          No contribution logs found for this view.
        </div>
      ) : (
        <div className="relative border-l-2 border-border-subtle ml-4 pl-6 md:ml-8 md:pl-8 space-y-12 py-4">
          {groupedData
            .filter((group) => {
              // If deep-linked date is present, show only that group in day view
              if (highlightedDate && currentTab === "day") {
                return group.id === highlightedDate;
              }
              return true;
            })
            .map((group) => (
              <div key={group.id} className="relative group/time">
                {/* Timeline node dot */}
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 h-4 w-4 rounded-full border-2 border-accent bg-background group-hover/time:scale-110 transition-transform duration-150" />

                {/* Group Details */}
                <div className="space-y-4">
                  {/* Date Heading & Summary */}
                  <div>
                    <h2 className="text-lg font-bold text-primary flex items-center gap-2 tracking-tight">
                      <Calendar className="h-4.5 w-4.5 text-secondary" />
                      {group.title}
                    </h2>
                    
                    {/* Natural language summary box */}
                    <div className="mt-2 text-xs leading-relaxed text-secondary bg-surface-elevated/40 border border-border-subtle p-3 rounded-lg flex items-start gap-2 max-w-3xl">
                      <Info className="h-4 w-4 text-accent shrink-0 mt-[1px]" />
                      <span>{generateSummary(group.items)}</span>
                    </div>
                  </div>

                  {/* Contributions in this group */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {group.items.map((c) => (
                      <div
                        key={c.id}
                        className="bg-surface border border-border-default rounded-xl p-5 hover:border-accent/30 shadow-sm transition-all duration-150 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <PlatformBadge platform={c.platform} />
                            <div className="flex items-center gap-2">
                              {c.review_notes && c.review_notes.length > 0 && (
                                <span
                                  title={`${c.review_notes.length} reviewer notes`}
                                  className="text-secondary hover:text-accent p-0.5 rounded"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                </span>
                              )}
                              <StatusPill status={c.status} />
                            </div>
                          </div>
                          
                          <Link
                            to={`/contributions/${c.id}`}
                            className="font-semibold text-sm text-primary hover:text-accent line-clamp-2 leading-snug tracking-tight"
                          >
                            {c.title}
                          </Link>
                          
                          <p className="text-xs text-secondary line-clamp-2 mt-2 leading-relaxed">
                            {c.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-secondary">
                          <span className="truncate max-w-[150px]">{c.repository}</span>
                          <span>{formatLocalDate(c.date_started)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
