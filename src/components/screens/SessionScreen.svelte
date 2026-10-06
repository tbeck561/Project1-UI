<script>
  // the session screen the big timer for the current sitting session a bar that fills up toward the next break
  // settings for how often to be reminded and the auto adjust controls
  import { chair } from '../../lib/chair.svelte.js';
  import { fmtClockDur, fmtDur } from '../../lib/format.js';
  import Icon from '../Icon.svelte';

  // how full the break bar is zero is just sat down one is time for a break
  const pct = $derived(Math.min(1, chair.sessionSec / (chair.breakMin * 60)));
  const remaining = $derived(Math.max(0, chair.breakMin * 60 - chair.sessionSec));
</script>

<div class="wrap">
  <div class="big">
    <span class="lbl">Current session</span>
    <span class="num mono" class:dim={!chair.seated}>{fmtClockDur(chair.sessionSec)}</span>
    <span class="sub">
      {#if !chair.seated}
        Standby. The timer resumes when you sit.
      {:else if chair.alertActive}
        Past your {chair.breakMin} min limit
      {:else}
        Break in {fmtDur(remaining)}
      {/if}
    </span>
  </div>

  <div class="bar" aria-label="Progress to next break">
    <div class="fill" class:over={pct >= 1} style:width="{pct * 100}%"></div>
  </div>

  <div class="row">
    <div class="stat"><b class="mono">{fmtDur(chair.dailySec)}</b><small>seated today</small></div>
    <div class="stat"><b class="mono">{chair.breaks}</b><small>breaks</small></div>
    <div class="stat"><b class="mono">{fmtDur(chair.longestSec)}</b><small>longest stretch</small></div>
  </div>

  <div class="interval">
    <span class="lbl">Remind me every</span>
    <div class="stepper">
      <button onclick={() => chair.set('breakMin', chair.breakMin - 5)} aria-label="Shorter interval"><Icon name="minus" size={16} /></button>
      <span class="mono">{chair.breakMin} min</span>
      <button onclick={() => chair.set('breakMin', chair.breakMin + 5)} aria-label="Longer interval"><Icon name="plus" size={16} /></button>
    </div>
  </div>

  <div class="auto" class:on={chair.autoAdjust}>
    <div class="arow">
      <span class="aico"><Icon name="auto" size={20} /></span>
      <span class="atxt">
        <b>Auto adjust</b>
        <small>
          {#if !chair.autoAdjust}
            Off. The chair keeps your settings.
          {:else if chair.autoPhase === 'moving'}
            Adjusting to your optimal settings…
          {:else if !chair.seated}
            On. Starts {chair.autoMin} min after you sit.
          {:else if chair.autoPhase === 'done' || chair._autoDone}
            Adjusted this session.
          {:else}
            Adjusts in {fmtDur(Math.max(0, chair.autoMin * 60 - chair.sessionSec))}.
          {/if}
        </small>
      </span>
      <button
        class="switch"
        role="switch"
        aria-checked={chair.autoAdjust}
        aria-label="Auto adjust"
        onclick={() => chair.setAutoAdjust(!chair.autoAdjust)}
      >
        <span class="knob"></span>
        <span class="st">{chair.autoAdjust ? 'On' : 'Off'}</span>
      </button>
    </div>

    <div class="arow sub2" class:disabled={!chair.autoAdjust}>
      <span class="lbl">Adjust after</span>
      <div class="stepper">
        <button onclick={() => chair.set('autoMin', chair.autoMin - 5)} aria-label="Adjust sooner" disabled={!chair.autoAdjust}><Icon name="minus" size={16} /></button>
        <span class="mono">{chair.autoMin} min</span>
        <button onclick={() => chair.set('autoMin', chair.autoMin + 5)} aria-label="Adjust later" disabled={!chair.autoAdjust}><Icon name="plus" size={16} /></button>
      </div>
    </div>

    <div class="opt mono">
      Optimal for {chair.profile.name}: {chair.optimal.heat === 0 ? 'neutral' : chair.optimal.heat > 0 ? 'warm ' + chair.optimal.heat : 'cool ' + -chair.optimal.heat} ·
      recline {chair.optimal.recline}% · lumbar {chair.optimal.lumbar}%
    </div>
  </div>
</div>

<style>
  .wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .lbl {
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--dev-muted);
  }
  .big {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .num {
    font-size: 44px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .num.dim {
    color: var(--dev-muted);
  }
  .sub {
    font-size: 13px;
    color: var(--dev-muted);
  }
  .bar {
    height: 8px;
    background: var(--dev-1);
    border: 1px solid var(--dev-edge);
    border-radius: 6px;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: var(--good);
    transition: width 0.25s linear;
  }
  .fill.over {
    background: var(--warn);
  }
  .row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .stat {
    display: flex;
    flex-direction: column;
    padding: 10px 12px;
    background: var(--dev-1);
    border: 1px solid var(--dev-edge);
    border-radius: 12px;
  }
  .stat b {
    font-size: 19px;
  }
  .stat small {
    color: var(--dev-muted);
    font-size: 11.5px;
  }
  .interval {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
  }
  .stepper {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .stepper button {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    border: 1px solid var(--dev-edge);
    background: var(--dev-1);
  }
  .stepper span {
    min-width: 66px;
    text-align: center;
    font-size: 14px;
  }
  .auto {
    padding: 10px 12px;
    border-radius: 14px;
    background: var(--dev-1);
    border: 1px solid var(--dev-edge);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .auto.on {
    border-color: var(--good);
  }
  .arow {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }
  .arow.disabled {
    opacity: 0.45;
  }
  .aico {
    color: var(--dev-muted);
    display: grid;
  }
  .auto.on .aico {
    color: var(--good);
  }
  .atxt {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .atxt b {
    font-size: 14px;
  }
  .atxt small {
    font-size: 12px;
    color: var(--dev-muted);
  }
  .switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px 4px 4px;
    border-radius: 999px;
    border: 1px solid var(--dev-edge);
    background: var(--dev-bg);
    color: var(--dev-text);
    font-size: 12.5px;
    font-weight: 600;
    min-width: 66px;
  }
  .knob {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--dev-muted);
    transition: transform 0.15s, background 0.15s;
  }
  .switch[aria-checked='true'] {
    border-color: var(--good);
  }
  .switch[aria-checked='true'] .knob {
    background: var(--good);
    transform: translateX(0);
  }
  .opt {
    font-size: 11.5px;
    color: var(--dev-muted);
  }
  .stepper button:disabled {
    cursor: not-allowed;
  }
</style>
