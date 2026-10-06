<script>
  // the side view drawing of the chair and person on the left it moves for real the backrest tilts when you change the recline
  // and the body changes shape with the sensed posture so you can see what the chair is detecting
  import { chair } from '../lib/chair.svelte.js';

  // zone is which numbered part to highlight when the mouse is over a panel compact makes the drawing smaller
  let { zone = null, compact = false } = $props();

  const rad = (d) => (d * Math.PI) / 180;
  // the color for each state of the chair
  const TONE = { good: 'var(--good)', warn: 'var(--warn)', alert: 'var(--alert)', idle: 'var(--idle)' };

  // how far back the backrest is tilted more recline means more tilt
  const lean = $derived(8 + chair.recline * 0.3); // backrest tilt in degrees
  const tone = $derived(TONE[chair.currentTone]);

  // works out where the body parts go hips shoulders head knees feet hand and elbow
  // slouching slides the hips forward and curves the back leaning forward tips the body toward the knees
  // and upright sits straight against the backrest
  const body = $derived.by(() => {
    const p = chair.posture;
    const hipShift = p === 'slouch' ? 24 : p === 'forward' ? 8 : 0;
    const theta = p === 'forward' ? 20 : p === 'slouch' ? -lean + 4 : -lean;
    const bulge = p === 'slouch' ? 24 : p === 'forward' ? 2 : 6;
    const headTurn = p === 'slouch' ? 26 : p === 'forward' ? 10 : 0;
    const H = { x: 205 + hipShift, y: 288 };
    const L = 120;
    const S = { x: H.x + L * Math.sin(rad(theta)), y: H.y - L * Math.cos(rad(theta)) };
    const M = { x: (H.x + S.x) / 2, y: (H.y + S.y) / 2 };
    const C = { x: M.x - bulge * Math.cos(rad(theta)), y: M.y - bulge * Math.sin(rad(theta)) };
    const th = theta + headTurn;
    const head = { x: S.x + 34 * Math.sin(rad(th)), y: S.y - 34 * Math.cos(rad(th)) };
    const K = { x: H.x + 128, y: 282 };
    const F = { x: K.x + 8, y: 414 };
    const hand = { x: 292, y: 226 };
    const elbow = { x: S.x + 6, y: S.y + 66 };
    return { H, S, C, head, K, F, hand, elbow };
  });

  // the seat glows orange for heat or blue for cooling and does not glow when it is off or empty
  const seatGlow = $derived(
    chair.seated && chair.heat !== 0 ? (chair.heat > 0 ? 'var(--heat)' : 'var(--cool)') : 'transparent'
  );
</script>

<figure class:compact>
  <svg viewBox="68 30 360 410" role="img" aria-label="Side view of the smart chair with the three interface surfaces highlighted">
    <!-- floor -->
    <ellipse cx="260" cy="428" rx="130" ry="7" fill="rgba(0,0,0,0.12)" />

    <!-- base -->
    <rect x="248" y="332" width="14" height="62" rx="5" fill="#3a3d45" />
    <path d="M255 394 L186 412 M255 394 L324 412" stroke="#3a3d45" stroke-width="10" stroke-linecap="round" />
    <circle cx="186" cy="418" r="8" fill="#23252b" />
    <circle cx="324" cy="418" r="8" fill="#23252b" />
    <circle cx="255" cy="420" r="8" fill="#23252b" />

    <!-- backrest rotates with recline -->
    <g transform="rotate({-lean} 172 300)" class="rot">
      <rect x="150" y="56" width="34" height="244" rx="17" fill="#2b2e36" />
      <rect x="145" y="40" width="44" height="36" rx="16" fill="#353944" />
      <!-- lumbar bulge -->
      <ellipse cx="185" cy="214" rx={3 + chair.lumbar * 0.13} ry="36" fill="#434856" class="lumbar" />
      <!-- the backrest sensors are hidden inside the cushion their readings are recorded on the touch panel -->
    </g>

    <!-- person -->
    {#if chair.seated}
      <g class="person" stroke={tone}>
        <path d="M{body.H.x} {body.H.y} L{body.K.x} {body.K.y} L{body.F.x} {body.F.y}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.22" />
        <path d="M{body.H.x} {body.H.y} Q{body.C.x} {body.C.y} {body.S.x} {body.S.y}" stroke-width="30" stroke-linecap="round" fill="none" opacity="0.3" />
        <path d="M{body.S.x} {body.S.y} Q{body.elbow.x} {body.elbow.y} {body.hand.x} {body.hand.y}" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.28" />
        <circle cx={body.head.x} cy={body.head.y} r="19" fill={tone} fill-opacity="0.22" stroke-width="2" />
      </g>
    {:else}
      <text x="258" y="200" class="empty" text-anchor="middle">Nobody seated</text>
    {/if}

    <!-- seat its pressure sensors are recorded on the touch panel -->
    <rect x="150" y="290" width="214" height="38" rx="15" fill="#2b2e36" />
    <rect x="156" y="294" width="202" height="12" rx="6" fill={seatGlow} opacity="0.55" class="seatglow" />

    <!-- armrest zone one -->
    <rect x="200" y="226" width="150" height="14" rx="7" fill="#353944" />
    <rect x="212" y="238" width="10" height="52" rx="4" fill="#353944" />
    <rect x="262" y="221" width="76" height="7" rx="3.5" fill="#bfe3cf" opacity={chair.seated ? 0.95 : 0.5} />
    <rect x="254" y="212" width="92" height="34" rx="14" class="zone" class:on={zone === 'arm'} fill="none" />

    <!-- zone badges -->
    <g class="badge"><circle cx="360" cy="212" r="10" /><text x="360" y="216" text-anchor="middle">1</text></g>
  </svg>

  {#if !compact}
    <figcaption>
      <span><b>1</b> Armrest touch panel. It shows and records the seat and backrest sensors.</span>
    </figcaption>
  {/if}
</figure>

<style>
  figure {
    margin: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  svg {
    width: 100%;
    flex: 1;
    min-height: 0;
  }
  .rot,
  .strip,
  .lumbar,
  .seatglow,
  circle {
    transition: all 0.45s ease;
  }
  .person path,
  .person circle {
    transition: all 0.5s ease;
  }
  .zone {
    stroke: rgba(240, 179, 90, 0.5);
    stroke-width: 1.5;
    stroke-dasharray: 4 4;
    transition: all 0.2s;
  }
  .zone.on {
    stroke: var(--warn);
    stroke-width: 2.5;
    stroke-dasharray: none;
    fill: rgba(240, 179, 90, 0.12);
  }
  .badge circle {
    fill: var(--warn);
  }
  .badge text {
    font: 700 12px var(--sans);
    fill: #1b1507;
  }
  .empty {
    font: 500 13px var(--sans);
    fill: var(--dev-muted);
  }
  .pulse {
    animation: breathe 2.4s ease-in-out infinite;
  }
  @keyframes breathe {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.25;
    }
  }
  figcaption {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 12.5px;
    color: var(--dev-muted);
    padding: 0 6px 4px;
  }
  figcaption b {
    display: inline-grid;
    place-items: center;
    width: 18px;
    height: 18px;
    margin-right: 6px;
    border-radius: 50%;
    background: var(--warn);
    color: #1b1507;
    font-size: 11px;
  }
  .compact .zone {
    stroke-width: 3;
    stroke-dasharray: none;
    fill: rgba(240, 179, 90, 0.2);
    stroke: var(--warn);
  }
  @media (prefers-reduced-motion: reduce) {
    .pulse {
      animation: none;
    }
  }
</style>
