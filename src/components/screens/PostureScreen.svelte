<script>
  // the posture screen on the armrest touch panel the chairs seat and backrest sensors are recorded here instead of
  // being shown as lights on the chair there are two views
  // live shows how you are sitting right now and history shows where your weight has been all day
  import { chair, POSTURES } from '../../lib/chair.svelte.js';
  import { fmtDur, fmtTimeOfDay } from '../../lib/format.js';
  import { N, ROWS, seatPressure, backContact, zeros, heatColor, balanceOf, describeSeat } from '../../lib/pressure.js';
  import Icon from '../Icon.svelte';

  // which view is open
  let tab = $state('live');

  // the color for each state of the chair and one color per posture for the timeline
  const COLOR = { good: 'var(--good)', warn: 'var(--warn)', alert: 'var(--alert)', idle: 'var(--idle)' };
  const POSTURE_COLOR = { good: 'var(--good)', slouch: 'var(--warn)', forward: 'var(--alert)', leanL: '#8fa8e8', leanR: '#b79ae0' };

  // live view what the sensors read at this moment all zeros when nobody is sitting
  const seatNow = $derived(chair.seated ? seatPressure(chair.posture) : zeros(N * N));
  const backNow = $derived(chair.seated ? backContact(chair.posture) : zeros(ROWS * 2));
  const balanceNow = $derived(balanceOf(seatNow));

  // history view the recorded totals scaled so the most pressed spot is the brightest
  const seatMax = $derived(Math.max(1, ...chair.seatHeat));
  const backMax = $derived(Math.max(1, ...chair.backHeat));
  const balanceDay = $derived(balanceOf(chair.seatHeat));
  const seatNote = $derived(describeSeat(chair.seatHeat));

  // the timeline every stretch of time in one posture drawn as a colored block as wide as it lasted
  const first = $derived(chair.segments[0]);
  const span = $derived(first ? Math.max(60, (chair.seated ? chair.clock : chair.segments[chair.segments.length - 1].end) - first.start) : 1);
  const blocks = $derived(
    chair.segments.map((g) => ({ ...g, w: ((g.end - g.start) / span) * 100, left: ((g.start - first.start) / span) * 100 }))
  );
  // the posture names that appear in the timeline so the colors can be labelled directly
  const used = $derived([...new Set(chair.segments.map((g) => g.posture))]);

  // the most recent things that happened newest first
  const recent = $derived([...chair.log].reverse().slice(0, 6));
</script>

