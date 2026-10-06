<script>
  // the tall slider on the right of the armrest it controls whichever setting you picked on the home screen
  // you can drag it with a finger or mouse or use the arrow keys
  import { chair } from '../lib/chair.svelte.js';
  import Icon from './Icon.svelte';

  // how the slider looks and behaves for each setting its name its range how big each step is the labels at the top and bottom
  // and how the current value is written for example recline shows as an angle
  const CFG = {
    heat: {
      label: 'Seat climate',
      icon: 'heat',
      min: -3,
      max: 3,
      step: 1,
      top: 'Warm',
      bottom: 'Cool',
      fmt: (v) => (v === 0 ? 'Neutral' : v > 0 ? `Warm ${v}` : `Cool ${-v}`),
    },
    recline: {
      label: 'Recline',
      icon: 'recline',
      min: 0,
      max: 100,
      step: 5,
      top: 'Back',
      bottom: 'Upright',
      fmt: (v) => `${Math.round(98 + v * 0.3)}°`,
    },
    lumbar: {
      label: 'Lumbar',
      icon: 'lumbar',
      min: 0,
      max: 100,
      step: 5,
      top: 'Firm',
      bottom: 'Soft',
      fmt: (v) => `${v}%`,
    },
  };
  const TARGETS = ['heat', 'recline', 'lumbar'];

  // the slider track on the screen and whether a finger is currently dragging it
  let track = $state();
  let dragging = false;

  // the settings for whichever control is currently selected and its current value and position
  const cfg = $derived(CFG[chair.sliderTarget]);
  const value = $derived(chair[chair.sliderTarget]);
  const frac = $derived((value - cfg.min) / (cfg.max - cfg.min));
  const ticks = $derived(Math.round((cfg.max - cfg.min) / cfg.step) + 1);
  // the slider color orange for warm blue for cool green for the other settings
  const color = $derived(
    chair.sliderTarget === 'heat' ? (value > 0 ? 'var(--heat)' : value < 0 ? 'var(--cool)' : 'var(--dev-muted)') : 'var(--good)'
  );

  // turns where the finger is on the track into a value snapping to the nearest step
  // top of the track is the highest value bottom is the lowest
  function fromPointer(e) {
    const r = track.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
    const raw = cfg.min + f * (cfg.max - cfg.min);
    const v = cfg.min + Math.round((raw - cfg.min) / cfg.step) * cfg.step;
    chair.set(chair.sliderTarget, v);
  }

  // finger pressed start dragging and set the value right away
  function down(e) {
    dragging = true;
    track.setPointerCapture(e.pointerId);
    fromPointer(e);
  }
  function move(e) {
    if (dragging) fromPointer(e);
  }
  function up() {
    dragging = false;
  }
  // keyboard support up and right arrows raise the value down and left arrows lower it
  function key(e) {
    const dir = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -1 : 0;
    if (dir) {
      e.preventDefault();
      chair.set(chair.sliderTarget, value + dir * cfg.step);
    }
  }
</script>

<div class="pad">
  <div class="head">
    <span class="lbl">{cfg.label}</span>
    <span class="val mono" style:color>{cfg.fmt(value)}</span>
  </div>

  <div class="end top">{cfg.top}</div>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class="track"
    bind:this={track}
    role="slider"
    tabindex="0"
    aria-label={cfg.label}
    aria-valuemin={cfg.min}
    aria-valuemax={cfg.max}
    aria-valuenow={value}
    aria-valuetext={cfg.fmt(value)}
    aria-orientation="vertical"
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
    onkeydown={key}
  >
    <div class="rail">
      <div class="fill" style:height="{frac * 100}%" style:background={color}></div>
    </div>
    <div class="ticks">
      {#each Array(ticks) as _, i}
        <span style:bottom="{(i / (ticks - 1)) * 100}%"></span>
      {/each}
    </div>
    <div class="knob" style:bottom="calc({frac * 100}% - 15px)" style:--c={color}></div>
  </div>
  <div class="end bottom">{cfg.bottom}</div>

  <div class="chips" role="group" aria-label="What the slider controls">
    {#each TARGETS as t}
      <button class:on={chair.sliderTarget === t} onclick={() => (chair.sliderTarget = t)} aria-label={CFG[t].label} title={CFG[t].label}>
        <Icon name={CFG[t].icon} size={18} />
      </button>
    {/each}
  </div>
</div>

<style>
  .pad {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 8px 12px;
  }
  .head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-height: 40px;
  }
  .lbl {
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dev-muted);
  }
  .val {
    font-size: 15px;
    font-weight: 600;
  }
  .end {
    font-size: 10px;
    color: var(--dev-muted);
    letter-spacing: 0.06em;
  }
  .track {
    position: relative;
    flex: 1;
    width: 64px;
    touch-action: none;
    cursor: pointer;
    border-radius: 12px;
  }
  .rail {
    position: absolute;
    left: 50%;
    top: 14px;
    bottom: 14px;
    width: 10px;
    translate: -50% 0;
    border-radius: 6px;
    background: var(--dev-bg);
    border: 1px solid var(--dev-edge);
    overflow: hidden;
    display: flex;
    align-items: flex-end;
  }
  .fill {
    width: 100%;
    transition: height 0.12s ease-out, background 0.2s;
    opacity: 0.9;
  }
  .ticks {
    position: absolute;
    inset: 14px 0;
  }
  .ticks span {
    position: absolute;
    left: 50%;
    width: 30px;
    height: 1px;
    translate: -50% 0;
    background: var(--dev-edge);
    z-index: 0;
  }
  .knob {
    position: absolute;
    left: 50%;
    width: 44px;
    height: 30px;
    translate: -50% -14px;
    margin-bottom: -1px;
    border-radius: 10px;
    background: linear-gradient(#3a404c, #2a2e37);
    border: 1px solid #4a515f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    transition: bottom 0.12s ease-out;
  }
  .knob::after {
    content: '';
    position: absolute;
    inset: 12px 10px;
    border-top: 2px solid var(--c);
    border-bottom: 2px solid var(--c);
    height: 6px;
    opacity: 0.8;
  }
  .chips {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }
  .chips button {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    border: 1px solid var(--dev-edge);
    background: var(--dev-1);
    color: var(--dev-muted);
  }
  .chips button.on {
    color: var(--dev-text);
    background: var(--dev-2);
    border-color: #5d6573;
  }
</style>
