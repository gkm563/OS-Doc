import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useReviewers, useContributions } from "../hooks/useData";
import { PlatformBadge } from "../components/PlatformBadge";
import { formatLocalDate } from "../lib/dateUtils";
import {
  ArrowLeft,
  BookmarkCheck,
  CheckSquare,
  Square,
  ExternalLink,
} from "lucide-react";

export const ReviewerDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const { data: reviewers = [], isLoading: loadingReviewers } = useReviewers();
  const { data: contributions = [] } = useContributions();

  // Find reviewer
  const reviewer = reviewers.find((r) => r.name.toLowerCase() === name?.toLowerCase());

  // Filter contributions by reviewer
  const reviewerContributions = useMemo(() => {
    return contributions.filter((c) => c.reviewers?.includes(reviewer?.name || ""));
  }, [contributions, reviewer]);

  // Feedback categorization calculations
  const categoriesStats = useMemo(() => {
    if (!reviewer) return { process: 0, code_style: 0, domain_knowledge: 0, tooling: 0 };
    const stats = { process: 0, code_style: 0, domain_knowledge: 0, tooling: 0 };
    reviewer.feedback.forEach((f) => {
      if (f.category in stats) {
        stats[f.category as keyof typeof stats]++;
      }
    });
    return stats;
  }, [reviewer]);

  if (loadingReviewers) {
    return <div className="py-24 text-center text-secondary">Loading reviewer profile...</div>;
  }

  if (!reviewer) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-primary">Reviewer Not Found</h2>
        <p className="text-sm text-secondary">The reviewer "{name}" does not exist in the database.</p>
        <Link to="/reviewers" className="text-accent hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to reviewers list
        </Link>
      </div>
    );
  }

  const totalFeedback = reviewer.feedback.length;
  const internalizedCount = reviewer.feedback.filter((f) => f.internalized).length;
  const internalizationRate = totalFeedback > 0 ? Math.round((internalizedCount / totalFeedback) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/reviewers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-surface border border-border-default rounded-xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xl font-bold">
            {reviewer.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-primary">{reviewer.name}</h1>
            <div className="flex flex-wrap gap-1.5">
              {reviewer.platforms.map((platform) => (
                <PlatformBadge key={platform} platform={platform as any} />
              ))}
            </div>
          </div>
        </div>

        {/* Growth Metric */}
        <div className="bg-surface-elevated border border-border-default rounded-lg px-6 py-4 flex items-center gap-4 shrink-0 shadow-sm md:w-64">
          <div className="h-12 w-12 rounded-full bg-status-merged/10 text-status-merged flex items-center justify-center font-bold font-mono text-lg shrink-0">
            {internalizationRate}%
          </div>
          <div>
            <span className="text-[10px] text-secondary uppercase font-bold block leading-none">Internalization Rate</span>
            <span className="text-xs text-secondary mt-1 block">Feedback applied to commits</span>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Feedback Categories progress */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-semibold text-primary">Feedback Distribution</h3>

            <div className="space-y-4">
              {[
                { key: "code_style", label: "Code Style", count: categoriesStats.code_style, color: "bg-accent" },
                { key: "process", label: "Process & CI", count: categoriesStats.process, color: "bg-status-open" },
                { key: "domain_knowledge", label: "Domain Knowledge", count: categoriesStats.domain_knowledge, color: "bg-purple-500" },
                { key: "tooling", label: "Tooling & Tests", count: categoriesStats.tooling, color: "bg-status-pending" },
              ].map((category) => {
                const percent = totalFeedback > 0 ? Math.round((category.count / totalFeedback) * 100) : 0;
                return (
                  <div key={category.key} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-secondary">{category.label}</span>
                      <span className="text-primary font-mono font-semibold">
                        {category.count} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-surface-elevated border border-border-subtle rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${category.color}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assisted Contributions */}
          <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-primary mb-4">Assisted Contributions</h3>
            {reviewerContributions.length === 0 ? (
              <p className="text-xs text-secondary italic">No logged contributions reviewed by {reviewer.name}.</p>
            ) : (
              <div className="space-y-3">
                {reviewerContributions.map((c) => (
                  <Link
                    key={c.id}
                    to={`/contributions/${c.id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border-subtle hover:border-accent bg-surface-elevated/40 text-xs transition-colors group"
                  >
                    <span className="font-medium text-primary group-hover:text-accent truncate max-w-[180px]">
                      {c.title}
                    </span>
                    <ExternalLink className="h-3 w-3 text-secondary group-hover:text-accent shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Feedback checklists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-1.5">
            <BookmarkCheck className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-primary">Lessons Learned & Applied</h2>
          </div>

          <div className="space-y-4">
            {reviewer.feedback.length === 0 ? (
              <div className="py-12 text-center text-secondary text-xs italic bg-surface border border-border-default rounded-xl">
                No feedback items logged for this reviewer.
              </div>
            ) : (
              reviewer.feedback.map((f, idx) => (
                <div
                  key={idx}
                  className={`bg-surface border rounded-xl p-5 shadow-sm transition-all duration-150 flex gap-4 ${
                    f.internalized ? "border-status-merged/20 bg-status-merged/5" : "border-border-default"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {f.internalized ? (
                      <CheckSquare className="h-5 w-5 text-status-merged fill-current bg-background rounded" />
                    ) : (
                      <Square className="h-5 w-5 text-secondary" />
                    )}
                  </div>

                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono leading-none">
                      <span className="text-secondary">{formatLocalDate(f.date)}</span>
                      <span className="text-secondary">·</span>
                      <span className="uppercase text-accent font-semibold">{f.category.replace("_", " ")}</span>
                      <span className="text-secondary">·</span>
                      <span className={`px-2 py-0.5 rounded font-sans font-medium ${
                        f.internalized ? "bg-status-merged/10 text-status-merged" : "bg-status-pending/10 text-status-pending"
                      }`}>
                        {f.internalized ? "Applied & Internalized" : "Pending Application"}
                      </span>
                    </div>

                    <p className="text-sm text-primary leading-relaxed">
                      "{f.text}"
                    </p>

                    {f.applied_in && f.applied_in.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-2 text-xs">
                        <span className="text-secondary">Applied in:</span>
                        {f.applied_in.map((cId) => (
                          <Link
                            key={cId}
                            to={`/contributions/${cId}`}
                            className="inline-flex items-center gap-1 text-accent hover:underline font-medium font-mono"
                          >
                            {cId}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
