const pad = (n) => String(n).padStart(2, '0');

// turns a number of seconds into friendly text like one h five m or just twelve m forty five s when it is short
// used for things like seated today
export function fmtDur(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${pad(m)}m`;
  if (m > 0) return `${m}m`;
  return `${sec}s`;
}

// turns seconds into a running clock like twelve five or one two five once it passes an hour
// used for the big session timer
export function fmtClockDur(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// turns seconds since midnight into a normal clock time like two thirty five pm for the armrest screen
export function fmtTimeOfDay(sec) {
  sec = Math.floor(sec) % 86400;
  const h24 = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${pad(m)} ${h24 < 12 ? 'AM' : 'PM'}`;
}
