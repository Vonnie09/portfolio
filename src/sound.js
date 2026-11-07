// Background "space ambient" music, generated live with the Web Audio API.
// No audio files: a slow chord pad + soft bass + random twinkly notes through a reverb.
// Off by default (browsers only allow sound after a click). The choice is remembered.

const KEY = 'portfolio-sound'
const listeners = new Set()

let ctx = null
let master = null
let wet = null
let timers = []
let on = false

// Warm, low chord voicings (MIDI notes): Cmaj7 → Am7 → Fmaj7 → G6 (sus)
const CHORDS = [
  [48, 55, 59, 64],
  [45, 52, 55, 60],
  [41, 48, 52, 57],
  [43, 50, 55, 59],
]
const SPARKLE = [67, 69, 72, 74, 76, 79, 81] // gentle mid-high pentatonic
const CHORD_SECONDS = 12 // each chord fades into the next

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12)

function makeReverb(ac, seconds = 6) {
  const len = ac.sampleRate * seconds
  const buf = ac.createBuffer(2, len, ac.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2)
  }
  const conv = ac.createConvolver()
  conv.buffer = buf
  return conv
}

function setup() {
  const AC = window.AudioContext || window.webkitAudioContext
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  const reverb = makeReverb(ctx)
  wet = ctx.createGain()
  wet.gain.value = 0.75
  reverb.connect(wet).connect(master)
  // everything goes dry + into the reverb
  ctx._bus = ctx.createGain()
  ctx._bus.connect(master)
  ctx._bus.connect(reverb)

  // Pause the music when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !on) return
    if (document.hidden) ctx.suspend()
    else ctx.resume()
  })
}

function padChord(notes, start, dur) {
  const fadeIn = 4.5
  const fadeOut = 5
  const end = start + dur + fadeOut // overlaps the next chord for a smooth crossfade

  // dark, soft filter that slowly "breathes"
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 0.3
  filter.frequency.setValueAtTime(380, start)
  filter.frequency.linearRampToValueAtTime(850, start + dur * 0.55)
  filter.frequency.linearRampToValueAtTime(420, end)

  const env = ctx.createGain()
  env.gain.setValueAtTime(0, start)
  env.gain.linearRampToValueAtTime(0.055, start + fadeIn)
  env.gain.setValueAtTime(0.055, start + dur)
  env.gain.linearRampToValueAtTime(0, end)
  filter.connect(env).connect(ctx._bus)

  // a very slow wobble so the pad feels alive (gentle chorus)
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.12
  const lfoAmt = ctx.createGain()
  lfoAmt.gain.value = 5 // cents
  lfo.connect(lfoAmt)
  lfo.start(start)
  lfo.stop(end + 0.1)

  notes.forEach((n, i) => {
    ;[-4, 4].forEach((cents, k) => {
      const o = ctx.createOscillator()
      o.type = i === 0 || k === 0 ? 'sine' : 'triangle'
      o.frequency.value = hz(n)
      o.detune.value = cents
      lfoAmt.connect(o.detune)
      const g = ctx.createGain()
      g.gain.value = i === 0 ? 0.45 : 0.22
      o.connect(g).connect(filter)
      o.start(start)
      o.stop(end + 0.1)
    })
  })

  // very soft sub bass on the root
  const b = ctx.createOscillator()
  b.type = 'sine'
  b.frequency.value = hz(notes[0] - 12)
  const bg = ctx.createGain()
  bg.gain.setValueAtTime(0, start)
  bg.gain.linearRampToValueAtTime(0.045, start + fadeIn)
  bg.gain.setValueAtTime(0.045, start + dur)
  bg.gain.linearRampToValueAtTime(0, end)
  b.connect(bg).connect(master)
  b.start(start)
  b.stop(end + 0.1)
}

