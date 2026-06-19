import React from "react";
import type { Contribution } from "../types";
import { Globe, GitFork, ClipboardList, PenTool } from "lucide-react";

interface PlatformBadgeProps {
  platform: Contribution["platform"];
  className?: string;
  showIconOnly?: boolean;
}

// Premium inline SVG for GitHub Octocat
const GithubIcon: React.FC<{ className?: string }> = ({ className = "h-3.5 w-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

// Premium inline SVG for GitLab Fox
const GitlabIcon: React.FC<{ className?: string }> = ({ className = "h-3.5 w-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M23.953 13.072l-1.077-3.31a.972.972 0 0 0-.083-.178L18.6 3.16a1.007 1.007 0 0 0-.934-.633 1.007 1.007 0 0 0-.94.646L14.7 9.176H9.3l-2.028-6.003A1.007 1.007 0 0 0 6.34 2.53a1.007 1.007 0 0 0-.936.633L1.207 9.584a.993.993 0 0 0-.084.185L.047 13.072a1.674 1.674 0 0 0 .565 1.74l11.39 8.272 11.385-8.272a1.674 1.674 0 0 0 .566-1.74z"/>
  </svg>
);

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platform,
  className = "",
  showIconOnly = false,
}) => {
  const configs = {
    github: {
      label: "GitHub",
      color: "bg-[#1F2328]/10 text-[#1F2328] dark:bg-white/10 dark:text-white border-[#1F2328]/20 dark:border-white/20",
      icon: GithubIcon,
    },
    gitlab: {
      label: "GitLab",
      color: "bg-[#FC6D26]/10 text-[#FC6D26] border-[#FC6D26]/20",
      icon: GitlabIcon,
    },
    gerrit: {
      label: "Gerrit",
      color: "bg-status-open/10 text-status-open border-status-open/20",
      icon: GitFork,
    },
    phabricator: {
      label: "Phabricator",
      color: "bg-status-pending/10 text-status-pending border-status-pending/20",
      icon: ClipboardList,
    },
    wikipedia: {
      label: "Wikimedia",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      icon: Globe,
    },
  };

  const current = configs[platform] || {
    label: "Platform",
    color: "bg-secondary/10 text-secondary border-secondary/20",
    icon: PenTool,
  };

  const Icon = current.icon;

  if (showIconOnly) {
    return (
      <span
        title={current.label}
        className={`inline-flex items-center justify-center p-1.5 rounded-lg border ${current.color} ${className}`}
      >
        <Icon className="h-4 w-4" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono border ${current.color} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
};
