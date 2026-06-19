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
    <div className="mt-4 pt-4 border-t border-border-subtle space-y-4 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reviewers info */}
        <div className="space-y-1.5">
          <span className="text-secondary font-mono block text-[10px] uppercase tracking-wider">Reviewers</span>
          {reviewers && reviewers.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {reviewers.map((r) => (
                <Link
                  key={r}
                  to={`/reviewers/${r}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-elevated border border-border-subtle hover:border-accent transition-colors"
                >
                  <User className="h-3 w-3 text-secondary" />
                  <span>{r}</span>
                </Link>
              ))}
            </div>
          ) : (
            <span className="text-secondary italic">No reviewers assigned.</span>
          )}
        </div>

        {/* Reviewer Feedback Notes */}
        <div className="space-y-1.5">
          <span className="text-secondary font-mono block text-[10px] uppercase tracking-wider">Feedback Highlights</span>
          {reviewNotes && reviewNotes.length > 0 ? (
            <div className="space-y-1 bg-surface-elevated/40 border border-border-subtle p-2.5 rounded-lg">
              <span className="text-primary font-semibold flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-accent" />
                Reviewer Notes:
              </span>
              <ul className="list-disc pl-4.5 space-y-1 text-secondary leading-relaxed font-sans">
                {reviewNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          ) : (
            <span className="text-secondary italic">No direct notes logged.</span>
          )}
        </div>
      </div>

      {/* Lessons Learned Journal Markdown */}
      <div className="space-y-1 bg-surface-elevated/20 border border-dashed border-border-default p-3 rounded-lg">
        <span className="text-primary font-semibold flex items-center gap-1.5 mb-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-accent" />
          Technical Learnings & Solutions:
        </span>
        {isLoading ? (
          <div className="text-secondary italic">Loading learning entries...</div>
        ) : journalContent ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-secondary leading-relaxed space-y-2 font-sans">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {sanitizedMarkdown}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-secondary italic flex items-center gap-1 text-[11px]">
            <AlertTriangle className="h-3.5 w-3.5 text-status-pending" />
            No detailed learning notes link configured.
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
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-border-default bg-surface p-8 sm:p-12 shadow-sm">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-status-open/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent font-mono">
              <Sparkles className="h-3 w-3" />
              Open Source Journey
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary leading-tight">
              Gautam Kumar Maurya
            </h1>
            <p className="text-lg text-secondary leading-relaxed font-normal">
              Documenting, organizing, and preserving contributions across GitHub, Gerrit, GitLab, Wikimedia, and Phabricator. An open archive of learnings, code reviews, and milestones.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#timeline-section"
                className="px-5 py-2.5 rounded-btn bg-accent hover:bg-accent-hover text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-accent/25 hover:shadow-accent/35 transition-all duration-150"
              >
                Browse Timeline Feed
                <ChevronRight className="h-4 w-4" />
              </a>
              <Link
                to="/resume"
                className="px-5 py-2.5 rounded-btn border border-border-default bg-surface hover:bg-surface-elevated text-primary font-medium text-sm transition-all duration-150"
              >
                View Professional CV
              </Link>
            </div>
          </div>

          {/* Quick Streak Card */}
          <div className="bg-surface-elevated border border-border-default rounded-xl p-6 shrink-0 w-full md:w-72 flex flex-col items-center justify-center text-center shadow-md relative group hover:border-accent/40 transition-all duration-300">
            <div className="h-12 w-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <Flame className="h-6 w-6 fill-current" />
            </div>
            <div className="text-3xl font-bold font-mono tracking-tight text-primary">
              <CountUpComponent end={streaks.current} duration={2} /> Days
            </div>
            <p className="text-xs text-secondary mt-1 font-sans">Current Contribution Streak</p>
            <div className="w-full border-t border-border-subtle mt-4 pt-4 flex justify-between text-xs text-secondary font-mono">
              <span>Longest streak:</span>
              <span className="font-semibold text-primary">{streaks.longest} days</span>
            </div>
          </div>
        </div>
      </section>

      {/* Counters Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Contributions", count: totalContribs, icon: GitFork, color: "text-accent bg-accent/10" },
          { label: "Merged PRs / Changes", count: mergedPRs, icon: CheckCircle2, color: "text-status-merged bg-status-merged/10" },
          { label: "Open Reviews / Tasks", count: underReview, icon: GitFork, color: "text-status-open bg-status-open/10" },
          { label: "Milestones Unlocked", count: totalAchievements, icon: Trophy, color: "text-yellow-500 bg-yellow-500/10" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-surface border border-border-default rounded-xl p-6 flex flex-col justify-between shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-secondary">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-bold font-mono tracking-tight text-primary mt-2">
                {loadingContribs ? (
                  "..."
                ) : (
                  <CountUpComponent end={stat.count} duration={1.5} />
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Heatmap Area */}
      <section className="bg-surface border border-border-default rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-primary">Contribution Heatmap</h2>
            <p className="text-xs text-secondary mt-0.5">Visualize consistency and click blocks to filter timeline by specific dates</p>
          </div>
          <span className="text-[11px] text-secondary font-mono">
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
            Tip: click any block to filter feed below.
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
        <div className="border-b border-border-subtle pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-primary">Timeline Journey Feed</h2>
          <p className="text-xs text-secondary mt-1">Chronological catalog of Gautam's contributions, tasks, and commits.</p>
        </div>

        {/* Interactive Filter Bar */}
        <div className="bg-surface border border-border-default rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Box */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-secondary" />
              <input
                type="text"
                placeholder="Search by title, description, repository, tags..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-btn border border-border-subtle bg-surface-elevated text-sm text-primary placeholder-secondary focus:border-accent focus:outline-none transition-all"
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
                className="px-3.5 py-3 rounded-btn border border-border-subtle bg-surface-elevated text-xs font-semibold text-primary focus:border-accent focus:outline-none transition-colors"
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
                className="px-3.5 py-3 rounded-btn border border-border-subtle bg-surface-elevated text-xs font-semibold text-primary focus:border-accent focus:outline-none transition-colors"
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
                <span className="font-mono text-[10px] uppercase tracking-wider">Active filters:</span>
                {dateVal && (
                  <span className="bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded flex items-center gap-1 font-mono text-[11px]">
                    Date: {formatLocalDate(dateVal)}
                    <button onClick={() => setDateVal(null)}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {searchVal && (
                  <span className="bg-surface-elevated px-2 py-0.5 rounded border border-border-subtle flex items-center gap-1 font-mono text-[11px]">
                    Query: "{searchVal}"
                    <button onClick={() => setSearchVal("")}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {platformVal !== "all" && (
                  <span className="bg-surface-elevated px-2 py-0.5 rounded border border-border-subtle flex items-center gap-1 font-mono text-[11px] capitalize">
                    Platform: {platformVal}
                    <button onClick={() => setPlatformVal("all")}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {statusVal !== "all" && (
                  <span className="bg-surface-elevated px-2 py-0.5 rounded border border-border-subtle flex items-center gap-1 font-mono text-[11px] replace-dash text-ellipsis">
                    Status: {statusVal.replace("_", " ")}
                    <button onClick={() => setStatusVal("all")}><X className="h-3 w-3" /></button>
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-accent hover:text-accent-hover font-semibold transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Timeline Stream */}
        {loadingContribs ? (
          <div className="py-20 text-center text-secondary">Loading timeline database...</div>
        ) : sortedFiltered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border-default bg-surface rounded-xl flex flex-col items-center justify-center p-8">
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
          <div className="relative border-l-2 border-border-subtle ml-4 pl-6 md:ml-8 md:pl-8 space-y-8 py-2">
            {sortedFiltered.map((c) => {
              const isExpanded = !!expandedIds[c.id];
              return (
                <div key={c.id} className="relative group/time">
                  {/* Vertical Timeline Node Dot */}
                  <div
                    className={`absolute -left-[31px] md:-left-[39px] top-2 h-4.5 w-4.5 rounded-full border-2 bg-background transition-all duration-150 flex items-center justify-center ${
                      c.status === "merged"
                        ? "border-status-merged text-status-merged"
                        : c.status === "rejected"
                        ? "border-status-rejected text-status-rejected"
                        : "border-status-open text-status-open"
                    }`}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        c.status === "merged"
                          ? "bg-status-merged"
                          : c.status === "rejected"
                          ? "bg-status-rejected"
                          : "bg-status-open"
                      }`}
                    />
                  </div>

                  {/* Contribution Card */}
                  <div className="bg-surface border border-border-default rounded-xl p-5 hover:border-accent/40 shadow-sm transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Platform & Title */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <PlatformBadge platform={c.platform} />
                          <span className="text-[11px] font-mono text-secondary">
                            {c.repository} {c.pr_or_change_id ? `· #${c.pr_or_change_id}` : ""}
                          </span>
                        </div>
                        <Link
                          to={`/contributions/${c.id}`}
                          className="font-bold text-base sm:text-lg text-primary hover:text-accent tracking-tight leading-snug block transition-colors"
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

                    {/* Description summary */}
                    <p className="text-xs sm:text-sm text-secondary leading-relaxed mt-3.5 font-normal">
                      {c.description}
                    </p>

                    {/* Metadata summary (time, tags, buttons) */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-border-subtle">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {c.tags &&
                          c.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle text-[10px] font-mono text-secondary"
                            >
                              {tag}
                            </span>
                          ))}
                        {c.time_spent_minutes > 0 && (
                          <span className="text-[10px] font-mono text-secondary flex items-center gap-1 bg-surface-elevated/40 border border-border-subtle/50 px-2 py-0.5 rounded">
                            <Clock className="h-3 w-3" />
                            {c.time_spent_minutes}m
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Toggle Memory Accordion */}
                        <button
                          onClick={() => toggleExpand(c.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold border transition-all ${
                            isExpanded
                              ? "bg-accent/10 border-accent/20 text-accent"
                              : "border-border-subtle text-secondary hover:text-primary hover:border-border-default"
                          }`}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          {isExpanded ? "Close Memory" : "Read Memory"}
                        </button>

                        {/* Full page audit link */}
                        <Link
                          to={`/contributions/${c.id}`}
                          className="text-secondary hover:text-accent p-1.5 rounded-md hover:bg-surface-elevated transition-colors"
                          title="Full Record details"
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
