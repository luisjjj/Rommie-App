/**
 * Plain-language lifestyle comparison shared by API responses.
 * Never a fabricated scientific score — just shared topics vs things to discuss.
 */
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
