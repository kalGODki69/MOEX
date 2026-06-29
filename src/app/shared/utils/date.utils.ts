export function getDaysForInterval(interval: number): number {
  if (interval <= 1) return 1;
  if (interval <= 5) return 3;
  if (interval <= 30) return 7;
  if (interval <= 60) return 14;
  return 30;
}

export function formatDateRange(interval: number): { from: string; to: string } {
  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - getDaysForInterval(interval));

  return {
    from: from.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  };
}
