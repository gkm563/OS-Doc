import React from "react";
import { useAchievements } from "../hooks/useData";
import { formatLocalDate } from "../lib/dateUtils";
import { Trophy, GitPullRequest, GitCommit, BookOpen, Flame, Globe, CheckCircle2 } from "lucide-react";

export const Achievements: React.FC = () => {
  const { data: achievements = [], isLoading } = useAchievements();

  // Map icon strings to Lucide React icons
  const iconMap: Record<string, React.ComponentType<any>> = {
    GitPullRequest: GitPullRequest,
    GitCommit: GitCommit,
    BookOpen: BookOpen,
    Flame: Flame,
    Globe: Globe,
  };

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case "gold":
        return {
          border: "border-yellow-500/30 group-hover:border-yellow-500/60",
          bg: "bg-yellow-500/5",
          icon: "text-yellow-500 bg-yellow-500/10",
          shadow: "shadow-yellow-500/5",
          label: "Gold Tier",
        };
      case "silver":
        return {
          border: "border-slate-300/30 group-hover:border-slate-300/60 dark:border-slate-600/30 dark:group-hover:border-slate-600/60",
          bg: "bg-slate-300/5 dark:bg-slate-600/5",
          icon: "text-slate-400 bg-slate-400/10",
          shadow: "shadow-slate-500/5",
          label: "Silver Tier",
        };
      default:
        return {
          border: "border-orange-500/30 group-hover:border-orange-500/60",
          bg: "bg-orange-500/5",
          icon: "text-orange-500 bg-orange-500/10",
          shadow: "shadow-orange-500/5",
          label: "Bronze Tier",
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Milestones & Achievements</h1>
        <p className="text-xs text-secondary mt-1">
          Special awards unlocked through Gautam's consistent open-source dedication.
        </p>
      </div>

      {/* Grid of Badges */}
      {isLoading ? (
        <div className="py-24 text-center text-secondary">Loading achievements collection...</div>
      ) : achievements.length === 0 ? (
        <div className="py-24 text-center text-secondary border border-dashed border-border-default bg-surface rounded-xl">
          No achievements unlocked yet. Keep hacking!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const config = getTierConfig(achievement.tier);
            const Icon = iconMap[achievement.icon] || Trophy;

            return (
              <div
                key={achievement.id}
                className={`bg-surface border ${config.border} ${config.bg} ${config.shadow} rounded-xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between transition-all duration-300 group`}
              >
                <div className="space-y-4">
                  {/* Badge icon */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${config.icon} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-secondary">
                      {config.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-primary tracking-tight">
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-secondary leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle/50 flex items-center justify-between text-[10px] font-mono text-secondary">
                  <span className="flex items-center gap-1 text-status-merged">
                    <CheckCircle2 className="h-3.5 w-3.5 fill-current" />
                    Unlocked
                  </span>
                  <span>
                    {achievement.unlocked_at
                      ? formatLocalDate(achievement.unlocked_at.split("T")[0])
                      : "Locked"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
