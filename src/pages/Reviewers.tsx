import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useReviewers } from "../hooks/useData";
import { Search, ArrowRight } from "lucide-react";

export const Reviewers: React.FC = () => {
  const { data: reviewers = [], isLoading } = useReviewers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReviewers = reviewers.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Reviewers Directory</h1>
          <p className="text-xs text-secondary mt-1">
            Tracking feedback loops, domain lessons, and process mentorship across communities.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-secondary" />
          <input
            type="text"
            placeholder="Search reviewers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-btn border border-border-subtle bg-surface-elevated text-xs text-primary placeholder-secondary focus:border-accent focus:outline-none transition-all duration-150"
          />
        </div>
      </div>

      {/* Grid of Profile Cards */}
      {isLoading ? (
        <div className="py-24 text-center text-secondary">Loading reviewers index...</div>
      ) : filteredReviewers.length === 0 ? (
        <div className="py-24 text-center text-secondary border border-dashed border-border-default bg-surface rounded-xl">
          No reviewers found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviewers.map((r) => {
            const totalFeedback = r.feedback.length;
            const internalized = r.feedback.filter((f) => f.internalized).length;
            const pending = totalFeedback - internalized;

            return (
              <div
                key={r.id}
                className="bg-surface border border-border-default rounded-xl p-6 shadow-sm hover:border-accent/30 hover:shadow-md flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0 font-bold">
                      {r.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/reviewers/${r.name}`}
                        className="font-semibold text-sm text-primary hover:text-accent truncate block"
                      >
                        {r.name}
                      </Link>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.platforms.map((p) => (
                          <span key={p} className="text-[10px] font-mono text-secondary uppercase">
                            {p === "wikipedia" ? "Wikimedia" : p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Feedback stats */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-border-subtle my-4 text-center text-xs">
                    <div>
                      <span className="text-secondary block text-[10px] uppercase font-semibold">Total</span>
                      <span className="font-bold text-primary font-mono">{totalFeedback}</span>
                    </div>
                    <div>
                      <span className="text-status-merged block text-[10px] uppercase font-semibold">Internalized</span>
                      <span className="font-bold text-status-merged font-mono">{internalized}</span>
                    </div>
                    <div>
                      <span className="text-status-pending block text-[10px] uppercase font-semibold">Pending</span>
                      <span className="font-bold text-status-pending font-mono">{pending}</span>
                    </div>
                  </div>

                  {/* Feedbacks list summary snippet */}
                  {r.feedback.length > 0 ? (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">
                        Recent Feedback Note:
                      </span>
                      <p className="text-xs text-secondary italic leading-relaxed line-clamp-2 pl-3 border-l-2 border-accent/30">
                        "{r.feedback[r.feedback.length - 1].text}"
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-secondary italic">No logged feedback events.</span>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle flex justify-end">
                  <Link
                    to={`/reviewers/${r.name}`}
                    className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1"
                  >
                    View lessons details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
