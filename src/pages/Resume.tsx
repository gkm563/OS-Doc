import React, { useMemo } from "react";
import { useContributions, useAchievements } from "../hooks/useData";
import { formatLocalDate } from "../lib/dateUtils";
import { Printer, Mail, GitBranch, Globe, CheckCircle2 } from "lucide-react";

export const Resume: React.FC = () => {
  const { data: contributions = [] } = useContributions();
  const { data: achievements = [] } = useAchievements();

  // Aggregate resume values
  const totalMerged = contributions.filter((c) => c.status === "merged").length;
  
  // Get top 4 contributions based on duration or relevance (represented by manual logs)
  const featuredContributions = useMemo(() => {
    return contributions.slice(0, 4);
  }, [contributions]);

  // Trigger browser print dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action panel (Hidden on print) */}
      <div className="no-print bg-surface border border-border-default rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-primary">Export Portfolio CV</h2>
          <p className="text-xs text-secondary mt-0.5">
            Generate a clean, professional, print-friendly resume of your open source logs.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-accent/25 hover:shadow-accent/35 transition-all duration-150"
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
      </div>

      {/* Printable Resume Container */}
      <article className="bg-white text-slate-900 border border-slate-200 rounded-xl p-8 sm:p-12 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 font-sans">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b-2 border-slate-900 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Gautam Kumar Maurya</h1>
            <p className="text-sm font-semibold text-accent font-mono uppercase tracking-wider mt-1">Open Source Engineer</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-3 font-mono">
              <span className="flex items-center gap-1">
                <GitBranch className="h-3.5 w-3.5" />
                github.com/GKM563
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                gautam.m@example.com
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                gkm563.netlify.app
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right font-mono text-xs text-slate-500">
            <span>Portfolio Code Summary</span>
            <br />
            <span>Generated: {new Date().toLocaleDateString()}</span>
          </div>
        </header>

        {/* Section: Overview Metrics */}
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-4 font-mono">
            Open Source Performance Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Contributions</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-1 block">{contributions.length}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Merged Commits</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-1 block">{totalMerged}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Repositories</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-1 block">
                {Array.from(new Set(contributions.map((c) => c.repository))).length}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Achievements</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-1 block">{achievements.length}</span>
            </div>
          </div>
        </section>

        {/* Section: Featured Contributions */}
        <section className="mb-8 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-4 font-mono">
            Featured Code Contributions & Merges
          </h2>
          <div className="space-y-6">
            {featuredContributions.map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-sm font-bold text-slate-950 leading-snug">
                    {c.title}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 shrink-0">
                    {formatLocalDate(c.date_started)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                  <span className="uppercase text-slate-800 font-semibold">{c.platform}</span>
                  <span>·</span>
                  <span>{c.repository}</span>
                  {c.pr_or_change_id && (
                    <>
                      <span>·</span>
                      <span>#{c.pr_or_change_id}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  {c.description}
                </p>
                {c.review_notes && c.review_notes.length > 0 && (
                  <div className="pl-3 border-l border-slate-300 text-[11px] text-slate-600 mt-1">
                    <span className="font-semibold block">Internalized Feedback:</span>
                    <span>"{c.review_notes[0]}"</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Grid: Achievements & Platforms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-break-inside-avoid">
          {/* Achievements Unlocked */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-4 font-mono">
              Key Achievements
            </h2>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex gap-2 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-950 block">{achievement.title}</span>
                    <span className="text-slate-600">{achievement.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* About Platform Profiles */}
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-950 border-b border-slate-200 pb-1 mb-4 font-mono">
              Platform Distribution
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed mb-4">
              Regular contributor to universal translation tables, i18n configurations, localized components, and client-side rendering pipeline components.
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span>Gerrit Code Review:</span>
                <span className="font-bold">Active Patchset Submitter</span>
              </div>
              <div className="flex justify-between">
                <span>GitHub Repositories:</span>
                <span className="font-bold">Contributor & Tester</span>
              </div>
              <div className="flex justify-between">
                <span>Wikipedia & Translate:</span>
                <span className="font-bold">Verified Editor</span>
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
};
