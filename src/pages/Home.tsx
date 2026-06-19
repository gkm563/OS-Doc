import { type FC, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import { useContributions, useAchievements, useJournalEntry } from "../hooks/useData";
import { getDaysForHeatmap, getMonthLabels, getContributionsByDateMap, formatLocalDate } from "../lib/dateUtils";
import { StatusPill } from "../components/StatusPill";
import { PlatformBadge } from "../components/PlatformBadge";
import {
  Flame,
  Trophy,
  GitFork,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  BookOpen,
  Search,
  X,
  Info,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  User,
  Clock,
} from "lucide-react";

// Fix ESM/CJS interop for react-countup where default export might be double-wrapped
const CountUpComponent = (typeof CountUp === "function" ? CountUp : (CountUp as any).default) as any;

// Memory System panel to render detailed context inline
interface MemoryPanelProps {
  learningNoteId?: string | null;
  dateCompleted?: string | null;
  reviewers: string[];
  reviewNotes: string[];
}

const MemoryPanel: FC<MemoryPanelProps> = ({
  learningNoteId,
  dateCompleted,
  reviewers,
  reviewNotes,
}) => {
  const journalDate = learningNoteId?.replace("j_", "") || dateCompleted;
  const { data: journalContent = "", isLoading } = useJournalEntry(journalDate);

  const sanitizedMarkdown = useMemo(() => {
    return DOMPurify.sanitize(journalContent);
  }, [journalContent]);

  return (
    <div className="mt-5 pt-5 border-t border-border-subtle space-y-4 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Reviewers info */}
        <div className="space-y-2">
          <span className="text-secondary font-mono block text-[10px] uppercase tracking-widest font-semibold">Reviewers Assigned</span>
          {reviewers && reviewers.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {reviewers.map((r) => (
                <Link
                  key={r}
                  to={`/reviewers/${r}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated border border-border-subtle hover:border-accent transition-colors"
                >
                  <User className="h-3 w-3 text-secondary" />
                  <span className="text-primary font-medium">{r}</span>
                </Link>
              ))}
            </div>
          ) : (
            <span className="text-secondary italic block">No active reviewers recorded.</span>
          )}
        </div>

        {/* Reviewer Feedback Notes */}
        <div className="space-y-2">
          <span className="text-secondary font-mono block text-[10px] uppercase tracking-widest font-semibold">Reviewer Notes</span>
          {reviewNotes && reviewNotes.length > 0 ? (
            <div className="space-y-1.5 bg-surface-elevated/40 border border-border-subtle p-3 rounded-xl">
              <span className="text-primary font-bold flex items-center gap-1.5 text-xs">
                <HelpCircle className="h-4 w-4 text-accent" />
                Feedback Details:
              </span>
              <ul className="list-disc pl-5 space-y-1 text-secondary leading-relaxed font-sans text-xs">
                {reviewNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          ) : (
            <span className="text-secondary italic block">No reviewer feedback logs.</span>
          )}
        </div>
      </div>

      {/* Lessons Learned Journal Markdown */}
      <div className="space-y-2 bg-surface-elevated/20 border border-dashed border-border-default p-4 rounded-xl">
        <span className="text-primary font-bold flex items-center gap-1.5 mb-1.5 text-xs">
          <Lightbulb className="h-4 w-4 text-accent" />
          Engineering Lessons & Retrospective:
        </span>
        {isLoading ? (
          <div className="text-secondary italic">Fetching linked learning entries...</div>
        ) : journalContent ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-secondary leading-relaxed space-y-2 font-sans">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {sanitizedMarkdown}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-secondary italic flex items-center gap-1.5 text-[11px]">
            <AlertTriangle className="h-3.5 w-3.5 text-status-pending" />
            No detailed post-mortem entry linked for this task.
          </div>
        )}
      </div>
    </div>
  );
};

export const Home: FC = () => {
  const { data: contributions = [], isLoading: loadingContribs } = useContributions();
  const { data: achievements = [] } = useAchievements();

  // Navigation search filters
  const [searchVal, setSearchVal] = useState("");
  const [platformVal, setPlatformVal] = useState("all");
  const [statusVal, setStatusVal] = useState("all");
  const [dateVal, setDateVal] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Metrics
  const totalContribs = contributions.length;
  const mergedPRs = contributions.filter((c) => c.status === "merged").length;
  const underReview = contributions.filter((c) => c.status === "under_review" || c.status === "open").length;
  const totalAchievements = achievements.length;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Streak Tracker (Duolingo-style)
  const getStreaks = () => {
    const dates = contributions
      .map((c) => c.date_completed || c.date_started)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (dates.length === 0) return { current: 0, longest: 0 };

    const uniqueDates = Array.from(new Set(dates));
    let longest = 0;
    let current = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Check if there's an entry today or yesterday to continue current streak
    const hasToday = uniqueDates.includes(today.toISOString().split("T")[0]);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const hasYesterday = uniqueDates.includes(yesterday.toISOString().split("T")[0]);

    if (hasToday || hasYesterday) {
      let streakCurrent = 0;
      let check = hasToday ? today : yesterday;
      while (true) {
        const dateStr = check.toISOString().split("T")[0];
        if (uniqueDates.includes(dateStr)) {
          streakCurrent++;
          check.setDate(check.getDate() - 1);
        } else {
          break;
        }
      }
      current = streakCurrent;
    }

    // Longest Streak calculation
    let prevTime: number | null = null;
    let currentStreak = 0;

    const ascDates = uniqueDates.map((d) => new Date(d).getTime()).sort((a, b) => a - b);

    ascDates.forEach((time) => {
      if (prevTime === null) {
        currentStreak = 1;
      } else {
        const diffDays = (time - prevTime) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          if (currentStreak > longest) longest = currentStreak;
          currentStreak = 1;
        }
      }
      prevTime = time;
    });

    if (currentStreak > longest) longest = currentStreak;

    return {
      current,
      longest: Math.max(longest, current),
    };
  };

  const streaks = getStreaks();

  // Heatmap rendering helpers
  const heatmapDays = getDaysForHeatmap();
  const monthLabels = getMonthLabels(heatmapDays);
  const contributionsByDate = getContributionsByDateMap(contributions);

  // Group days into 53 columns (weeks)
  const columns: Date[][] = [];
  for (let i = 0; i < heatmapDays.length; i += 7) {
    columns.push(heatmapDays.slice(i, i + 7));
  }

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "fill-border-subtle hover:fill-border-default";
    if (count === 1) return "fill-accent/30 hover:fill-accent/40";
    if (count === 2) return "fill-accent/60 hover:fill-accent/70";
    return "fill-accent hover:fill-accent-hover";
  };

  // Filter contributions
  const filteredContributions = useMemo(() => {
    return contributions.filter((c) => {
      // 1. Heatmap Date Filter
      if (dateVal) {
        const d = c.date_completed || c.date_started;
        if (d !== dateVal) return false;
      }

      // 2. Text Search
      if (searchVal) {
        const query = searchVal.toLowerCase();
        const matchesTitle = c.title?.toLowerCase().includes(query);
        const matchesDesc = c.description?.toLowerCase().includes(query);
        const matchesTaskId = c.task_id?.toLowerCase().includes(query);
        const matchesChangeId = c.pr_or_change_id?.toLowerCase().includes(query);
        const matchesRepo = c.repository?.toLowerCase().includes(query);
        const matchesTags = c.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTaskId && !matchesChangeId && !matchesRepo && !matchesTags) {
          return false;
        }
      }

      // 3. Platform
      if (platformVal !== "all" && c.platform !== platformVal) return false;

      // 4. Status
      if (statusVal !== "all" && c.status !== statusVal) return false;

      return true;
    });
  }, [contributions, searchVal, platformVal, statusVal, dateVal]);

  const sortedFiltered = useMemo(() => {
    return [...filteredContributions].sort(
      (a, b) => new Date(b.date_started).getTime() - new Date(a.date_started).getTime()
    );
  }, [filteredContributions]);

  const clearFilters = () => {
    setSearchVal("");
    setPlatformVal("all");
    setStatusVal("all");
    setDateVal(null);
  };

  const isFiltered = searchVal || platformVal !== "all" || statusVal !== "all" || dateVal !== null;

  return (
    <div className="space-y-10">
      {/* Portfolio Hero Intro Section */}
      <section className="relative overflow-hidden rounded-2xl border border-border-default bg-surface p-8 sm:p-12 shadow-sm">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-status-open/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl flex-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent font-mono">
              <Sparkles className="h-3 w-3" />
              Open Source Journey Archive
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-primary leading-tight font-sans">
              Gautam Kumar Maurya
            </h1>
            <p className="text-base sm:text-lg text-secondary leading-relaxed font-normal">
              Welcome to my public contributions archive. Here, I chronicle my engineering journey across **Wikimedia, Gerrit, Phabricator, GitLab, and GitHub**. It maps out the code reviews, patches, community milestones, and technical retrospective lessons I've learned along the way.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://github.com/GKM563"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-border-subtle bg-surface-elevated text-xs font-semibold text-secondary hover:text-primary flex items-center gap-1.5 transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                GitHub Profile
              </a>
              <a
                href="https://phabricator.wikimedia.org/p/Gautam_Maurya/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg border border-border-subtle bg-surface-elevated text-xs font-semibold text-secondary hover:text-primary flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Wikimedia Profile
              </a>
              <a
                href="#timeline-section"
                className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-accent/20"
              >
                Explore Feed
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Avatar & Streak Column */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-6 shrink-0 w-full md:w-auto items-center">
            {/* Avatar with glowing ring */}
            <div className="relative group shrink-0">
              <div className="absolute inset-0.5 bg-gradient-to-tr from-accent to-status-open rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500" />
              <img
                src="https://github.com/GKM563.png"
                alt="Gautam Kumar Maurya"
                className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-surface object-cover shadow-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop";
                }}
              />
            </div>

            {/* Streak card */}
            <div className="bg-surface-elevated border border-border-default rounded-xl p-5 shrink-0 w-full sm:w-48 md:w-56 flex flex-col items-center justify-center text-center shadow-md relative group hover:border-accent/40 transition-all duration-300">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-primary">
                <CountUpComponent end={streaks.current} duration={2} /> Days
              </div>
              <p className="text-[10px] text-secondary mt-1 font-sans uppercase tracking-wider font-semibold">Active Streak</p>
              <div className="w-full border-t border-border-subtle mt-3 pt-3 flex justify-between text-[10px] text-secondary font-mono">
                <span>Longest:</span>
                <span className="font-semibold text-primary">{streaks.longest} days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Stats Strip (Portfolio Vibe) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-surface/50 border border-border-default rounded-2xl p-6 shadow-sm backdrop-blur-sm">
        {[
          { label: "Contributions Logged", count: totalContribs, icon: GitFork, color: "text-accent bg-accent/10" },
          { label: "Merged PRs / Changes", count: mergedPRs, icon: CheckCircle2, color: "text-status-merged bg-status-merged/10" },
          { label: "Pending Reviews / Open", count: underReview, icon: Clock, color: "text-status-open bg-status-open/10" },
          { label: "Milestones Unlocked", count: totalAchievements, icon: Trophy, color: "text-yellow-500 bg-yellow-500/10" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-4 lg:border-r border-border-subtle last:border-r-0 lg:pr-4"
            >
              <div className={`p-3 rounded-xl shrink-0 ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block truncate">{stat.label}</span>
                <span className="text-2xl font-black font-mono tracking-tight text-primary mt-1 block">
                  {loadingContribs ? (
                    "..."
                  ) : (
                    <CountUpComponent end={stat.count} duration={1.5} />
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Heatmap Area */}
      <section className="bg-surface border border-border-default rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-primary">Activity Heatmap</h2>
            <p className="text-xs text-secondary mt-0.5">Visualize contributions cadence and click dates to filter timeline</p>
          </div>
          <span className="text-[11px] text-secondary font-mono bg-surface-elevated border border-border-subtle px-2.5 py-1 rounded-md">
            {totalContribs} active events
          </span>
        </div>

        {/* Heatmap Grid Wrapper */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="min-w-[760px] flex flex-col">
            {/* Month labels on top */}
            <div className="flex h-5 text-[10px] font-mono text-secondary mb-1">
              <div className="w-8 shrink-0" />
              <div className="flex-1 relative h-full">
                {monthLabels.map((month, idx) => (
                  <div
                    key={idx}
                    className="absolute"
                    style={{ left: `${month.colIndex * 13 + 2}px` }}
                  >
                    {month.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Days + Grid */}
            <div className="flex">
              {/* Day Labels */}
              <div className="w-8 shrink-0 flex flex-col justify-between text-[9px] font-mono text-secondary pr-2 py-[2px] h-[82px] leading-none select-none">
                <span>Sun</span>
                <span>Tue</span>
                <span>Thu</span>
                <span>Sat</span>
              </div>

              {/* SVG Grid */}
              <svg width="741" height="82" className="overflow-visible">
                {columns.map((week, colIdx) => (
                  <g key={colIdx} transform={`translate(${colIdx * 13}, 0)`}>
                    {week.map((day, rowIdx) => {
                      const dateStr = day.toISOString().split("T")[0];
                      const dayContribs = contributionsByDate[dateStr] || [];
                      const count = dayContribs.length;
                      const isHighlighted = dateVal === dateStr;
                      return (
                        <rect
                          key={rowIdx}
                          x="0"
                          y={rowIdx * 12}
                          width="10"
                          height="10"
                          rx="2"
                          className={`transition-colors duration-150 cursor-pointer ${getHeatmapColor(count)} ${
                            isHighlighted ? "stroke-accent stroke-2" : ""
                          }`}
                          onClick={() => setDateVal(isHighlighted ? null : dateStr)}
                        >
                          <title>
                            {count} contribution{count !== 1 ? "s" : ""} on {formatLocalDate(dateStr)}
                          </title>
                        </rect>
                      );
                    })}
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-between text-xs text-secondary mt-4 pt-4 border-t border-border-subtle">
          <span className="text-[10px] font-mono text-secondary italic">
            Tip: click blocks to drill timeline.
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-[2px] bg-border-subtle" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-accent/30" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-accent/60" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-accent" />
            <span>More</span>
          </div>
        </div>
      </section>

      {/* Unified Timeline Journey Feed Section */}
      <section id="timeline-section" className="space-y-6 scroll-mt-20">
        <div className="border-b border-border-subtle pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-primary">Open Source Contributions Timeline</h2>
            <p className="text-xs text-secondary mt-0.5">A chronological catalog of my commits, code reviews, and merged changes.</p>
          </div>
        </div>

        {/* Interactive Filter Bar */}
        <div className="bg-surface border border-border-default rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-secondary" />
              <input
                type="text"
                placeholder="Search by title, description, repository, tags..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-border-subtle bg-surface-elevated text-sm text-primary placeholder-secondary focus:border-accent focus:outline-none transition-all"
              />
              {searchVal && (
                <button
                  onClick={() => setSearchVal("")}
                  className="absolute right-3.5 top-3.5 text-secondary hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Selector Grid */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              {/* Platform Selector */}
              <select
                value={platformVal}
                onChange={(e) => setPlatformVal(e.target.value)}
                className="px-3.5 py-3 rounded-xl border border-border-subtle bg-surface-elevated text-xs font-semibold text-primary focus:border-accent focus:outline-none transition-colors"
              >
                <option value="all">All Platforms</option>
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
                <option value="gerrit">Gerrit</option>
                <option value="wikimedia">Wikimedia</option>
                <option value="phabricator">Phabricator</option>
              </select>

              {/* Status Selector */}
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value)}
                className="px-3.5 py-3 rounded-xl border border-border-subtle bg-surface-elevated text-xs font-semibold text-primary focus:border-accent focus:outline-none transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="merged">Merged</option>
                <option value="open">Open</option>
                <option value="under_review">In Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Filter Status Pills Summary */}
          {isFiltered && (
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle text-xs">
              <div className="flex flex-wrap items-center gap-2 text-secondary">
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">Active filters:</span>
                {dateVal && (
                  <span className="bg-accent/10 border border-accent/20 text-accent px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-mono text-[11px]">
                    Date: {formatLocalDate(dateVal)}
                    <button onClick={() => setDateVal(null)}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {searchVal && (
                  <span className="bg-surface-elevated px-2.5 py-0.5 rounded-lg border border-border-subtle flex items-center gap-1 font-mono text-[11px]">
                    Query: "{searchVal}"
                    <button onClick={() => setSearchVal("")}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {platformVal !== "all" && (
                  <span className="bg-surface-elevated px-2.5 py-0.5 rounded-lg border border-border-subtle flex items-center gap-1 font-mono text-[11px] capitalize">
                    Platform: {platformVal}
                    <button onClick={() => setPlatformVal("all")}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {statusVal !== "all" && (
                  <span className="bg-surface-elevated px-2.5 py-0.5 rounded-lg border border-border-subtle flex items-center gap-1 font-mono text-[11px] capitalize">
                    Status: {statusVal.replace("_", " ")}
                    <button onClick={() => setStatusVal("all")}><X className="h-3 w-3" /></button>
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-accent hover:text-accent-hover font-bold transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Timeline Stream */}
        {loadingContribs ? (
          <div className="py-20 text-center text-secondary">Analyzing project history...</div>
        ) : sortedFiltered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border-default bg-surface rounded-2xl flex flex-col items-center justify-center p-8">
            <Info className="h-10 w-10 text-secondary mb-3" />
            <span className="text-sm font-semibold text-primary">No journey records match the filters</span>
            <p className="text-xs text-secondary mt-1 max-w-sm text-center">
              Try adjusting your query in the search bar or clear filters to view all entries.
            </p>
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 rounded-btn bg-accent text-white hover:bg-accent-hover text-xs font-semibold"
              >
                Reset Feed Filters
              </button>
            )}
          </div>
        ) : (
          <div className="relative border-l-2 border-border-subtle ml-4 pl-8 md:ml-8 md:pl-10 space-y-10 py-4">
            {sortedFiltered.map((c) => {
              const isExpanded = !!expandedIds[c.id];
              return (
                <div key={c.id} className="relative group/time">
                  {/* Circular Platform Badge directly on the Timeline Line */}
                  <div className="absolute -left-[46px] md:-left-[54px] top-2 z-10 transition-all duration-200 hover:scale-115">
                    <PlatformBadge platform={c.platform} showIconOnly className="h-8 w-8 rounded-full bg-surface border-border-default shadow-md" />
                  </div>

                  {/* Contribution Card - Changelog Post Styling */}
                  <div className="bg-surface border border-border-default rounded-2xl p-6 hover:border-accent/30 shadow-sm transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Meta Info */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-secondary">
                          <span className="font-bold text-primary">{c.repository}</span>
                          {c.pr_or_change_id && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-accent">#{c.pr_or_change_id}</span>
                            </>
                          )}
                          {c.task_id && (
                            <>
                              <span>·</span>
                              <span>Task: {c.task_id}</span>
                            </>
                          )}
                        </div>
                        
                        {/* Changelog Title */}
                        <Link
                          to={`/contributions/${c.id}`}
                          className="font-extrabold text-lg sm:text-xl text-primary hover:text-accent tracking-tight leading-snug block transition-colors"
                        >
                          {c.title}
                        </Link>
                      </div>

                      {/* Status and Date */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                        <StatusPill status={c.status} />
                        <span className="text-[11px] font-mono text-secondary">
                          {formatLocalDate(c.date_started)}
                        </span>
                      </div>
                    </div>

                    {/* Changelog Narrative Body */}
                    <p className="text-sm text-secondary leading-relaxed mt-4 font-normal font-sans">
                      {c.description}
                    </p>

                    {/* Metadata Summary & Expandable buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-border-subtle">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {c.tags &&
                          c.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 rounded-lg bg-surface-elevated border border-border-subtle text-[10px] font-mono text-secondary"
                            >
                              #{tag}
                            </span>
                          ))}
                        {c.time_spent_minutes > 0 && (
                          <span className="text-[10px] font-mono text-secondary flex items-center gap-1 bg-surface-elevated/40 border border-border-subtle/50 px-2 py-0.5 rounded-lg">
                            <Clock className="h-3 w-3" />
                            {c.time_spent_minutes}m
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Toggle Memory Accordion */}
                        <button
                          onClick={() => toggleExpand(c.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isExpanded
                              ? "bg-accent/10 border-accent/20 text-accent"
                              : "border-border-subtle text-secondary hover:text-primary hover:border-border-default"
                          }`}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          {isExpanded ? "Hide Lessons" : "Read Memory Note"}
                        </button>

                        {/* Full page audit link */}
                        <Link
                          to={`/contributions/${c.id}`}
                          className="text-secondary hover:text-accent p-2 rounded-xl hover:bg-surface-elevated transition-colors border border-border-subtle"
                          title="View Full record detail"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Expandable Memory System details */}
                    {isExpanded && (
                      <MemoryPanel
                        learningNoteId={c.learning_note_id}
                        dateCompleted={c.date_completed}
                        reviewers={c.reviewers || []}
                        reviewNotes={c.review_notes || []}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
