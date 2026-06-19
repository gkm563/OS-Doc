import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import { useContributions, useJournalEntry } from "../hooks/useData";
import { formatLocalDate } from "../lib/dateUtils";
import { BookOpen, Calendar, ChevronRight, PenTool } from "lucide-react";

export const LearningJournal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: contributions = [], isLoading: loadingContribs } = useContributions();

  // Aggregate all unique journal dates from contributions
  const journalEntries = useMemo(() => {
    const list: { id: string; date: string; title: string; tags: string[] }[] = [];
    const datesSeen = new Set<string>();

    contributions.forEach((c) => {
      if (c.learning_note_id) {
        const dateStr = c.learning_note_id.replace("j_", "");
        if (!datesSeen.has(dateStr)) {
          datesSeen.add(dateStr);
          list.push({
            id: c.learning_note_id,
            date: dateStr,
            title: `Journal Note: ${formatLocalDate(dateStr)}`,
            tags: c.tags,
          });
        }
      }
    });

    // Sort descending
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [contributions]);

  // Selected date
  const selectedDate = searchParams.get("date") || journalEntries[0]?.date || null;
  const { data: journalContent = "", isLoading: loadingEntry } = useJournalEntry(selectedDate);

  // Sanitize content with DOMPurify for security (PRD 11)
  const sanitizedMarkdown = useMemo(() => {
    return DOMPurify.sanitize(journalContent);
  }, [journalContent]);

  const selectEntry = (date: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("date", date);
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Learning Journal</h1>
        <p className="text-xs text-secondary mt-1">
          A knowledge base compounding Gautams' reviewer feedback, process adjustments, and technical notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Journal Entries Navigation list */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-surface border border-border-default rounded-xl p-4 shadow-sm">
            <span className="text-xs font-bold text-secondary uppercase tracking-wider px-2 block mb-4">
              Notes Archive
            </span>

            {loadingContribs ? (
              <div className="text-xs text-secondary p-4">Loading journal logs...</div>
            ) : journalEntries.length === 0 ? (
              <div className="text-xs text-secondary italic p-4">No journal entries logged yet.</div>
            ) : (
              <div className="space-y-1.5">
                {journalEntries.map((entry) => {
                  const isActive = selectedDate === entry.date;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => selectEntry(entry.date)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-150 border ${
                        isActive
                          ? "bg-accent/10 border-accent/20 text-accent font-medium"
                          : "border-transparent text-secondary hover:text-primary hover:bg-surface-elevated"
                      }`}
                    >
                      <Calendar className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold block">{entry.title}</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {entry.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] font-mono px-1 py-0.5 rounded bg-surface-elevated border border-border-subtle"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 ml-auto self-center shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Renders Markdown file content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border-default rounded-xl p-6 sm:p-8 shadow-sm min-h-[500px]">
            {loadingEntry ? (
              <div className="py-24 text-center text-secondary text-sm">Loading entry notes...</div>
            ) : selectedDate ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs font-mono text-secondary border-b border-border-subtle pb-4">
                  <BookOpen className="h-4 w-4 text-accent" />
                  <span>path: /data/journal/{selectedDate}.md</span>
                </div>

                {/* Rendered markdown body */}
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-secondary leading-relaxed space-y-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {sanitizedMarkdown}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-border-default rounded-xl text-secondary flex flex-col items-center justify-center p-8">
                <PenTool className="h-8 w-8 mb-2" />
                <span className="text-sm font-semibold text-primary">No journal entry selected</span>
                <p className="text-xs text-secondary mt-1">Select a journal entry from the archive sidebar to read.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
