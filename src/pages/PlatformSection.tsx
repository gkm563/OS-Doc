import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useContributions,
  useGithubData,
  useGerritData,
  useGitlabData,
  useWikimediaData,
  usePhabricatorData,
} from "../hooks/useData";
import { PlatformBadge } from "../components/PlatformBadge";
import { formatLocalDate } from "../lib/dateUtils";
import { ExternalLink, RefreshCw, Layers } from "lucide-react";

export const PlatformSection: React.FC = () => {
  const { platform = "github" } = useParams<{ platform: string }>();
  const { data: contributions = [], isLoading: loadingContribs } = useContributions();

  // Load raw sync data based on platform
  const { data: githubRaw = [] } = useGithubData();
  const { data: gerritRaw = [] } = useGerritData();
  const { data: gitlabRaw = [] } = useGitlabData();
  const { data: wikiRaw = [] } = useWikimediaData();
  const { data: phabRaw = [] } = usePhabricatorData();

  // Normalize platform string
  const normalizedPlatform = platform.toLowerCase();

  // Filter contributions by platform
  const platformContributions = useMemo(() => {
    return contributions.filter((c) => c.platform === normalizedPlatform);
  }, [contributions, normalizedPlatform]);

  // Group into Kanban Columns
  const kanbanColumns = useMemo(() => {
    return {
      open: platformContributions.filter((c) => c.status === "open"),
      under_review: platformContributions.filter((c) => c.status === "under_review"),
      merged: platformContributions.filter((c) => c.status === "merged"),
      rejected: platformContributions.filter((c) => c.status === "rejected"),
    };
  }, [platformContributions]);

  // Get raw logs list for display
  const rawLogs = useMemo(() => {
    switch (normalizedPlatform) {
      case "github":
        return githubRaw.map((r) => ({
          id: r.number.toString(),
          title: r.title,
          sub: `${r.repository} · #${r.number}`,
          link: r.html_url,
          status: r.merged ? "merged" : r.state === "closed" ? "rejected" : "open",
          date: r.merged_at || r.created_at,
        }));
      case "gerrit":
        return gerritRaw.map((r) => ({
          id: r.change_id,
          title: r.subject,
          sub: `${r.project} · #${r.number}`,
          link: `https://gerrit.wikimedia.org/r/c/${r.project}/+/${r.number}`,
          status: r.status === "MERGED" ? "merged" : r.status === "ABANDONED" ? "rejected" : "under_review",
          date: r.updated || r.created,
        }));
      case "gitlab":
        return gitlabRaw.map((r) => ({
          id: r.iid.toString(),
          title: r.title,
          sub: `${r.project} · MR #${r.iid}`,
          link: r.web_url,
          status: r.state === "merged" ? "merged" : r.state === "closed" ? "rejected" : "under_review",
          date: r.created_at,
        }));
      case "wikipedia":
        return wikiRaw.map((r) => ({
          id: r.revid.toString(),
          title: r.page,
          sub: r.summary,
          link: r.comment || `https://en.wikipedia.org/wiki/Special:Diff/${r.revid}`,
          status: "merged",
          date: r.timestamp,
        }));
      case "phabricator":
        return phabRaw.map((r) => ({
          id: r.id,
          title: r.name,
          sub: `${r.projects.join(", ")} · Priority: ${r.priority}`,
          link: r.uri,
          status: r.status === "closed" || r.status === "resolved" ? "merged" : "open",
          date: new Date(r.dateCreated * 1000).toISOString(),
        }));
      default:
        return [];
    }
  }, [normalizedPlatform, githubRaw, gerritRaw, gitlabRaw, wikiRaw, phabRaw]);

  // Headers configs
  const platformName = useMemo(() => {
    if (normalizedPlatform === "wikipedia") return "Wikimedia Projects";
    return normalizedPlatform.charAt(0).toUpperCase() + normalizedPlatform.slice(1);
  }, [normalizedPlatform]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <PlatformBadge platform={normalizedPlatform as any} className="scale-110" />
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              {platformName} Hub
            </h1>
          </div>
          <p className="text-xs text-secondary">
            Visualizing Kanban workflow and automated sync details for {platformName} work.
          </p>
        </div>

        {/* Quick Platform Switcher Tabs */}
        <div className="flex flex-wrap gap-1 bg-surface border border-border-subtle p-1 rounded-lg">
          {["github", "gerrit", "gitlab", "wikimedia", "phabricator"].map((p) => {
            const label = p === "wikimedia" ? "Wikimedia" : p.charAt(0).toUpperCase() + p.slice(1);
            const pathName = p === "wikimedia" ? "wikipedia" : p;
            const isActive = normalizedPlatform === pathName;
            return (
              <Link
                key={p}
                to={`/platforms/${pathName}`}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                  isActive
                    ? "bg-accent text-white shadow-sm"
                    : "text-secondary hover:text-primary hover:bg-surface-elevated"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Kanban Board */}
      <section className="space-y-4">
        <div className="flex items-center gap-1.5">
          <Layers className="h-4.5 w-4.5 text-accent" />
          <h2 className="text-lg font-semibold text-primary">Contribution Workflow</h2>
        </div>

        {loadingContribs ? (
          <div className="py-12 text-center text-secondary">Loading workflow board...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Open Column */}
            <div className="bg-surface/50 border border-border-subtle rounded-xl p-4 flex flex-col space-y-4 min-h-[400px]">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">Open</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-elevated border border-border-subtle text-[10px] font-mono text-secondary">
                  {kanbanColumns.open.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {kanbanColumns.open.map((c) => (
                  <KanbanCard key={c.id} contribution={c} />
                ))}
              </div>
            </div>

            {/* 2. In Review Column */}
            <div className="bg-surface/50 border border-border-subtle rounded-xl p-4 flex flex-col space-y-4 min-h-[400px]">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">In Review</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-elevated border border-border-subtle text-[10px] font-mono text-secondary">
                  {kanbanColumns.under_review.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {kanbanColumns.under_review.map((c) => (
                  <KanbanCard key={c.id} contribution={c} />
                ))}
              </div>
            </div>

            {/* 3. Merged Column */}
            <div className="bg-surface/50 border border-border-subtle rounded-xl p-4 flex flex-col space-y-4 min-h-[400px]">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">Merged</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-elevated border border-border-subtle text-[10px] font-mono text-secondary">
                  {kanbanColumns.merged.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {kanbanColumns.merged.map((c) => (
                  <KanbanCard key={c.id} contribution={c} />
                ))}
              </div>
            </div>

            {/* 4. Closed Column */}
            <div className="bg-surface/50 border border-border-subtle rounded-xl p-4 flex flex-col space-y-4 min-h-[400px]">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">Rejected</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-elevated border border-border-subtle text-[10px] font-mono text-secondary">
                  {kanbanColumns.rejected.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {kanbanColumns.rejected.map((c) => (
                  <KanbanCard key={c.id} contribution={c} />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Sync bot raw logs */}
      <section className="bg-surface border border-border-default rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4.5 w-4.5 text-accent animate-spin-slow" />
            <div>
              <h2 className="text-sm font-semibold text-primary">Automated Sync Log</h2>
              <p className="text-[11px] text-secondary mt-0.5">Raw records fetched by sync pipeline scripts</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {rawLogs.length === 0 ? (
            <div className="text-xs text-secondary italic py-4">No sync records available.</div>
          ) : (
            rawLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border-subtle bg-surface-elevated/40 text-xs"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-primary truncate">{log.title}</span>
                  <span className="text-[11px] text-secondary font-mono truncate mt-0.5">{log.sub}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {log.link ? (
                    <a
                      href={log.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-surface-elevated border border-border-subtle text-secondary hover:text-primary transition-colors"
                      title="Open source patch"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                  <span className="text-[10px] font-mono text-secondary">
                    {formatLocalDate(log.date.split("T")[0])}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

// Internal Subcomponent Kanban Card
const KanbanCard: React.FC<{ contribution: any }> = ({ contribution: c }) => {
  return (
    <div className="bg-surface border border-border-default rounded-lg p-4 shadow-sm hover:border-accent/30 hover:shadow-md transition-all duration-150 group">
      <Link
        to={`/contributions/${c.id}`}
        className="font-medium text-xs text-primary group-hover:text-accent line-clamp-2 leading-snug tracking-tight"
      >
        {c.title}
      </Link>
      <p className="text-[10px] text-secondary line-clamp-2 mt-1.5 leading-relaxed">
        {c.description}
      </p>
      <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[9px] font-mono text-secondary">
        <span className="truncate max-w-[100px]">{c.repository}</span>
        <span>{c.date_completed ? formatLocalDate(c.date_completed) : formatLocalDate(c.date_started)}</span>
      </div>
    </div>
  );
};