<div class="wrap">
  <div class="top">
    <div class="now" style:--c={COLOR[chair.postureTone]}>
      <div class="ring"><Icon name="posture" size={28} /></div>
      <div class="txt">
        <span class="lbl">Right now</span>
        <b>{chair.seated ? chair.postureInfo.label : 'Not seated'}</b>
        <small>
          {#if !chair.seated}
            Recorded from the seat and backrest sensors.
          {:else if chair.posture === 'good'}
            Upright for {fmtDur(chair.goodStreakSec)}
          {:else}
            {chair.postureInfo.note}
          {/if}
        </small>
      </div>
      <div class="score">
        <b class="mono">{chair.goodPct}%</b>
        <small>upright today</small>
      </div>
    </div>

    <div class="tabs" role="tablist" aria-label="Posture views">
      <button role="tab" aria-selected={tab === 'live'} onclick={() => (tab = 'live')}>Live</button>
      <button role="tab" aria-selected={tab === 'history'} onclick={() => (tab = 'history')}>History</button>
    </div>
  </div>

  {#if tab === 'live'}
    <div class="maps">
      <figure>
        <figcaption>Backrest contact</figcaption>
        <div class="back" aria-label="Backrest contact now">
          {#each backNow as v}
            <i style:background={v ? COLOR[chair.currentTone] : '#23262d'}></i>
          {/each}
        </div>
        <small>Filled squares are touching your back.</small>
      </figure>

      <figure>
        <figcaption>Seat pressure</figcaption>
        <span class="axis">front edge</span>
        <div class="seat" aria-label="Seat pressure now">
          {#each seatNow as v}
            <i style:background={heatColor(v)}></i>
          {/each}
        </div>
        <small class="mono">{balanceNow ? `left ${balanceNow[0]}% · right ${balanceNow[1]}%` : 'Empty seat'}</small>
      </figure>
    </div>

    <p class="how">
      The chair records these sensors for you. If you stay slumped or leaning for a few minutes, it shows one quiet
      note at the top of the screen.
    </p>
  {:else}
    <div class="maps">
      <figure>
        <figcaption>Backrest today</figcaption>
        <div class="back" aria-label="Backrest contact history">
          {#each chair.backHeat as v, i}
            <i style:background={heatColor(v / backMax)} title="{Math.round((v / backMax) * 100)}% of the most used spot"></i>
          {/each}
        </div>
        <small>Brighter = touched longer</small>
      </figure>

      <figure>
        <figcaption>Seat today</figcaption>
        <span class="axis">front edge</span>
        <div class="seat" aria-label="Seat pressure history">
          {#each chair.seatHeat as v, i}
            <i style:background={heatColor(v / seatMax)} title="{Math.round((v / seatMax) * 100)}% of the most used spot"></i>
          {/each}
        </div>
        <small class="mono">{balanceDay ? `left ${balanceDay[0]}% · right ${balanceDay[1]}%` : '--'}</small>
      </figure>

      <div class="scale" aria-hidden="true">
        <span>More time</span>
        <i></i>
        <span>Less</span>
      </div>
    </div>

    <p class="note">{seatNote}</p>

    <div class="tl">
      <span class="lbl">
        Posture timeline{first ? ` · since ${fmtTimeOfDay(first.start)}` : ''}
      </span>
      {#if blocks.length}
        <div class="bar" role="img" aria-label="Posture over time">
          {#each blocks as b}
            <i style:left="{b.left}%" style:width="{Math.max(b.w, 0.4)}%" style:background={POSTURE_COLOR[b.posture]}></i>
          {/each}
        </div>
        <div class="key">
          {#each used as k}
            <span><i style:background={POSTURE_COLOR[k]}></i>{POSTURES[k].label}</span>
          {/each}
        </div>
      {:else}
        <p class="empty">Sit down to start recording.</p>
      {/if}
    </div>

    <div class="log">
      <span class="lbl">Recent movement</span>
      {#each recent as e}
        <div class="ev"><span class="mono">{fmtTimeOfDay(e.t)}</span><b style:color={COLOR[e.tone]}>{e.text}</b></div>
      {:else}
        <p class="empty">Nothing yet.</p>
      {/each}
    </div>
  {/if}

  <button class="toggle" class:off={!chair.tracking} onclick={() => (chair.tracking = !chair.tracking)} aria-pressed={chair.tracking}>
    <Icon name={chair.tracking ? 'eye' : 'eyeoff'} size={17} />
    {chair.tracking ? 'Recording on' : 'Recording paused'}
  </button>
</div>

<style>
  .wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: auto;
  }
  .lbl {
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dev-muted);
    display: block;
  }
  .top {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .now {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--dev-1);
    border: 1px solid var(--dev-edge);
    border-radius: 16px;
  }
  .ring {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--c);
    border: 2px solid var(--c);
    background: color-mix(in srgb, var(--c) 12%, transparent);
    transition: all 0.4s;
  }
  .txt {
    flex: 1;
  }
  .now b {
    display: block;
    font-size: 18px;
    color: var(--c);
  }
  .now small {
    color: var(--dev-muted);
    font-size: 12px;
  }
  .score {
    text-align: right;
  }
  .score b {
    color: var(--dev-text);
    font-size: 22px;
  }
  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    padding: 3px;
    background: var(--dev-1);
    border: 1px solid var(--dev-edge);
    border-radius: 12px;
  }
  .tabs button {
    border: 0;
    border-radius: 9px;
    padding: 7px;
    background: transparent;
    color: var(--dev-muted);
    font-size: 13px;
  }
  .tabs button[aria-selected='true'] {
    background: var(--dev-text);
    color: var(--dev-bg);
    font-weight: 700;
  }
  .maps {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 30px;
    padding: 6px 0;
    flex-wrap: wrap;
  }
  figure {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  figcaption {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dev-muted);
  }
  figure small {
    font-size: 11.5px;
    color: var(--dev-muted);
  }
  .back {
    display: grid;
    grid-template-columns: repeat(2, 24px);
    grid-auto-rows: 17px;
    gap: 3px;
    padding: 6px;
    border-radius: 14px;
    border: 1px solid var(--dev-edge);
    background: var(--dev-1);
  }
  .seat {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 3px;
    width: 156px;
    height: 156px;
    padding: 6px;
    border-radius: 14px;
    border: 1px solid var(--dev-edge);
    background: var(--dev-1);
  }
  .back i,
  .seat i {
    border-radius: 4px;
    transition: background 0.3s;
  }
  .axis {
    font-size: 9.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dev-muted);
  }
  .scale {
    flex-basis: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 11px;
    color: var(--dev-muted);
  }
  .scale i {
    width: 120px;
    height: 8px;
    border-radius: 4px;
    background: linear-gradient(90deg, hsl(0 62% 50%), hsl(75 62% 40%), hsl(150 62% 30%));
  }
  .how,
  .note {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: var(--dev-muted);
    text-align: center;
  }
  .note {
    color: var(--dev-text);
  }
  .tl {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .bar {
    position: relative;
    height: 22px;
    border-radius: 8px;
    background: var(--dev-1);
    border: 1px solid var(--dev-edge);
    overflow: hidden;
  }
  .bar i {
    position: absolute;
    top: 0;
    bottom: 0;
  }
  .key {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    font-size: 12px;
  }
  .key span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .key i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
  .log {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .ev {
    display: flex;
    gap: 12px;
    font-size: 12.5px;
  }
  .ev span {
    color: var(--dev-muted);
    min-width: 64px;
  }
  .empty {
    margin: 0;
    font-size: 12.5px;
    color: var(--dev-muted);
  }
  .toggle {
    margin-top: auto;
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    font-size: 13px;
    border-radius: 999px;
    border: 1px solid var(--dev-edge);
    background: var(--dev-1);
    flex: none;
  }
  .toggle.off {
    color: var(--warn);
    border-color: rgba(240, 179, 90, 0.5);
  }
</style>
