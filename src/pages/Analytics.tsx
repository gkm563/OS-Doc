import React, { useMemo } from "react";
import { useContributions } from "../hooks/useData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { BarChart3, PieChart as PieIcon, TrendingUp, Calendar } from "lucide-react";

export const Analytics: React.FC = () => {
  const { data: contributions = [], isLoading } = useContributions();

  // 1. Monthly Merge Trends
  const monthlyTrendData = useMemo(() => {
    const monthlyGroups: Record<string, { monthStr: string; merged: number; other: number; total: number }> = {};
    
    // Sort chronologically first
    const sorted = [...contributions].sort(
      (a, b) => new Date(a.date_started).getTime() - new Date(b.date_started).getTime()
    );

    sorted.forEach((c) => {
      const d = new Date(c.date_completed || c.date_started);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      if (!monthlyGroups[key]) {
        monthlyGroups[key] = { monthStr: monthLabel, merged: 0, other: 0, total: 0 };
      }

      if (c.status === "merged") {
        monthlyGroups[key].merged++;
      } else {
        monthlyGroups[key].other++;
      }
      monthlyGroups[key].total++;
    });

    return Object.values(monthlyGroups);
  }, [contributions]);

  // 2. Platform Distribution (Donut Chart)
  const platformData = useMemo(() => {
    const counts: Record<string, number> = {};
    contributions.forEach((c) => {
      counts[c.platform] = (counts[c.platform] || 0) + 1;
    });

    const colors = {
      github: "#818CF8",
      gitlab: "#FC6D26",
      gerrit: "#3B82F6",
      phabricator: "#F59E0B",
      wikipedia: "#A855F7",
    };

    return Object.entries(counts).map(([name, value]) => ({
      name: name === "wikipedia" ? "Wikimedia" : name.toUpperCase(),
      value,
      color: colors[name as keyof typeof colors] || "#64748B",
    }));
  }, [contributions]);

  // 3. Repository Distribution (Treemap)
  const repoData = useMemo(() => {
    const counts: Record<string, number> = {};
    contributions.forEach((c) => {
      if (c.repository) {
        counts[c.repository] = (counts[c.repository] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, size]) => ({ name, size }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 8); // Top 8 repositories
  }, [contributions]);

  // 4. Day of Week Activity
  const dayOfWeekData = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    contributions.forEach((c) => {
      const d = new Date(c.date_started);
      counts[d.getDay()]++;
    });

    return days.map((day, idx) => ({
      day,
      "Contributions Count": counts[idx],
    }));
  }, [contributions]);

  if (isLoading) {
    return <div className="py-24 text-center text-secondary">Preparing charts and reports...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Analytics Suite</h1>
        <p className="text-xs text-secondary mt-1">Metric aggregates representing contribution rates and repository impact.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Monthly Merge Rates */}
        <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-accent" />
              Monthly Contribution Activity
            </h3>
            <p className="text-[11px] text-secondary mt-0.5">Distribution of merged commits vs open patches</p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="monthStr" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-surface-elevated)",
                    borderColor: "var(--border-default)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="merged" name="Merged" fill="#10B981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="other" name="Open/Pending" fill="#6366F1" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Platform Distribution */}
        <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
              <PieIcon className="h-4.5 w-4.5 text-accent" />
              Platform Share
            </h3>
            <p className="text-[11px] text-secondary mt-0.5">Gautam's active profile distribution by host platform</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-[300px]">
            <div className="h-full w-full max-w-[200px] max-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-surface-elevated)",
                      borderColor: "var(--border-default)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="space-y-2.5 text-xs text-secondary shrink-0">
              {platformData.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded" style={{ backgroundColor: p.color }} />
                  <span className="font-semibold text-primary">{p.name}:</span>
                  <span className="font-mono">{p.value} events</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Top Repositories */}
        <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
              <BarChart3 className="h-4.5 w-4.5 text-accent" />
              Impact Repositories
            </h3>
            <p className="text-[11px] text-secondary mt-0.5">Top 8 repositories with most active contributions</p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repoData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-surface-elevated)",
                    borderColor: "var(--border-default)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                  }}
                />
                <Bar dataKey="size" name="Contributions" fill="#818CF8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Day of Week Activity */}
        <div className="bg-surface border border-border-default rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-accent" />
              Weekday Cadence
            </h3>
            <p className="text-[11px] text-secondary mt-0.5">Contribution rate grouped by day of the week</p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-surface-elevated)",
                    borderColor: "var(--border-default)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                  }}
                />
                <Area type="monotone" dataKey="Contributions Count" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
