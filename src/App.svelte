<script>
  // this is the page itself the chair interface on the left the device ui and the testing controls on the right
  import { onMount } from 'svelte';
  import { chair } from './lib/chair.svelte.js';
  import ChairFigure from './components/ChairFigure.svelte';
  import ArmrestPanel from './components/ArmrestPanel.svelte';
  import TestingPanel from './components/TestingPanel.svelte';

  // which part of the chair the mouse is over armrest backrest or seat so the drawing can highlight it
  let zone = $state(null);

  // start the clock when the page opens four times a second the chair is told that a little time has passed
  // which is what makes the timers seat temperature and posture tracking run it stops when the page closes
  onMount(() => {
    const id = setInterval(() => chair.tick(0.25), 250);
    return () => clearInterval(id);
  });
</script>

<header class="top">
  <div>
    <h1>Smart Chair</h1>
    <p>Project 1 · Interface to a Smart Object</p>
  </div>
  <nav>
    <span class="by">Tyler Beck</span>
  </nav>
</header>

<main>
  <section class="device" aria-label="Device UI">
    <div class="tag"><span>Device UI</span> the chair's touch panel. the seat and backrest sensors are recorded here</div>
    <div class="layout">
      <div class="figure"><ChairFigure {zone} /></div>

      <div class="panels">
        <div class="arm" role="group" onmouseenter={() => (zone = 'arm')} onmouseleave={() => (zone = null)}>
          <ArmrestPanel />
        </div>
      </div>
    </div>
  </section>

  <TestingPanel />
</main>


<style>
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 28px;
    border-bottom: 1px solid var(--line);
    background: var(--paper-2);
  }
  h1 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.01em;
    line-height: 1.1;
  }
  .top p {
    margin: 2px 0 0;
    font-size: 12.5px;
    color: var(--ink-2);
  }
  nav {
    display: flex;
    align-items: center;
    gap: 22px;
    font-size: 14px;
  }
  .by {
    font-weight: 600;
  }

  main {
    display: flex;
    min-height: calc(100vh - 66px);
  }
  .device {
    flex: 1;
    min-width: 0;
    padding: 16px 22px 22px;
    background: radial-gradient(1200px 600px at 30% 0%, #1f2229, var(--dev-bg));
    color: var(--dev-text);
  }
  .tag {
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--dev-muted);
    margin-bottom: 12px;
  }
  .tag span {
    color: var(--dev-text);
    margin-right: 10px;
    font-weight: 600;
  }
  .layout {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 22px;
    height: 760px;
  }
  .figure {
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid var(--dev-edge);
    border-radius: 22px;
    padding: 12px 8px 10px;
  }
  .panels {
    display: grid;
    grid-template-rows: 1fr;
    gap: 16px;
    min-height: 0;
  }
  .arm {
    min-height: 0;
  }
</style>
