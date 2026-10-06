// this file is the brain of the chair it remembers everything who is sitting for how long
// what posture they are in what the settings are and the screens just show what it says
// if you change how the chair behaves this is the file to change
import { POSTURE_KEYS, getProfile } from './profiles.js';
import { N, ROWS, seatPressure, backContact, zeros } from './pressure.js';

// the simulated work day starts at nine am counted in seconds after midnight
export const DAY_START = 9 * 3600;

// every posture the chair can sense with the name shown to the user
// a color tone good green warn amber alert stronger amber and a short explanation
export const POSTURES = {
  good: { label: 'Upright', tone: 'good', note: 'Balanced and supported' },
  slouch: { label: 'Slouching', tone: 'warn', note: 'Hips sliding forward, back rounded' },
  forward: { label: 'Leaning forward', tone: 'alert', note: 'Off the backrest, weight on the front of the seat' },
  leanL: { label: 'Leaning left', tone: 'warn', note: 'Weight shifted to the left' },
  leanR: { label: 'Leaning right', tone: 'warn', note: 'Weight shifted to the right' },
};

// the lowest and highest value each adjustable setting is allowed to have
// so a slider or button can never push the chair past what it can really do
export const LIMITS = { heat: [-3, 3], recline: [0, 100], lumbar: [0, 100], breakMin: [15, 120], autoMin: [1, 120] };

// the pretend work day used by the run nine am five pm button
// each line says when something happens and what the sitter does so you can watch
// the whole interface react without waiting around in real time
const DAY_SCRIPT = [
  { at: 0, act: 'sit' },
  { at: 18, act: 'slouch' },
  { at: 27, act: 'good' },
  { at: 38, act: 'leanL' },
  { at: 44, act: 'good' },
  { at: 50, act: 'stand' },
  { at: 56, act: 'sit' },
  { at: 70, act: 'slouch' },
  { at: 84, act: 'good' },
  { at: 105, act: 'forward' },
  { at: 112, act: 'good' },
  { at: 125, act: 'stand' },
  { at: 135, act: 'sit' },
  { at: 150, act: 'leanR' },
  { at: 160, act: 'good' },
  { at: 180, act: 'stand' }, // lunch break
  { at: 240, act: 'sit' },
  { at: 255, act: 'slouch' },
  { at: 275, act: 'good' },
  { at: 290, act: 'stand' },
  { at: 300, act: 'sit' },
  { at: 320, act: 'slouch' },
  { at: 335, act: 'forward' },
  { at: 345, act: 'good' },
  { at: 380, act: 'stand' },
  { at: 390, act: 'sit' },
  { at: 420, act: 'leanL' },
  { at: 440, act: 'good' },
  { at: 480, act: 'stand' },
  { at: 481, act: 'end' },
];

const clamp = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v));
// a fresh posture tally where every posture has zero seconds so far
const zeroPosture = () => Object.fromEntries(POSTURE_KEYS.map((k) => [k, 0]));
// normal room temperature in celsius which is what the seat cools down to when nobody is sitting
const AMBIENT = 24;

// the gentle messages shown on the armrest when someone has held a bad posture for a while
const NUDGES = {
  slouch: 'Sliding down a little. Sit back so the backrest can help.',
  forward: 'Leaning forward for a while. Try resting against the backrest.',
  leanL: 'Weight has been on your left. Shift to the middle?',
  leanR: 'Weight has been on your right. Shift to the middle?',
};

// one single chair object that the whole app shares
class Chair {
  // which user is loaded what time of day it is and how fast time runs in the demo
  profileId = $state('alex');
  clock = $state(DAY_START);
  speed = $state(1);

  // what the chairs sensors say right now is someone sitting and how are they sitting
  seated = $state(false);
  posture = $state('good');
  tracking = $state(true);

  // how much the person has sat today how many breaks they took and how long they have held each posture
  sessionSec = $state(0);
  dailySec = $state(0);
  longestSec = $state(0);
  breaks = $state(0);
  postureSecs = $state(zeroPosture());
  goodStreakSec = $state(0);
  badStreakSec = $state(0);

  // the comfort settings the person can change with the slider
  heat = $state(0);
  recline = $state(30);
  lumbar = $state(50);
  breakMin = $state(45);
  seatTemp = $state(AMBIENT);

  // auto adjust after the chosen number of minutes seated ease the chair to this users optimal settings
  autoAdjust = $state(false);
  autoMin = $state(10);
  optimal = $state({ heat: 0, recline: 30, lumbar: 50 });
  autoPhase = $state('idle'); // idle moving done

