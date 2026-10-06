<script>
  // this is the touch screen on the armrest it shows a header with the time and session timer any alert banner
  // and then whichever screen is open home session posture or insights the slider sits on its right side
  import { chair } from '../lib/chair.svelte.js';
  import { fmtClockDur, fmtTimeOfDay } from '../lib/format.js';
  import Icon from './Icon.svelte';
  import Slider from './Slider.svelte';
  import Home from './screens/Home.svelte';
  import SessionScreen from './screens/SessionScreen.svelte';
  import PostureScreen from './screens/PostureScreen.svelte';
  import InsightsScreen from './screens/InsightsScreen.svelte';

  // the name shown at the top when you are inside a screen next to the back arrow
  const TITLES = { session: 'Sitting session', posture: 'Posture', insights: 'Insights' };
</script>

<section class="armrest" aria-label="Armrest touch panel">
  <div class="screen">
    <header>
      {#if chair.screen !== 'home'}
        <button class="back" onclick={() => (chair.screen = 'home')} aria-label="Back to home">
          <Icon name="back" size={18} />
        </button>
        <h3>{TITLES[chair.screen]}</h3>
      {:else}
        <div class="who">
          <span class="avatar">{chair.profile.initials}</span>
          <span>
            <b>{chair.profile.name}</b>
            <small>{chair.profile.blurb}</small>
          </span>
        </div>
      {/if}

      <div class="status">
        <span class="time mono">{fmtTimeOfDay(chair.clock)}</span>
        <span class="pill" class:on={chair.seated} data-tone={chair.currentTone}>
          {#if chair.seated}
            <i></i><span class="mono">{fmtClockDur(chair.sessionSec)}</span>
          {:else}
            Standby
          {/if}
        </span>
      </div>
    </header>

    {#if chair.alertActive}
      <div class="banner alert" role="alert">
        <span class="bell"><Icon name="sound" size={18} /></span>
        <div>
          <b>Time to move</b>
          <small>Seated {Math.round(chair.sessionSec / 60)} min. Stand up and stretch for a couple of minutes.</small>
        </div>
        <button onclick={() => chair.snooze(5)}>Snooze 5 min</button>
      </div>
    {:else if chair.autoPhase === 'moving' || chair.autoPhase === 'done'}
      <div class="banner auto" role="status">
        <span class="aicon"><Icon name="auto" size={18} /></span>
        <div>
          {#if chair.autoPhase === 'moving'}
            <b>Adjusting your chair</b>
            <small>Easing to your optimal settings and sitting you upright. Touch a control to stop.</small>
          {:else}
            <b>Chair adjusted</b>
            <small>Now at your optimal settings, sitting upright.</small>
          {/if}
        </div>
        {#if chair.autoPhase === 'moving'}
          <button onclick={() => chair.stopAuto()}>Stop</button>
        {:else}
          <button onclick={() => chair.undoAuto()}>Undo</button>
        {/if}
      </div>
    {:else if chair.nudge}
      <div class="banner nudge" role="status">
        <span class="dot"></span>
        <small>{chair.nudge}</small>
        <button class="x" onclick={() => chair.dismissNudge()} aria-label="Dismiss"><Icon name="x" size={14} /></button>
      </div>
    {/if}

    <div class="body">
      {#if chair.screen === 'home'}
        <Home />
      {:else if chair.screen === 'session'}
        <SessionScreen />
      {:else if chair.screen === 'posture'}
        <PostureScreen />
      {:else if chair.screen === 'insights'}
        <InsightsScreen />
      {/if}
    </div>
  </div>

  <div class="sliderpad"><Slider /></div>
</section>

<style>
  .armrest {
    display: grid;
    grid-template-columns: 1fr 138px;
    gap: 10px;
    padding: 10px;
    height: 100%;
    background: linear-gradient(160deg, #20232a, #191b20);
    border: 1px solid var(--dev-edge);
    border-radius: 22px;
    box-shadow: 0 18px 40px -22px rgba(0, 0, 0, 0.55);
    color: var(--dev-text);
  }
  .screen,
  .sliderpad {
    background: var(--dev-bg);
    border: 1px solid var(--dev-edge);
    border-radius: 16px;
    min-height: 0;
  }
  .screen {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--dev-edge);
    min-height: 56px;
  }
  header h3 {
    margin: 0 auto 0 0;
    font-size: 15px;
    font-weight: 600;
  }
  .back {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    border: 1px solid var(--dev-edge);
    background: var(--dev-1);
  }
  .who {
    display: flex;
    gap: 9px;
    align-items: center;
  }
  .who b {
    display: block;
    font-size: 14px;
    line-height: 1.1;
  }
  .who small {
    display: block;
    color: var(--dev-muted);
    font-size: 11px;
  }
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    background: #2e3a35;
    color: var(--good);
    border: 1px solid #3f5249;
  }
  .status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
  }
  .time {
    font-size: 12px;
    color: var(--dev-muted);
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    padding: 2px 9px;
    border-radius: 999px;
    border: 1px solid var(--dev-edge);
    color: var(--dev-muted);
  }
  .pill.on {
    color: var(--dev-text);
  }
  .pill i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--good);
  }
  .pill[data-tone='warn'] i {
    background: var(--warn);
  }
  .pill[data-tone='alert'] i {
    background: var(--alert);
  }
  .body {
    flex: 1;
    min-height: 0;
    padding: 12px;
    overflow: hidden;
  }

  .banner {
    margin: 10px 12px 0;
    border-radius: 12px;
    animation: slide 0.28s ease-out;
  }
  .alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    background: rgba(240, 179, 90, 0.14);
    border: 1px solid rgba(240, 179, 90, 0.5);
  }
  .alert div {
    flex: 1;
  }
  .alert b {
    display: block;
    font-size: 13px;
    color: var(--warn);
  }
  .alert small {
    font-size: 11.5px;
    opacity: 0.85;
  }
  .alert button {
    border: 1px solid rgba(240, 179, 90, 0.6);
    background: transparent;
    color: var(--warn);
    border-radius: 9px;
    padding: 6px 10px;
    font-size: 12px;
    white-space: nowrap;
  }
  .bell {
    color: var(--warn);
    display: grid;
    animation: ring 1.6s ease-in-out infinite;
    transform-origin: 50% 20%;
  }
  .auto {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    background: rgba(127, 194, 155, 0.12);
    border: 1px solid rgba(127, 194, 155, 0.5);
  }
  .auto div {
    flex: 1;
  }
  .auto b {
    display: block;
    font-size: 13px;
    color: var(--good);
  }
  .auto small {
    font-size: 11.5px;
    opacity: 0.85;
  }
  .auto button {
    border: 1px solid rgba(127, 194, 155, 0.6);
    background: transparent;
    color: var(--good);
    border-radius: 9px;
    padding: 6px 10px;
    font-size: 12px;
  }
  .aicon {
    color: var(--good);
    display: grid;
  }
  .nudge {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    background: var(--dev-1);
    border: 1px solid var(--dev-edge);
  }
  .nudge .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--warn);
  }
  .nudge small {
    flex: 1;
    font-size: 12px;
  }
  .x {
    border: 0;
    background: transparent;
    color: var(--dev-muted);
    display: grid;
  }
  @keyframes slide {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
  @keyframes ring {
    0%,
    60%,
    100% {
      rotate: 0deg;
    }
    10%,
    30% {
      rotate: 14deg;
    }
    20%,
    40% {
      rotate: -14deg;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .bell {
      animation: none;
    }
  }
</style>
