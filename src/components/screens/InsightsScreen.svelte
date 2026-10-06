<script>
  // the insights screen a summary of how the person has been sitting it shows a ring for todays goal
  // the last seven days as bars and how todays time was split between postures
  import { chair, POSTURES } from '../../lib/chair.svelte.js';
  import { fmtDur } from '../../lib/format.js';
  import { WEEK_LABELS, POSTURE_KEYS } from '../../lib/profiles.js';

  // the color used for each posture in the posture bar
  // the length around the ring needed to draw the part that is filled in
  const COLORS = {
    good: 'var(--good)',
    slouch: 'var(--warn)',
    forward: 'var(--alert)',
    leanL: '#8fa8e8',
    leanR: '#b79ae0',
  };

  // todays goal in hours hours seated so far today and all seven days together for the chart
  const goalH = $derived(chair.profile.goalHrs);
  const todayH = $derived(chair.dailySec / 3600);
  const values = $derived([...chair.profile.past, todayH]);
  // the tallest bar sets the height of the chart with a little extra room above the goal line
  const maxV = $derived(Math.max(goalH * 1.35, ...values));
  // how full the goal ring is from empty to full
  const ringFrac = $derived(Math.min(1, chair.dailySec / chair.goalSec));
  const C = 2 * Math.PI * 34;

  // the percent of today spent in each posture
  const segs = $derived(
    POSTURE_KEYS.map((k) => ({
      k,
      pct: chair.postureTotal > 0 ? (chair.postureSecs[k] / chair.postureTotal) * 100 : 0,
    }))
  );
</script>

<div class="wrap">
  <div class="top">
    <svg viewBox="0 0 84 84" class="ring" role="img" aria-label="Today's sitting versus goal">
      <circle cx="42" cy="42" r="34" fill="none" stroke="var(--dev-1)" stroke-width="9" />
      <circle
        cx="42"
        cy="42"
        r="34"
        fill="none"
        stroke={ringFrac >= 1 ? 'var(--warn)' : 'var(--good)'}
        stroke-width="9"
        stroke-linecap="round"
        stroke-dasharray="{ringFrac * C} {C}"
        transform="rotate(-90 42 42)"
      />
      <text x="42" y="40" text-anchor="middle" class="rn">{todayH.toFixed(1)}</text>
      <text x="42" y="54" text-anchor="middle" class="rl">of {goalH}h</text>
    </svg>
    <div class="facts">
      <div><b class="mono">{fmtDur(chair.dailySec)}</b><small>seated today</small></div>
      <div><b class="mono">{chair.breaks}</b><small>breaks</small></div>
      <div><b class="mono">{fmtDur(chair.longestSec)}</b><small>longest stretch</small></div>
    </div>
  </div>

  <div class="chart">
    <span class="lbl">Last 7 days (hours seated)</span>
    <svg viewBox="0 0 300 96" class="bars" role="img" aria-label="Hours seated for the past week">
      <line x1="0" x2="300" y1={80 - (goalH / maxV) * 70} y2={80 - (goalH / maxV) * 70} stroke="var(--dev-muted)" stroke-dasharray="3 3" stroke-width="0.8" />
      {#each values as v, i}
        {@const h = (v / maxV) * 70}
        <rect
          x={i * 43 + 8}
          y={80 - h}
          width="28"
          height={Math.max(1, h)}
          rx="4"
          fill={v > goalH ? 'var(--warn)' : 'var(--good)'}
          opacity={i === 6 ? 1 : 0.55}
        />
        <text x={i * 43 + 22} y="93" text-anchor="middle" class="day" class:today={i === 6}>{WEEK_LABELS[i]}</text>
        <text x={i * 43 + 22} y={Math.max(9, 80 - h - 4)} text-anchor="middle" class="num">{v.toFixed(1)}</text>
      {/each}
    </svg>
  </div>

  <div class="post">
    <span class="lbl">Posture today</span>
    <div class="stack" role="img" aria-label="Posture breakdown">
      {#each segs as s}
        <i style:width="{s.pct}%" style:background={COLORS[s.k]}></i>
      {/each}
    </div>
    <div class="legend">
      {#each segs as s}
        <span><i style:background={COLORS[s.k]}></i>{POSTURES[s.k].label.replace('Leaning ', 'Lean ')} {Math.round(s.pct)}%</span>
      {/each}
    </div>
  </div>
</div>

<style>
  .wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .lbl {
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dev-muted);
  }
  .top {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .ring {
    width: 84px;
    height: 84px;
    flex: none;
  }
  .ring circle:nth-child(2) {
    transition: stroke-dasharray 0.4s;
  }
  .rn {
    font: 600 17px var(--mono);
    fill: var(--dev-text);
  }
  .rl {
    font: 400 8.5px var(--sans);
    fill: var(--dev-muted);
  }
  .facts {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .facts div {
    padding: 8px 10px;
    border-radius: 12px;
    background: var(--dev-1);
    border: 1px solid var(--dev-edge);
  }
  .facts b {
    display: block;
    font-size: 17px;
  }
  .facts small {
    font-size: 11px;
    color: var(--dev-muted);
  }
  .chart {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .bars {
    flex: 1;
    min-height: 0;
    width: 100%;
  }
  .bars rect {
    transition: all 0.3s;
  }
  .day {
    font: 500 8px var(--sans);
    fill: var(--dev-muted);
  }
  .day.today {
    fill: var(--dev-text);
    font-weight: 700;
  }
  .num {
    font: 500 7.5px var(--mono);
    fill: var(--dev-text);
    opacity: 0.8;
  }
  .stack {
    display: flex;
    height: 12px;
    border-radius: 7px;
    overflow: hidden;
    background: var(--dev-1);
    margin: 6px 0;
  }
  .stack i {
    height: 100%;
    transition: width 0.3s;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: 11px;
    color: var(--dev-muted);
  }
  .legend i {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    margin-right: 5px;
  }
</style>
