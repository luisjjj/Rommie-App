export const NIGERIAN_UNIVERSITIES = [
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'Ahmadu Bello University (ABU)',
  'University of Nigeria, Nsukka (UNN)',
  'University of Benin (UNIBEN)',
  'University of Ilorin (UNILORIN)',
  'Covenant University',
  'Lagos State University (LASU)',
  'Yaba College of Technology (YabaTech)',
  'Nnamdi Azikiwe University (UNIZIK)',
  'Federal University of Technology, Akure (FUTA)',
  'Other / Not listed',
] as const;

export const NIGERIAN_CITIES = [
  'Lagos',
  'Abuja',
  'Ibadan',
  'Port Harcourt',
  'Enugu',
  'Benin City',
  'Kano',
  'Kaduna',
  'Ile-Ife',
  'Nsukka',
  'Akure',
  'Ilorin',
] as const;

export const BUDGET_RANGES = [
  { label: 'Under ₦300k', min: 0, max: 300000 },
  { label: '₦300k–₦500k', min: 300000, max: 500000 },
  { label: '₦500k–₦800k', min: 500000, max: 800000 },
  { label: '₦800k–₦1.2m', min: 800000, max: 1200000 },
  { label: '₦1.2m+', min: 1200000, max: 10000000 },
] as const;

export const BUDGET_PERIOD_LABEL = 'per year (annual accommodation budget)';

export const MOVE_IN_OPTIONS = ['ASAP', 'Within a month', 'In 1–3 months', 'Later', 'Not sure yet'] as const;

export const ACCOMMODATION_INTENTS = [
  { value: 'looking_for_roommate', label: "I'm looking for a roommate" },
  { value: 'have_room', label: 'I have a room, need someone to share' },
  { value: 'looking_for_shared', label: "I'm looking for shared accommodation" },
  { value: 'exploring', label: "I'm exploring for the future" },
] as const;

export const LIFESTYLE_OPTIONS = {
  sleep_schedule: ['Early sleeper', 'Night owl', 'Flexible'],
  cleanliness: ['Very tidy', 'Generally tidy', 'Relaxed'],
  noise_preference: ['Prefer quiet', 'Some background noise is fine', 'Social and lively'],
  visitor_preference: ['Rarely', 'Occasionally', 'Often'],
  work_study_habit: ['Mostly at home', 'Mostly outside', 'A mix of both'],
  social_style: ['Introverted', 'Balanced', 'Extroverted'],
  cooking_habit: ['Cook regularly', 'Sometimes', 'Rarely'],
} as const;

export const MIN_AGE = 16;

export const CONVERSATION_STARTERS = [
  'What kind of place are you hoping to find?',
  'What’s your usual daily routine like?',
  'What does a good roommate look like to you?',
  'When are you hoping to move?',
];

export const LIVING_DISCUSSION_PROMPTS = [
  'How should we handle cleaning?',
  'What are good quiet hours for both of us?',
  'How do we feel about visitors?',
  'How should we split shared expenses?',
  'Any cooking / kitchen preferences?',
];
