<script>
  // the testing panel on the right since there is no real person in the chair these controls let you pretend
  // sit down change posture speed up time run a whole work day or switch to a different user
  import { chair, POSTURES } from '../lib/chair.svelte.js';
  import { PROFILES } from '../lib/profiles.js';
  import { fmtTimeOfDay } from '../lib/format.js';
  import ChairFigure from './ChairFigure.svelte';
  import Icon from './Icon.svelte';

  // the choices for how fast demo time runs normal sixty times faster or six hundred times faster
  const SPEEDS = [
    { v: 1, l: '×1' },
    { v: 60, l: '×60' },
    { v: 600, l: '×600' },
  ];
</script>

<aside aria-label="Testing UI">
  <div class="tag">
    <span>Testing UI</span>
  </div>

  <section>
    <h4>Simulate the sitter</h4>
    <button class="seat" class:down={chair.seated} onclick={() => (chair.seated ? chair.stand() : chair.sit())}>
      <Icon name="seat" size={20} />
      {chair.seated ? 'Stand up' : 'Sit down'}
    </button>
    <div class="postures" role="group" aria-label="Posture">
      {#each Object.entries(POSTURES) as [k, p]}
        <button disabled={!chair.seated} class:on={chair.seated && chair.posture === k} onclick={() => chair.setPosture(k)}>
          {p.label}
        </button>
      {/each}
    </div>
  </section>

  <section>
    <h4>Time <span class="mono clock">{fmtTimeOfDay(chair.clock)}</span></h4>
    <div class="seg" role="group" aria-label="Time speed">
      {#each SPEEDS as s}
        <button class:on={chair.speed === s.v} disabled={chair.sim.running} onclick={() => (chair.speed = s.v)}>{s.l}</button>
      {/each}
    </div>
  </section>

  <section>
    <h4>Workday simulation</h4>
    {#if chair.sim.running}
      <div class="prog" aria-label="Simulation progress"><i style:width="{chair.simProgress * 100}%"></i></div>
      <button class="run stop" onclick={() => chair.stopDay()}>Stop simulation</button>
    {:else}
      <button class="run" onclick={() => chair.startDay()}>Run 9 AM – 5 PM</button>
    {/if}
    <small>Scripted sitting, posture changes and breaks at ×600.</small>
  </section>

  <section>
    <h4>Load a user</h4>
    <div class="users" role="radiogroup" aria-label="Mock user">
      {#each PROFILES as p (p.id)}
        <button role="radio" aria-checked={chair.profileId === p.id} class:on={chair.profileId === p.id} onclick={() => chair.loadProfile(p.id)}>
          <b>{p.name}</b>
          <small>{p.blurb}</small>
        </button>
      {/each}
    </div>
  </section>

  <section class="where">
    <h4>Where the UI lives</h4>
    <div class="fig"><ChairFigure compact /></div>
    <ol>
      <li>Armrest touch panel: everything, including the recorded seat and backrest sensors</li>
    </ol>
  </section>
</aside>

<style>
  aside {
    width: 330px;
    flex: none;
    padding: 14px 18px 18px;
    background: var(--paper-2);
    border-left: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    gap: 13px;
    overflow: auto;
  }
  .tag {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-2);
  }
  h4 {
    margin: 0 0 8px;
    font-size: 12.5px;
    letter-spacing: 0.04em;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .clock {
    font-weight: 500;
    color: var(--ink-2);
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  button {
    border: 1px solid var(--line);
    background: #fff;
    border-radius: 10px;
    padding: 8px 10px;
    font-size: 13px;
  }
  .seat {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 11px;
    font-weight: 600;
    background: var(--accent);
    border-color: var(--accent);
    color: #f1f5f2;
  }
  .seat.down {
    background: #fff;
    color: var(--ink);
    border-color: var(--ink);
  }
  .postures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .postures button.on,
  .seg button.on,
  .users button.on {
    background: var(--ink);
    color: var(--paper-2);
    border-color: var(--ink);
  }
  .seg {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .run {
    font-weight: 600;
    padding: 10px;
  }
  .run.stop {
    border-color: #b5503d;
    color: #b5503d;
  }
  .prog {
    height: 6px;
    border-radius: 4px;
    background: var(--line);
    overflow: hidden;
  }
  .prog i {
    display: block;
    height: 100%;
    background: var(--accent);
  }
  small {
    color: var(--ink-2);
    font-size: 12px;
  }
  .users {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .users button {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 9px 10px;
  }
  .users button.on small {
    color: #c9c6bd;
  }
  .users small {
    font-size: 11px;
    line-height: 1.25;
  }
  .where {
    margin-top: auto;
  }
  .fig {
    height: 150px;
    background: var(--paper);
    border-radius: 12px;
    padding: 4px;
  }
  ol {
    margin: 0;
    padding-left: 20px;
    font-size: 12.5px;
    color: var(--ink-2);
  }
</style>
