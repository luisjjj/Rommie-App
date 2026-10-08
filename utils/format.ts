export function formatBudget(min?: number, max?: number): string {
  if (min == null && max == null) return 'Budget flexible';
  const fmt = (n: number) =>
    n >= 1000000 ? `₦${(n / 1000000).toString().replace(/\.0$/, '')}m` : `₦${Math.round(n / 1000)}k`;
  if (min != null && max != null) return `${fmt(min)}–${fmt(max)}`;
  if (min != null) return `${fmt(min)}+`;
  return `Under ${fmt(max!)}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Sanitize a lifestyle map for chip rendering: non-objects become empty,
 *  non-string values are dropped, so rendering can never throw. */
export function lifestyleEntries(lifestyle: unknown): [string, string][] {
  if (!lifestyle || typeof lifestyle !== 'object' || Array.isArray(lifestyle)) return [];
  return Object.entries(lifestyle as Record<string, unknown>).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0,
  );
}

/** Plain-language lifestyle comparison — never a fake scientific score. */
export function compareLifestyle(
  mine?: Record<string, string | undefined>,
  theirs?: Record<string, string | undefined>,
): { agree: string[]; discuss: string[] } {
  const labels: Record<string, string> = {
    sleep_schedule: 'Sleep schedule',
    cleanliness: 'Tidiness',
    noise_preference: 'Noise',
    visitor_preference: 'Visitors',
    work_study_habit: 'Study/work habits',
    cooking_habit: 'Cooking',
    social_style: 'Social style',
  };
  const agree: string[] = [];
  const discuss: string[] = [];
  if (!mine || !theirs) return { agree, discuss };
  for (const key of Object.keys(labels)) {
    if (!mine[key] || !theirs[key]) continue;
    if (mine[key] === theirs[key]) agree.push(`${labels[key]}: ${mine[key]}`);
    else discuss.push(`${labels[key]} — you: ${mine[key]}, them: ${theirs[key]}`);
  }
  return { agree, discuss };
}
