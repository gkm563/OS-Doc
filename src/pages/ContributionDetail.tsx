import React from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useContributions, useJournalEntry } from "../hooks/useData";
import { StatusPill } from "../components/StatusPill";
import { PlatformBadge } from "../components/PlatformBadge";
import { formatLocalDate } from "../lib/dateUtils";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Clock,
  Code2,
  FileText,
  User,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  FolderGit2,
} from "lucide-react";

export const ContributionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: contributions = [], isLoading: loadingContribs } = useContributions();

  // Find contribution
  const c = contributions.find((item) => item.id === id);

  // Fetch linked journal entry (if exists, e.g. using complete date or manual id)
  // Let's fallback to using completed date if learning_note_id is present
  const journalDate = c?.learning_note_id?.replace("j_", "") || c?.date_completed;
  const { data: journalContent = "", isLoading: loadingJournal } = useJournalEntry(journalDate);

  if (loadingContribs) {
    return <div className="py-24 text-center text-secondary">Loading contribution record...</div>;
  }

  if (!c) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-primary">Contribution Record Not Found</h2>
        <p className="text-sm text-secondary">The requested ID "{id}" does not exist in the database.</p>
        <Link to="/contributions" className="text-accent hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to contributions database
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/contributions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Database
        </Link>
      </div>

      {/* Title Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-border-subtle pb-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <PlatformBadge platform={c.platform} />
            <StatusPill status={c.status} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary leading-tight">
            {c.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-secondary">
            <span className="flex items-center gap-1">
              <FolderGit2 className="h-3.5 w-3.5" />
              {c.repository}
            </span>
            {c.pr_or_change_id && <span>· PR/Change: #{c.pr_or_change_id}</span>}
            {c.task_id && <span>· Task: {c.task_id}</span>}
          </div>
        </div>

        {c.links && c.links.length > 0 && (
          <a
            href={c.links[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-md shadow-accent/25 hover:shadow-accent/35 transition-all duration-150 self-start"
          >
            Audit Source PR/Change
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Main Dual-pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metadata & Details Panel */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-semibold text-primary">Metadata Details</h3>

            {/* Timestamps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Date Started:
                </span>
                <span className="font-mono text-primary font-medium">{formatLocalDate(c.date_started)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Date Completed:
                </span>
                <span className="font-mono text-primary font-medium">
                  {c.date_completed ? formatLocalDate(c.date_completed) : "Active (In Progress)"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Time Invested:
                </span>
                <span className="font-mono text-primary font-medium">{c.time_spent_minutes} minutes</span>
              </div>
            </div>

            {/* Tags */}
            {c.tags && c.tags.length > 0 && (
              <div className="pt-4 border-t border-border-subtle">
                <span className="text-xs font-medium text-secondary block mb-2">Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle text-[10px] font-mono text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links Rail */}
            {c.links && c.links.length > 0 && (
              <div className="pt-4 border-t border-border-subtle">
                <span className="text-xs font-medium text-secondary block mb-2">Reference Links:</span>
                <div className="space-y-1.5">
                  {c.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{link}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Open Source Memory System */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-lg font-semibold text-primary">Open Source Memory System</h2>
            <p className="text-xs text-secondary mt-0.5">Capturing the complete context, reviews, and applied learnings.</p>
          </div>

          {/* Q1: What happened? */}
          <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
              <FileText className="h-4.5 w-4.5 text-accent" />
              What happened & Why?
            </h4>
            <p className="text-sm text-secondary leading-relaxed pl-6.5">
              {c.description}
            </p>
          </div>

          {/* Q2 & Q3: Which task & Reviewer? */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task */}
            <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                <Code2 className="h-4.5 w-4.5 text-accent" />
                Which task & Repository?
              </h4>
              <div className="space-y-2 pl-6.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-secondary">Repository:</span>
                  <span className="font-mono text-primary">{c.repository}</span>
                </div>
                {c.task_id && (
                  <div className="flex justify-between">
                    <span className="text-secondary">Task ID:</span>
                    {c.platform === "phabricator" || c.platform === "gerrit" || c.platform === "wikipedia" ? (
                      <a
                        href={`https://phabricator.wikimedia.org/${c.task_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-accent hover:underline"
                      >
                        {c.task_id}
                      </a>
                    ) : (
                      <span className="font-mono text-primary">{c.task_id}</span>
                    )}
                  </div>
                )}
                {c.pr_or_change_id && (
                  <div className="flex justify-between">
                    <span className="text-secondary">Pull / Change ID:</span>
                    <span className="font-mono text-primary">#{c.pr_or_change_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reviewer */}
            <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                <User className="h-4.5 w-4.5 text-accent" />
                Which reviewer?
              </h4>
              <div className="pl-6.5 space-y-2">
                {c.reviewers && c.reviewers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {c.reviewers.map((reviewer) => (
                      <Link
                        key={reviewer}
                        to={`/reviewers/${reviewer}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-elevated border border-border-subtle text-xs text-primary hover:border-accent transition-colors"
                      >
                        <User className="h-3 w-3 text-secondary" />
                        <span>{reviewer}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-secondary italic">No reviewers assigned.</span>
                )}
              </div>
            </div>
          </div>

          {/* Reviewer Notes / Feedback */}
          {c.review_notes && c.review_notes.length > 0 && (
            <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                <HelpCircle className="h-4.5 w-4.5 text-accent" />
                Reviewer feedback received:
              </h4>
              <ul className="pl-6.5 list-disc space-y-2 text-sm text-secondary">
                {c.review_notes.map((note, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Linked Journal Entry: What was learned & solved */}
          <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4">
              <Lightbulb className="h-4.5 w-4.5 text-accent" />
              What was learned & How were problems solved?
            </h4>
            <div className="pl-6.5">
              {loadingJournal ? (
                <div className="text-xs text-secondary">Loading learning records...</div>
              ) : journalContent ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-secondary leading-relaxed space-y-3">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {journalContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-xs text-secondary italic flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-status-pending" />
                  No matching learning journal entry linked for this contribution.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
