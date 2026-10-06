<script>
  // the home screen of the armrest the top row shows live information session posture insights and opens a screen when tapped
  // the bottom row climate recline lumbar does not open anything tapping one just points the slider at that setting
  import { chair } from '../../lib/chair.svelte.js';
  import { fmtClockDur, fmtDur } from '../../lib/format.js';
  import Icon from '../Icon.svelte';

  const heatText = $derived(chair.heat === 0 ? 'Neutral' : chair.heat > 0 ? `Warm ${chair.heat}` : `Cool ${-chair.heat}`);

  // tapping a settings tile makes the slider control that setting
  const target = (t) => (chair.sliderTarget = t);
</script>

<div class="grid">
  <button class="tile" onclick={() => (chair.screen = 'session')}>
    <Icon name="timer" size={24} />
    <span class="t">Session</span>
    <span class="v mono">{chair.seated ? fmtClockDur(chair.sessionSec) : '--:--'}</span>
    <span class="s">{fmtDur(chair.dailySec)} today</span>
  </button>

  <button class="tile" data-tone={chair.postureTone} onclick={() => (chair.screen = 'posture')}>
    <Icon name="posture" size={24} />
    <span class="t">Posture</span>
    <span class="v">{chair.seated ? chair.postureInfo.label : 'Waiting'}</span>
    <span class="s">{chair.goodPct}% upright today</span>
  </button>

  <button class="tile" onclick={() => (chair.screen = 'insights')}>
    <Icon name="stats" size={24} />
    <span class="t">Insights</span>
    <span class="v mono">{Math.round((chair.dailySec / chair.goalSec) * 100)}%</span>
    <span class="s">of {chair.profile.goalHrs}h goal</span>
  </button>

  <button class="tile" class:sel={chair.sliderTarget === 'heat'} onclick={() => target('heat')}>
    <Icon name="heat" size={24} />
    <span class="t">Seat climate</span>
    <span class="v">{heatText}</span>
    <span class="s mono">{chair.seatTemp.toFixed(1)}°C seat</span>
  </button>

  <button class="tile" class:sel={chair.sliderTarget === 'recline'} onclick={() => target('recline')}>
    <Icon name="recline" size={24} />
    <span class="t">Recline</span>
    <span class="v mono">{Math.round(98 + chair.recline * 0.3)}°</span>
    <span class="s">backrest angle</span>
  </button>

  <button class="tile" class:sel={chair.sliderTarget === 'lumbar'} onclick={() => target('lumbar')}>
    <Icon name="lumbar" size={24} />
    <span class="t">Lumbar</span>
    <span class="v mono">{chair.lumbar}%</span>
    <span class="s">support firmness</span>
  </button>
</div>

<style>
  .grid {
    height: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 10px;
  }
  .tile {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 13px 14px;
    text-align: left;
    border-radius: 18px;
    border: 1px solid var(--dev-edge);
    background: var(--dev-1);
    color: var(--dev-text);
    transition: background 0.2s, border-color 0.2s, transform 0.1s;
  }
  .tile:hover {
    background: var(--dev-2);
  }
  .tile:active {
    transform: scale(0.98);
  }
  .tile.sel {
    border-color: #7a8392;
    background: var(--dev-2);
  }
  .tile :global(svg) {
    color: var(--dev-muted);
    margin-bottom: auto;
  }
  .t {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dev-muted);
    margin-top: 6px;
  }
  .v {
    font-size: 21px;
    font-weight: 600;
    line-height: 1.15;
  }
  .s {
    font-size: 12px;
    color: var(--dev-muted);
  }
  .tile[data-tone='good'] :global(svg),
  .tile[data-tone='good'] .v {
    color: var(--good);
  }
  .tile[data-tone='warn'] :global(svg),
  .tile[data-tone='warn'] .v {
    color: var(--warn);
  }
  .tile[data-tone='alert'] :global(svg),
  .tile[data-tone='alert'] .v {
    color: var(--alert);
  }
</style>
