export const formatLocalDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getDaysForHeatmap = () => {
  const days = [];
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1);
  
  // Align start to the beginning of the week (Sunday = 0)
  const startDay = start.getDay();
  start.setDate(start.getDate() - startDay);

  let current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export const getMonthLabels = (days: Date[]) => {
  const months: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;

  days.forEach((date, index) => {
    const colIndex = Math.floor(index / 7);
    const month = date.getMonth();
    if (month !== lastMonth && date.getDate() <= 7) {
      months.push({
        label: date.toLocaleDateString("en-US", { month: "short" }),
        colIndex,
      });
      lastMonth = month;
    }
  });

  return months;
};

export const getContributionsByDateMap = (contributions: any[]) => {
  const map: Record<string, any[]> = {};
  contributions.forEach((c) => {
    const date = c.date_completed || c.date_started;
    if (date) {
      if (!map[date]) {
        map[date] = [];
      }
      map[date].push(c);
    }
  });
  return map;
};
