import React from "react";
import type { Contribution } from "../types";

interface StatusPillProps {
  status: Contribution["status"];
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = "" }) => {
  const styles = {
    merged: {
      bg: "bg-status-merged/10 border-status-merged/20 text-status-merged",
      dot: "bg-status-merged",
      label: "Merged",
    },
    open: {
      bg: "bg-status-open/10 border-status-open/20 text-status-open",
      dot: "bg-status-open",
      label: "Open",
    },
    under_review: {
      bg: "bg-status-pending/10 border-status-pending/20 text-status-pending",
      dot: "bg-status-pending",
      label: "In Review",
    },
    rejected: {
      bg: "bg-status-rejected/10 border-status-rejected/20 text-status-rejected",
      dot: "bg-status-rejected",
      label: "Rejected",
    },
  };

  const current = styles[status] || styles.open;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
};
