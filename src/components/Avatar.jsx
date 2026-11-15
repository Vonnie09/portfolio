import { useEffect, useRef, useState } from 'react'

// 3D cartoon of Von made from 11 pictures (public/avatar/).
// - looks toward the mouse (8 directions + straight ahead)
// - blinks now and then
// - squints/winks when clicked
// - closes his eyes when the mouse has been still for a while
// On phones (no mouse) he looks around by himself, and a tap makes him wink.

const FRAMES = [
  'center',
  'left',
  'right',
  'up',
  'down',
  'up-left',
  'up-right',
  'down-left',
  'down-right',
  'wink',
  'sleep',
]
// screen direction (angle, clockwise from "right") → picture
const SECTORS = ['right', 'down-right', 'down', 'down-left', 'left', 'up-left', 'up', 'up-right']
const SLEEP_AFTER = 3500 // ms without mouse movement

const src = (name) => `/avatar/${name}.jpg`

export default function Avatar() {
  const wrap = useRef()
  const [look, setLook] = useState('center') // where the eyes point
  const [mood, setMood] = useState('awake') // awake | blink | wink | sleep
  const moodRef = useRef(mood)
  moodRef.current = mood

  useEffect(() => {
    const el = wrap.current
    const mouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const timers = []
    let sleepT
    let raf = 0
    // a tiny head sway toward the mouse, eased, for a bit of life between pictures
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 }

    // preload every picture so switching never flashes
    FRAMES.forEach((f) => {
      const i = new Image()
      i.src = src(f)
    })

    const sway = () => {
      raf = 0
      tilt.x += (tilt.tx - tilt.x) * 0.12
      tilt.y += (tilt.ty - tilt.y) * 0.12
      el.style.setProperty('--tx', `${tilt.x * 6}px`)
      el.style.setProperty('--ty', `${tilt.y * 4}px`)
      el.style.setProperty('--rot', `${tilt.x * 1.6}deg`)
      if (Math.abs(tilt.tx - tilt.x) > 0.002 || Math.abs(tilt.ty - tilt.y) > 0.002) raf = requestAnimationFrame(sway)
    }
    const aim = (dx, dy) => {
      // dx, dy roughly -1..1 from the face
      tilt.tx = Math.max(-1, Math.min(1, dx))
      tilt.ty = Math.max(-1, Math.min(1, dy))
      if (!raf) raf = requestAnimationFrame(sway)
      if (Math.hypot(dx, dy) < 0.22) return setLook('center')
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI // -180..180, 0 = right, 90 = down
      setLook(SECTORS[Math.round(((angle + 360) % 360) / 45) % 8])
    }

    const restartSleep = () => {
      clearTimeout(sleepT)
      sleepT = setTimeout(function nap() {
        // in the middle of a blink or a wink? try again in a moment
        if (moodRef.current === 'awake') setMood('sleep')
        else if (moodRef.current !== 'sleep') sleepT = setTimeout(nap, 600)
      }, SLEEP_AFTER)
    }

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height * 0.4 // eye level
      aim((e.clientX - cx) / (window.innerWidth * 0.3), (e.clientY - cy) / (window.innerHeight * 0.35))
      if (moodRef.current === 'sleep') setMood('awake')
      restartSleep()
    }

    // blink every few seconds (uses the eyes-closed picture for a split second)
    const blink = () => {
      timers.push(
        setTimeout(() => {
          if (moodRef.current === 'awake') {
            setMood('blink')
            timers.push(setTimeout(() => moodRef.current === 'blink' && setMood('awake'), 140))
          }
          blink()
        }, 2600 + Math.random() * 3400)
      )
    }
    blink()

    let wander
    if (mouse) {
      window.addEventListener('pointermove', onMove, { passive: true })
      restartSleep()
    } else {
      // phones: glance around now and then
      wander = setInterval(() => {
        const a = Math.random() * Math.PI * 2
        const d = Math.random() < 0.3 ? 0 : 0.6
        aim(Math.cos(a) * d, Math.sin(a) * d)
      }, 1700)
    }

    return () => {
      window.removeEventListener('pointermove', onMove)
      clearInterval(wander)
      clearTimeout(sleepT)
      timers.forEach(clearTimeout)
      cancelAnimationFrame(raf)
    }
  }, [])

  const poke = () => {
    setMood('wink')
    clearTimeout(poke.t)
    poke.t = setTimeout(() => setMood('awake'), 800)
  }

  const shown = mood === 'wink' ? 'wink' : mood === 'sleep' || mood === 'blink' ? 'sleep' : look

  return (
    <div
      className={`avatar av-${mood}`}
      ref={wrap}
      onPointerDown={poke}
      role="img"
      aria-label="3D cartoon of Von that follows your mouse"
    >
      <div className="av-head">
        {FRAMES.map((f) => (
          <img
            key={f}
            src={src(f)}
            alt=""
            width="720"
            height="720"
            draggable="false"
            className={f === shown ? 'on' : ''}
            decoding="async"
          />
        ))}
      </div>
    </div>
  )
}
