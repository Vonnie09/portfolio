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

// Chords (as MIDI note numbers): Cmaj9 → Am9 → Fmaj7#11 → Gsus2
const CHORDS = [
  [48, 55, 59, 62, 64],
  [45, 52, 55, 59, 60],
  [41, 48, 52, 55, 59],
  [43, 50, 55, 57, 62],
]
const SPARKLE = [72, 74, 76, 79, 81, 84, 86, 88] // C major pentatonic, high
const CHORD_SECONDS = 9

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12)

function makeReverb(ac, seconds = 4.5) {
  const len = ac.sampleRate * seconds
  const buf = ac.createBuffer(2, len, ac.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
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
  wet.gain.value = 0.55
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
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(500, start)
  filter.frequency.linearRampToValueAtTime(1300, start + dur * 0.5)
  filter.frequency.linearRampToValueAtTime(600, start + dur)
  filter.Q.value = 0.7
  const env = ctx.createGain()
  env.gain.setValueAtTime(0, start)
  env.gain.linearRampToValueAtTime(0.11, start + 2.8)
  env.gain.setValueAtTime(0.11, start + dur - 2.5)
  env.gain.linearRampToValueAtTime(0, start + dur + 1.5)
  filter.connect(env).connect(ctx._bus)

  notes.forEach((n, i) => {
    ;[-6, 6].forEach((cents) => {
      const o = ctx.createOscillator()
      o.type = i === 0 ? 'triangle' : 'sawtooth'
      o.frequency.value = hz(n)
      o.detune.value = cents
      const g = ctx.createGain()
      g.gain.value = i === 0 ? 0.5 : 0.16
      o.connect(g).connect(filter)
      o.start(start)
      o.stop(start + dur + 2)
    })
  })

  // soft sub bass on the root
  const b = ctx.createOscillator()
  b.type = 'sine'
  b.frequency.value = hz(notes[0] - 12)
  const bg = ctx.createGain()
  bg.gain.setValueAtTime(0, start)
  bg.gain.linearRampToValueAtTime(0.12, start + 2)
  bg.gain.linearRampToValueAtTime(0, start + dur + 1)
  b.connect(bg).connect(master)
  b.start(start)
  b.stop(start + dur + 2)
}

function sparkle(start) {
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.value = hz(SPARKLE[Math.floor(Math.random() * SPARKLE.length)])
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, start)
  g.gain.linearRampToValueAtTime(0.045, start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, start + 2.2)
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
  if (pan) {
    pan.pan.value = Math.random() * 1.4 - 0.7
    o.connect(g).connect(pan).connect(ctx._bus)
  } else {
    o.connect(g).connect(ctx._bus)
  }
  o.start(start)
  o.stop(start + 2.4)
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
    timers.push(setTimeout(playSparkle, 900 + Math.random() * 2600))
  }
  playChord()
  timers.push(setTimeout(playSparkle, 1500))
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
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2.5)
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

// Short "whoosh" for flipping the badge — only when sound is on
export function playFlip() {
  if (!on || !ctx) return
  const t = ctx.currentTime
  const len = 0.35
  const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = 1.2
  f.frequency.setValueAtTime(600, t)
  f.frequency.exponentialRampToValueAtTime(2600, t + len)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.25, t + 0.06)
  g.gain.exponentialRampToValueAtTime(0.001, t + len)
  src.connect(f).connect(g).connect(master)
  src.start(t)
}
