# Smart Chair — Interface to a Smart Object

Svelte 5 + Vite mock-up of a smart chair whose interface is spread over three surfaces:
**1** armrest touch panel, **2** backrest sensing strip + tracking light, **3** seat pressure + climate.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ (base './', works on GitHub Pages)
```

## Requirement map

| Requirement | Where |
|---|---|
| Level 0: Device UI vs Testing UI, title, name, "where the UI lives" graphic | `App.svelte`, `TestingPanel.svelte` |
| Level 1: session timer, daily total, break reminder, posture, seat climate, recline, lumbar | `ArmrestPanel.svelte`, `screens/*`, `BackrestPanel.svelte`, `SeatPanel.svelte` |
| Option 3: data for 4 mock users | `lib/profiles.js`, `screens/InsightsScreen.svelte`, "Load a user" |
| Option 4: simulated 9–5 workday | `startDay()` and `DAY_SCRIPT` in `lib/chair.svelte.js` |

All state and rules live in `src/lib/chair.svelte.js` (one reactive class). Components only read it and call its methods.
