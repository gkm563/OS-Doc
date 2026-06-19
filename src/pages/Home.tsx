import { type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import { useContributions, useAchievements } from "../hooks/useData";
import { getDaysForHeatmap, getMonthLabels, getContributionsByDateMap, formatLocalDate } from "../lib/dateUtils";
import { StatusPill } from "../components/StatusPill";
import { PlatformBadge } from "../components/PlatformBadge";
import { Flame, Trophy, GitFork, CheckCircle2, ChevronRight, Sparkles, BookOpen } from "lucide-react";

// Fix ESM/CJS interop for react-countup where default export might be double-wrapped
const CountUpComponent = (typeof CountUp === "function" ? CountUp : (CountUp as any).default) as any;

export const Home: FC = () => {
  const navigate = useNavigate();
  const { data: contributions = [], isLoading: loadingContribs } = useContributions();
  const { data: achievements = [] } = useAchievements();

  // Metrics
  const totalContribs = contributions.length;
  const mergedPRs = contributions.filter((c) => c.status === "merged").length;
  const underReview = contributions.filter((c) => c.status === "under_review" || c.status === "open").length;
  const totalAchievements = achievements.length;

  // Streak Tracker (Duolingo-style)
  // Calculate current streak & longest streak
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

    // Sort ascending for longest streak calculation
    const ascDates = uniqueDates.map(d => new Date(d).getTime()).sort((a, b) => a - b);
    
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

  const recentContributions = [...contributions]
    .sort((a, b) => new Date(b.date_started).getTime() - new Date(a.date_started).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-border-default bg-surface p-8 sm:p-12 shadow-sm">
        {/* Glow Effects */}
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
            <p className="text-lg text-secondary leading-relaxed">
              Documenting, organizing, and preserving contributions across GitHub, Gerrit, GitLab, Wikimedia, and Phabricator. An open archive of learnings, code reviews, and milestones.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-btn bg-accent hover:bg-accent-hover text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-accent/25 hover:shadow-accent/35 transition-all duration-150"
              >
                Explore Dashboard
                <ChevronRight className="h-4 w-4" />
              </Link>
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
            <p className="text-xs text-secondary mt-1">Current Contribution Streak</p>
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
              <div className="text-3xl font-bold font-mono tracking-tight text-primary">
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
            <p className="text-xs text-secondary mt-0.5">Visualize contribution frequency over the past year</p>
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
              <div className="w-8 shrink-0" /> {/* empty corner */}
              <div className="flex-1 relative h-full">
                {monthLabels.map((month, idx) => (
                  <div
                    key={idx}
                    className="absolute"
                    style={{ left: `${(month.colIndex * 13) + 2}px` }}
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
                      return (
                        <rect
                          key={rowIdx}
                          x="0"
                          y={rowIdx * 12}
                          width="10"
                          height="10"
                          rx="2"
                          className={`transition-colors duration-150 cursor-pointer ${getHeatmapColor(count)}`}
                          onClick={() => navigate(`/timeline?date=${dateStr}`)}
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
          <Link to="/timeline" className="text-accent hover:text-accent-hover font-medium flex items-center gap-1">
            Browse Timeline historically
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
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

      {/* Grid: Recent Activity & Learning Journal Teaser */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {loadingContribs ? (
                <div className="text-center py-6 text-secondary text-sm">Loading activity...</div>
              ) : recentContributions.length === 0 ? (
                <div className="text-center py-6 text-secondary text-sm">No contributions logged.</div>
              ) : (
                recentContributions.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border-subtle hover:border-border-default bg-surface-elevated/40 hover:bg-surface-elevated transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <PlatformBadge platform={c.platform} showIconOnly className="shrink-0" />
                      <div className="min-w-0">
                        <Link
                          to={`/contributions/${c.id}`}
                          className="font-medium text-sm text-primary hover:text-accent truncate block"
                        >
                          {c.title}
                        </Link>
                        <span className="text-xs text-secondary font-mono truncate block mt-0.5">
                          {c.repository} {c.pr_or_change_id ? `· ${c.pr_or_change_id}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusPill status={c.status} />
                      <span className="hidden sm:inline-block text-[11px] font-mono text-secondary">
                        {formatLocalDate(c.date_started)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border-subtle flex justify-end">
            <Link to="/contributions" className="text-accent hover:text-accent-hover text-sm font-medium flex items-center gap-1">
              View all contributions
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Learning Journal Teaser */}
        <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary mb-2">Learning Journal</h2>
            <p className="text-xs text-secondary mb-4">Capturing reviewer feedback, mistakes, and solutions.</p>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-dashed border-border-default bg-surface-elevated/20 flex flex-col items-center justify-center text-center py-8">
                <BookOpen className="h-8 w-8 text-accent mb-3" />
                <span className="text-sm font-semibold text-primary">Compounding Knowledge</span>
                <span className="text-xs text-secondary mt-1">Read Gautam's notes and applied reviews.</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border-subtle">
            <Link to="/journal" className="text-accent hover:text-accent-hover text-sm font-medium flex items-center gap-1 justify-center">
              Open Learning Journal
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