  // things the chair is telling the person right now like the break alert or a posture nudge
  // plus which screen is open and which setting the slider controls
  alertActive = $state(false);
  nudge = $state(null);
  screen = $state('home');
  sliderTarget = $state('heat');
  sim = $state({ running: false, idx: 0 });

  // what the sensors have recorded so the touch panel can show history
  // seatheat and backheat add up how long each seat square backrest sensor has been pressed today
  // segments is the posture timeline one entry per stretch in the same posture
  // and log is a short list of things that happened like slouching or chair adjusted
  seatHeat = $state(zeros(N * N));
  backHeat = $state(zeros(ROWS * 2));
  segments = $state([]);
  log = $state([]);

  // private notes the chair keeps for itself the screen does not need to redraw when these change
  _standAt = null;
  _snoozeUntil = 0;
  _nudgeCooldown = 0;
  _autoDone = false;
  _autoPrev = null;
  _autoTimer = null;
  _autoPrevPosture = null;
  _heatAcc = 0;

  // when the app starts begin with the first user alex
  constructor() {
    this.loadProfile('alex');
  }

  // handy values worked out from the state above so the screens do not have to do the math
  // the loaded users details their sitting goal in seconds and a description of the current posture
  profile = $derived(getProfile(this.profileId));
  goalSec = $derived(getProfile(this.profileId).goalHrs * 3600);
  postureInfo = $derived(POSTURES[this.posture]);
  // total seconds tracked and the percent of that time spent sitting upright
  postureTotal = $derived(Object.values(this.postureSecs).reduce((a, b) => a + b, 0));
  goodPct = $derived(this.postureTotal > 0 ? Math.round((this.postureSecs.good / this.postureTotal) * 100) : 0);
  // the color tone for the posture right now it stays posture based even during a break alert
  postureTone = $derived(this.seated ? POSTURES[this.posture].tone : 'idle');
  // the overall color tone for the chair the break alert takes over and turns it to alert
  currentTone = $derived(!this.seated ? 'idle' : this.alertActive ? 'alert' : POSTURES[this.posture].tone);
  // how far through the pretend work day we are from zero nine am to one end of day
  simProgress = $derived(Math.min(1, Math.max(0, (this.clock - DAY_START) / (481 * 60))));

  // profiles
  // switches to a different user their saved settings history for today and goals all replace the old ones
  // and the chair goes back to empty with nobody sitting
  loadProfile(id) {
    const p = getProfile(id);
    this.profileId = p.id;
    Object.assign(this, p.settings);
    this.optimal = { ...p.optimal };
    this.seated = false;
    this.posture = 'good';
    this.clock = p.today.clock;
    this.dailySec = p.today.sittingMin * 60;
    this.breaks = p.today.breaks;
    this.longestSec = p.today.longestMin * 60;
    this.postureSecs = Object.fromEntries(POSTURE_KEYS.map((k) => [k, (p.today.posture[k] ?? 0) * this.dailySec]));
    this.#resetSession();
    // fill the history with what this persons day has looked like so far based on their posture mix
    this.seatHeat = zeros(N * N);
    this.backHeat = zeros(ROWS * 2);
    for (const k of POSTURE_KEYS) {
      const secs = (p.today.posture[k] ?? 0) * this.dailySec;
      seatPressure(k).forEach((v, i) => (this.seatHeat[i] += v * secs));
      backContact(k).forEach((v, i) => (this.backHeat[i] += v * secs));
    }
    this.segments = [];
    this.log = [];
    this.sim = { running: false, idx: 0 };
    this.speed = 1;
    this.seatTemp = AMBIENT;
    this.screen = 'home';
  }

