<script>
  // the small line drawings used for buttons and tiles give it a name and a size and it draws that icon
  let { name, size = 20 } = $props();

  // the shape of each icon so every picture in the app comes from one place and matches in style
  const PATHS = {
    timer: '<circle cx="12" cy="13" r="7.5"/><path d="M12 13V9M9.5 3h5"/>',
    posture: '<circle cx="12" cy="5" r="2.2"/><path d="M12 8.2v6M8 10.5c2.4 1.2 5.6 1.2 8 0M12 14.2l-3 6M12 14.2l3 6"/>',
    heat: '<path d="M12 3c.8 3.2 5.2 5 5.2 10.2a5.2 5.2 0 0 1-10.4 0c0-2 1-3.4 2.2-4.4.2 1.8 1 2.8 2 3 .4-3-.8-5.2 1-8.8z"/>',
    recline: '<path d="M5.5 4l3.2 11h9.3M8.7 15v5M18 15v5"/>',
    lumbar: '<path d="M12 3c3.2 3 3.2 6 0 9s-3.2 6 0 9"/><path d="M8 6.5h8M8 12h8M8 17.5h8"/>',
    stats: '<path d="M5 20V11M12 20V4M19 20v-6"/>',
    routine: '<path d="M10 6h10M10 12h10M10 18h6"/><circle cx="5" cy="6" r="1.2"/><circle cx="5" cy="12" r="1.2"/><circle cx="5" cy="18" r="1.2"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/>',
    sound: '<path d="M4 9.5v5h3.8l5 4V5.5l-5 4H4z"/><path d="M16.5 9a4.2 4.2 0 0 1 0 6"/>',
    mute: '<path d="M4 9.5v5h3.8l5 4V5.5l-5 4H4z"/><path d="M17 9.5l4 5M21 9.5l-4 5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    eyeoff: '<path d="M3 3l18 18M10.2 6a9 9 0 0 1 1.8-.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.4 7.6A16 16 0 0 0 2.5 12S6 18.5 12 18.5a8.6 8.6 0 0 0 3.6-.8"/>',
    auto: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18.5 15v4M16.5 17h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    snow: '<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"/>',
    seat: '<path d="M4 14h16l-1.5 4h-13zM6 14V9.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2V14"/>',
  };
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {@html PATHS[name] ?? ''}
</svg>
