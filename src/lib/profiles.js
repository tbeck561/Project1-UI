// four pretend users so the interface can show different people and situations
// loading one swaps in their history settings and goals

// the five postures the chair can tell apart in the order they are listed in charts
export const POSTURE_KEYS = ['good', 'slouch', 'forward', 'leanL', 'leanR'];

// short labels for the last seven days shown under the bars in the insights chart
export const WEEK_LABELS = ['F', 'S', 'S', 'M', 'T', 'W', 'Today'];

// each person has
// a goal for how many hours they should sit per day
// hours seated on each of the past six days
// what has already happened today clock time minutes seated breaks posture mix
// the settings the chair starts with
// the optimal settings that auto adjust moves the chair to
export const PROFILES = [
  {
    id: 'alex',
    name: 'Alex',
    initials: 'AK',
    blurb: 'Software dev · long desk days',
    goalHrs: 6,
    past: [8.4, 3.1, 2.4, 7.4, 8.1, 7.8],
    today: {
      clock: 14 * 3600 + 20 * 60,
      sittingMin: 160,
      breaks: 2,
      longestMin: 55,
      posture: { good: 0.55, slouch: 0.28, forward: 0.1, leanL: 0.04, leanR: 0.03 },
    },
    settings: { heat: 0, recline: 15, lumbar: 40, breakMin: 45 },
    optimal: { heat: 1, recline: 30, lumbar: 65 },
  },
  {
    id: 'maya',
    name: 'Maya',
    initials: 'MR',
    blurb: 'Student · marathon study & gaming',
    goalHrs: 5,
    past: [5.5, 9.5, 10.2, 6.0, 6.8, 7.1],
    today: {
      clock: 16 * 3600 + 5 * 60,
      sittingMin: 255,
      breaks: 1,
      longestMin: 125,
      posture: { good: 0.3, slouch: 0.42, forward: 0.2, leanL: 0.03, leanR: 0.05 },
    },
    settings: { heat: 1, recline: 50, lumbar: 30, breakMin: 60 },
    optimal: { heat: 0, recline: 25, lumbar: 55 },
  },
  {
    id: 'sam',
    name: 'Sam',
    initials: 'SP',
    blurb: 'Remote worker · recovering lower back',
    goalHrs: 4,
    past: [1.0, 1.5, 4.0, 4.5, 5.0, 3.5],
    today: {
      clock: 11 * 3600 + 10 * 60,
      sittingMin: 95,
      breaks: 3,
      longestMin: 30,
      posture: { good: 0.78, slouch: 0.12, forward: 0.04, leanL: 0.03, leanR: 0.03 },
    },
    settings: { heat: 0, recline: 10, lumbar: 50, breakMin: 30 },
    optimal: { heat: 2, recline: 35, lumbar: 85 },
  },
  {
    id: 'jordan',
    name: 'Jordan',
    initials: 'JL',
    blurb: 'Retired · reading & TV afternoons',
    goalHrs: 6,
    past: [6.0, 5.0, 6.5, 5.5, 6.0, 7.0],
    today: {
      clock: 15 * 3600,
      sittingMin: 200,
      breaks: 2,
      longestMin: 70,
      posture: { good: 0.5, slouch: 0.2, forward: 0.03, leanL: 0.22, leanR: 0.05 },
    },
    settings: { heat: 0, recline: 40, lumbar: 70, breakMin: 75 },
    optimal: { heat: 2, recline: 75, lumbar: 40 },
  },
];

// finds a user by id if the id is unknown it falls back to the first user so the app never breaks
export const getProfile = (id) => PROFILES.find((p) => p.id === id) ?? PROFILES[0];