  // starts a clean sitting session timer back to zero and all alerts nudges and pending auto adjusts cleared
  #resetSession() {
    this.sessionSec = 0;
    this.goodStreakSec = 0;
    this.badStreakSec = 0;
    this.alertActive = false;
    this.nudge = null;
    this._standAt = null;
    this._snoozeUntil = 0;
    this._nudgeCooldown = 0;
    this.#clearAuto();
    this._autoDone = false;
  }

  // settings
  // changes one setting heat recline lumbar or a timer length never going outside its allowed range
  set(param, v) {
    this[param] = clamp(v, LIMITS[param]);
    // touching a setting by hand always wins over the automatic move
    if (this.autoPhase === 'moving' && ['heat', 'recline', 'lumbar'].includes(param)) this.#clearAuto();
  }

  // adds a line to the movement log shown on the touch panel keeps only the latest forty
  #record(text, tone = 'idle') {
    this.log.push({ t: this.clock, text, tone });
    if (this.log.length > 40) this.log.shift();
  }

  // auto adjust
  // turns the auto adjust feature on or off turning it off also stops an adjustment that is in progress
  setAutoAdjust(on) {
    this.autoAdjust = on;
    if (!on) this.#clearAuto();
  }

  // true when the chair already matches this users optimal settings
  get atOptimal() {
    const o = this.optimal;
    return this.heat === o.heat && this.recline === o.recline && this.lumbar === o.lumbar;
  }

  // begins moving the chair to the optimal settings it first remembers the current settings so the undo button can bring them back
  startAuto() {
    this._autoDone = true;
    // save the current settings and posture so undo can bring them back
    this._autoPrev = { heat: this.heat, recline: this.recline, lumbar: this.lumbar };
    this._autoPrevPosture = this.posture;
    this._heatAcc = 0;
    // the chair gently nudges the person upright as it adjusts so their posture becomes upright
    const straightened = this.posture !== 'good';
    if (straightened) this.setPosture('good');
    if (this.atOptimal && !straightened) return;
    this.#record('Auto adjust started', 'good');
    if (this.atOptimal) this.#finishAuto();
    else this.autoPhase = 'moving';
  }

  // the adjustment is complete show the chair adjusted message and hide it again after twelve seconds
  #finishAuto() {
    this.autoPhase = 'done';
    this.#record('Chair adjusted, sitting upright', 'good');
    clearTimeout(this._autoTimer);
    this._autoTimer = setTimeout(() => {
      if (this.autoPhase === 'done') this.autoPhase = 'idle';
    }, 12000);
  }

  // called as time passes while an adjustment is running it moves the recline and lumbar a little closer to the
  // target each step and heat one notch at a time so the chair eases into place instead of jumping
  #moveToOptimal(s) {
    const o = this.optimal;
    const stepToward = (cur, tgt, amt) => (cur < tgt ? Math.min(tgt, cur + amt) : Math.max(tgt, cur - amt));
    const amt = Math.max(1, Math.round(6 * s));
    this.recline = stepToward(this.recline, o.recline, amt);
    this.lumbar = stepToward(this.lumbar, o.lumbar, amt);
    this._heatAcc += s;
    if (this._heatAcc >= 2) {
      this._heatAcc = 0;
      this.heat = stepToward(this.heat, o.heat, 1);
    }
    if (this.atOptimal) this.#finishAuto();
  }

  // puts the settings back to what they were before the chair adjusted itself
  undoAuto() {
    if (this._autoPrev) Object.assign(this, this._autoPrev);
    // the person also goes back to how they were sitting before
    if (this._autoPrevPosture) this.setPosture(this._autoPrevPosture);
    this.#record('Auto adjust undone', 'idle');
    this.#clearAuto();
  }

  // stops the adjustment where it is the settings stay wherever they got to
  stopAuto() {
    this.#clearAuto();
  }

  // cancels any adjustment in progress and hides its banner
  #clearAuto() {
    clearTimeout(this._autoTimer);
    this.autoPhase = 'idle';
  }

  // user actions also driven by the testing panel
  // the person sits down if they were away for two or more minutes that counts as a break and the timer starts over
  sit() {
    if (this.seated) return;
    this.seated = true;
    this.posture = 'good';
    // away for two minutes counts as a break and starts a fresh session
    if (this._standAt !== null && this.clock - this._standAt >= 120) {
      this.sessionSec = 0;
      this.breaks += 1;
      this._autoDone = false;
      this.#clearAuto();
    }
    this._snoozeUntil = 0;
    this.#record('Sat down', 'good');
  }

  // the person stands up the timer pauses the longest stretch is saved and any alerts go away
  stand() {
    if (!this.seated) return;
    this.seated = false;
    this._standAt = this.clock;
    this.longestSec = Math.max(this.longestSec, this.sessionSec);
    this.alertActive = false;
    this.nudge = null;
    this.#record('Stood up', 'idle');
  }

  // change the sensed posture only matters while someone is sitting
  setPosture(p) {
    if (!this.seated || p === this.posture) return;
    this.posture = p;
    // write it in the movement log so it shows on the history screen
    this.#record(POSTURES[p].label, POSTURES[p].tone);
  }

  // hide the break alert for a few minutes it comes back if the person is still sitting after that
  snooze(min = 5) {
    this.alertActive = false;
    this._snoozeUntil = this.clock + min * 60;
  }

  dismissNudge() {
    this.nudge = null;
  }

  // time
  // called several times a second by the app it turns real time into demo time using the speed setting
  tick(dtReal) {
    this.advance(dtReal * this.speed);
  }

  // moves the chair forward in small chunks of up to thirty seconds so fast speeds never skip anything
  advance(dt) {
    for (let left = dt; left > 0; left -= 30) this.step(Math.min(left, 30));
  }

  // the heart of the chair everything that happens as time passes in order
  step(s) {
    this.clock += s;

    // if the pretend work day is running perform any sitter actions that are due now
    if (this.sim.running) {
      const rel = this.clock - DAY_START;
      // the loop also checks that the day is still running because the last script line ends the day
      // and without this check the script would start over again forever and freeze the page
      while (this.sim.running && this.sim.idx < DAY_SCRIPT.length && DAY_SCRIPT[this.sim.idx].at * 60 <= rel) {
        this.applyEvent(DAY_SCRIPT[this.sim.idx++]);
      }
    }

    // the seat warms or cools slowly toward the chosen heat level and drifts back to room temperature when empty
    const target = this.seated ? AMBIENT + this.heat * 3.5 : AMBIENT;
    this.seatTemp += (target - this.seatTemp) * (1 - Math.exp(-s / 150));

    // while an auto adjust is running keep moving the settings toward the optimal ones
    if (this.autoPhase === 'moving' && this.seated) this.#moveToOptimal(s);

    // nothing below counts unless someone is sitting and tracking is on
    if (!this.seated || !this.tracking) return;

    // add the passing time to the session timer todays total and the current postures tally
    this.sessionSec += s;
    this.dailySec += s;
    this.postureSecs[this.posture] += s;

    // record where the persons weight and back are right now into the history heat maps
    const seat = seatPressure(this.posture);
    const back = backContact(this.posture);
    for (let i = 0; i < seat.length; i++) this.seatHeat[i] += seat[i] * s;
    for (let i = 0; i < back.length; i++) this.backHeat[i] += back[i] * s;

    // extend the current stretch in the timeline or start a new one when the posture changed or they were away
    const last = this.segments[this.segments.length - 1];
    if (last && last.posture === this.posture && this.clock - last.end <= s + 1) last.end = this.clock;
    else this.segments.push({ posture: this.posture, start: this.clock - s, end: this.clock });
    if (this.segments.length > 150) this.segments.shift();
    this.longestSec = Math.max(this.longestSec, this.sessionSec);

    // posture feedback when upright the bad posture clock resets when not one quiet message appears after four minutes
    // then it stays quiet for twenty minutes so it never nags
    if (this.posture === 'good') {
      this.goodStreakSec += s;
      this.badStreakSec = 0;
      this.nudge = null;
    } else {
      this.badStreakSec += s;
      this.goodStreakSec = 0;
      if (!this.nudge && this.badStreakSec >= 240 && this.clock >= this._nudgeCooldown) {
        this.nudge = NUDGES[this.posture];
        this._nudgeCooldown = this.clock + 20 * 60;
      }
    }

    // break reminder
    if (!this.alertActive && this.sessionSec >= this.breakMin * 60 && this.clock >= this._snoozeUntil) {
      this.alertActive = true;
    }

    // auto adjust once per session after the delay the user chose
    if (this.autoAdjust && !this._autoDone && this.sessionSec >= this.autoMin * 60) this.startAuto();
  }

  // workday simulation
  // start the pretend work day from the beginning with all of todays numbers at zero at high speed
  startDay() {
    this.seated = false;
    this.posture = 'good';
    this.clock = DAY_START;
    this.dailySec = 0;
    this.breaks = 0;
    this.longestSec = 0;
    this.postureSecs = zeroPosture();
    // a fresh day starts with an empty history
    this.seatHeat = zeros(N * N);
    this.backHeat = zeros(ROWS * 2);
    this.segments = [];
    this.log = [];
    this.#resetSession();
    this.seatTemp = AMBIENT;
    this.sim = { running: true, idx: 0 };
    this.speed = 600;
  }

  // end the pretend work day and go back to normal speed
  stopDay() {
    this.sim = { running: false, idx: 0 };
    this.speed = 1;
  }

  // carries out one line of the pretend work day sit stand change posture or end the day
  applyEvent(e) {
    if (e.act === 'sit') this.sit();
    else if (e.act === 'stand') this.stand();
    else if (e.act === 'end') this.stopDay();
    else this.setPosture(e.act);
  }
}

export const chair = new Chair();
