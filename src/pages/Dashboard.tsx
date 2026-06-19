import React, { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useContributions } from "../hooks/useData";
import { StatusPill } from "../components/StatusPill";
import { PlatformBadge } from "../components/PlatformBadge";
import { formatLocalDate } from "../lib/dateUtils";
import { Search, Database, CheckCircle2, AlertCircle, X, Archive, HelpCircle } from "lucide-react";

export const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: contributions = [], isLoading } = useContributions();

  // URL States
  const searchVal = searchParams.get("q") || "";
  const platformVal = searchParams.get("platform") || "all";
  const statusVal = searchParams.get("status") || "all";
  const repoVal = searchParams.get("repo") || "all";
  const timeVal = searchParams.get("time") || "all";

  // Available Filter Options
  const repositories = useMemo(() => {
    const repos = new Set(contributions.map((c) => c.repository).filter(Boolean));
    return Array.from(repos);
  }, [contributions]);

  // Update query params helper
  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all" || value === "") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const isFiltered = searchVal || platformVal !== "all" || statusVal !== "all" || repoVal !== "all" || timeVal !== "all";

  // Filtered contributions list
  const filteredContributions = useMemo(() => {
    return contributions.filter((c) => {
      // 1. Text Search
      if (searchVal) {
        const query = searchVal.toLowerCase();
        const matchesTitle = c.title?.toLowerCase().includes(query);
        const matchesDesc = c.description?.toLowerCase().includes(query);
        const matchesTaskId = c.task_id?.toLowerCase().includes(query);
        const matchesChangeId = c.pr_or_change_id?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesTaskId && !matchesChangeId) {
          return false;
        }
      }

      // 2. Platform
      if (platformVal !== "all") {
        if (c.platform !== platformVal) return false;
      }

      // 3. Status
      if (statusVal !== "all") {
        if (c.status !== statusVal) return false;
      }

      // 4. Repository
      if (repoVal !== "all") {
        if (c.repository !== repoVal) return false;
      }

      // 5. Time Range
      if (timeVal !== "all") {
        const date = new Date(c.date_completed || c.date_started);
        const now = new Date();
        if (timeVal === "month") {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          if (date < oneMonthAgo) return false;
        } else if (timeVal === "year") {
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          if (date < oneYearAgo) return false;
        }
      }

      return true;
    });
  }, [contributions, searchVal, platformVal, statusVal, repoVal, timeVal]);

  // Metrics summary calculated from the CURRENT FILTERED list
  const metrics = useMemo(() => {
    const total = filteredContributions.length;
    const merged = filteredContributions.filter((c) => c.status === "merged").length;
    const review = filteredContributions.filter((c) => c.status === "under_review" || c.status === "open").length;
    const rejected = filteredContributions.filter((c) => c.status === "rejected").length;
    return { total, merged, review, rejected };
  }, [filteredContributions]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Contributions Dashboard</h1>
        <p className="text-xs text-secondary mt-1">Compound query engine for all open source work logs.</p>
      </div>

      {/* Metrics section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Matches Found", count: metrics.total, icon: Database, color: "text-accent bg-accent/10 border-accent/20" },
          { label: "Merged", count: metrics.merged, icon: CheckCircle2, color: "text-status-merged bg-status-merged/10 border-status-merged/20" },
          { label: "Pending Review", count: metrics.review, icon: HelpCircle, color: "text-status-open bg-status-open/10 border-status-open/20" },
          { label: "Closed / Rejected", count: metrics.rejected, icon: AlertCircle, color: "text-status-rejected bg-status-rejected/10 border-status-rejected/20" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`bg-surface border rounded-xl p-5 flex items-center justify-between shadow-sm border-border-default`}
            >
              <div>
                <span className="text-xs text-secondary">{item.label}</span>
                <div className="text-2xl font-bold font-mono tracking-tight text-primary mt-2">
                  {isLoading ? "..." : metrics.total === 0 ? 0 : item.count}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${item.color.split(" ").slice(0, 2).join(" ")}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </section>

      {/* Filters Area */}
      <section className="bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Text Search Box */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-secondary" />
            <input
              type="text"
              placeholder="Search by title, description, task ID..."
              value={searchVal}
              onChange={(e) => updateParam("q", e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-btn border border-border-subtle bg-surface-elevated text-sm text-primary placeholder-secondary focus:border-accent focus:outline-none transition-colors duration-150"
            />
            {searchVal && (
              <button
                onClick={() => updateParam("q", "")}
                className="absolute right-3 top-3 text-secondary hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Preset Filters Select grids */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            {/* Platform Select */}
            <div className="flex flex-col">
              <select
                value={platformVal}
                onChange={(e) => updateParam("platform", e.target.value)}
                className="px-3 py-2.5 rounded-btn border border-border-subtle bg-surface-elevated text-xs font-medium text-primary hover:border-border-default focus:border-accent focus:outline-none transition-colors duration-150"
              >
                <option value="all">All Platforms</option>
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
                <option value="gerrit">Gerrit</option>
                <option value="wikimedia">Wikimedia</option>
                <option value="phabricator">Phabricator</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="flex flex-col">
              <select
                value={statusVal}
                onChange={(e) => updateParam("status", e.target.value)}
                className="px-3 py-2.5 rounded-btn border border-border-subtle bg-surface-elevated text-xs font-medium text-primary hover:border-border-default focus:border-accent focus:outline-none transition-colors duration-150"
              >
                <option value="all">All Statuses</option>
                <option value="merged">Merged</option>
                <option value="open">Open</option>
                <option value="under_review">In Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Repository Select */}
            <div className="flex flex-col">
              <select
                value={repoVal}
                onChange={(e) => updateParam("repo", e.target.value)}
                className="px-3 py-2.5 rounded-btn border border-border-subtle bg-surface-elevated text-xs font-medium text-primary hover:border-border-default focus:border-accent focus:outline-none max-w-[150px] sm:max-w-none truncate transition-colors duration-150"
              >
                <option value="all">All Repos</option>
                {repositories.map((repo) => (
                  <option key={repo} value={repo}>
                    {repo}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe Select */}
            <div className="flex flex-col">
              <select
                value={timeVal}
                onChange={(e) => updateParam("time", e.target.value)}
                className="px-3 py-2.5 rounded-btn border border-border-subtle bg-surface-elevated text-xs font-medium text-primary hover:border-border-default focus:border-accent focus:outline-none transition-colors duration-150"
              >
                <option value="all">All Time</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clear Filters Panel */}
        {isFiltered && (
          <div className="flex items-center justify-between pt-4 border-t border-border-subtle text-xs">
            <div className="flex flex-wrap items-center gap-2 text-secondary">
              <span>Active filters:</span>
              {searchVal && <span className="bg-surface-elevated px-2 py-1 rounded border border-border-subtle">Search: "{searchVal}"</span>}
              {platformVal !== "all" && <span className="bg-surface-elevated px-2 py-1 rounded border border-border-subtle">Platform: {platformVal}</span>}
              {statusVal !== "all" && <span className="bg-surface-elevated px-2 py-1 rounded border border-border-subtle">Status: {statusVal}</span>}
              {repoVal !== "all" && <span className="bg-surface-elevated px-2 py-1 rounded border border-border-subtle truncate max-w-[120px]">Repo: {repoVal}</span>}
              {timeVal !== "all" && <span className="bg-surface-elevated px-2 py-1 rounded border border-border-subtle">Time: {timeVal}</span>}
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-accent hover:text-accent-hover font-medium transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* Contributions grid */}
      <section>
        {isLoading ? (
          <div className="py-24 text-center text-secondary">Loading contributions database...</div>
        ) : filteredContributions.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-border-default bg-surface rounded-xl flex flex-col items-center justify-center p-8">
            <Archive className="h-10 w-10 text-secondary mb-3" />
            <span className="text-sm font-semibold text-primary">No contributions match your filters</span>
            <p className="text-xs text-secondary mt-1 max-w-sm text-center">
              Try adjusting your text search query or selections in the filter panel.
            </p>
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 rounded-btn bg-accent text-white hover:bg-accent-hover text-xs font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContributions.map((c) => (
              <div
                key={c.id}
                className="bg-surface border border-border-default rounded-xl p-6 shadow-sm hover:border-accent/30 flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <PlatformBadge platform={c.platform} />
                    <StatusPill status={c.status} />
                  </div>
                  <Link
                    to={`/contributions/${c.id}`}
                    className="text-base font-semibold text-primary hover:text-accent line-clamp-2 block tracking-tight leading-snug group-hover:text-accent transition-colors"
                  >
                    {c.title}
                  </Link>
                  <p className="text-xs text-secondary line-clamp-3 mt-2.5 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-secondary">
                    <span>Repo:</span>
                    <span className="text-primary truncate max-w-[180px] font-medium">{c.repository}</span>
                  </div>
                  {c.pr_or_change_id && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-secondary">
                      <span>PR/Change ID:</span>
                      <span className="text-primary font-medium">#{c.pr_or_change_id}</span>
                    </div>
                  )}
                  {c.task_id && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-secondary">
                      <span>Task ID:</span>
                      <span className="text-primary font-medium">{c.task_id}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] font-mono text-secondary mt-1">
                    <span>Date:</span>
                    <span>{formatLocalDate(c.date_started)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