// soft, slow "glass" notes — fade in gently instead of plucking
function sparkle(start) {
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.value = hz(SPARKLE[Math.floor(Math.random() * SPARKLE.length)])
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, start)
  g.gain.linearRampToValueAtTime(0.022, start + 0.25)
  g.gain.exponentialRampToValueAtTime(0.0001, start + 4)
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
  if (pan) {
    pan.pan.value = Math.random() * 1.2 - 0.6
    o.connect(g).connect(pan).connect(ctx._bus)
  } else {
    o.connect(g).connect(ctx._bus)
  }
  o.start(start)
  o.stop(start + 4.2)
}

function schedule() {
  let i = 0
  const playChord = () => {
    if (!on) return
    padChord(CHORDS[i % CHORDS.length], ctx.currentTime + 0.05, CHORD_SECONDS)
    i++
    timers.push(setTimeout(playChord, CHORD_SECONDS * 1000))
  }
  const playSparkle = () => {
    if (!on) return
    sparkle(ctx.currentTime + 0.05)
    timers.push(setTimeout(playSparkle, 2500 + Math.random() * 4000))
  }
  playChord()
  timers.push(setTimeout(playSparkle, 3000))
}

function emit() {
  listeners.forEach((fn) => fn(on))
}

export function isSoundOn() {
  return on
}

export function onSoundChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function setSound(next) {
  if (next === on) return
  on = next
  try {
    localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    /* storage blocked — fine */
  }
  if (on) {
    if (!ctx) setup()
    await ctx.resume()
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 4)
    schedule()
  } else if (ctx) {
    timers.forEach(clearTimeout)
    timers = []
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8)
    setTimeout(() => !on && ctx.suspend(), 900)
  }
  emit()
}

// Did the visitor turn sound on last time? (We still need a click to start it.)
export function wantsSound() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

// Badge flip: a clear swoosh + a soft two-note chime + a light "card" tap. Only when sound is on.
export function playFlip() {
  if (!on || !ctx) return
  const t = ctx.currentTime
  const out = ctx.createGain()
  out.gain.value = 1
  out.connect(ctx.destination) // straight out, so it's clearly heard over the music
  // send a little of it into the reverb for space
  const send = ctx.createGain()
  send.gain.value = 0.25
  out.connect(send).connect(ctx._bus)

  // 1) swoosh: filtered noise sweeping up
  const len = 0.5
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buf
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 0.9
  bp.frequency.setValueAtTime(350, t)
  bp.frequency.exponentialRampToValueAtTime(3200, t + 0.32)
  bp.frequency.exponentialRampToValueAtTime(1200, t + len)
  const ng = ctx.createGain()
  ng.gain.setValueAtTime(0, t)
  ng.gain.linearRampToValueAtTime(0.55, t + 0.12)
  ng.gain.exponentialRampToValueAtTime(0.001, t + len)
  noise.connect(bp).connect(ng).connect(out)
  noise.start(t)

  // 2) chime: two quick bell-like notes (E6 → B6)
  ;[
    [1318.5, 0.1],
    [1975.5, 0.2],
  ].forEach(([f, at]) => {
    ;[1, 2.01].forEach((mult, k) => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = f * mult
      const g = ctx.createGain()
      const peak = k === 0 ? 0.16 : 0.04
      g.gain.setValueAtTime(0, t + at)
      g.gain.linearRampToValueAtTime(peak, t + at + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.9)
      o.connect(g).connect(out)
      o.start(t + at)
      o.stop(t + at + 1)
    })
  })

  // 3) soft tap, like the card turning on its clip
  const thump = ctx.createOscillator()
  thump.type = 'sine'
  thump.frequency.setValueAtTime(180, t)
  thump.frequency.exponentialRampToValueAtTime(70, t + 0.12)
  const tg = ctx.createGain()
  tg.gain.setValueAtTime(0.3, t)
  tg.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
  thump.connect(tg).connect(out)
  thump.start(t)
  thump.stop(t + 0.2)
}

