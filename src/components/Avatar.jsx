import { useEffect, useRef, useState } from 'react'

// A cartoon of Von drawn in SVG (short black hair, clear square glasses, black tee).
// - follows the mouse with its eyes and head
// - blinks now and then
// - winks/squints when clicked
// - closes its eyes when the mouse has been still for a while
// On phones (no mouse) it looks around by itself, and a tap makes it wink.

const SLEEP_AFTER = 3500 // ms without mouse movement

export default function Avatar() {
  const wrap = useRef()
  const parts = useRef({})
  const [mode, setMode] = useState('awake') // awake | blink | wink | sleep
  const modeRef = useRef(mode)
  modeRef.current = mode
  const kickRef = useRef(() => {})

  // falling asleep / waking up moves the head, so let the animation run again
  useEffect(() => kickRef.current(), [mode])

  useEffect(() => {
    const el = wrap.current
    const p = parts.current
    const mouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    let target = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    let raf = 0
    let visible = false
    let sleepT
    const timers = []

    const set = (node, t) => node && node.setAttribute('transform', t)

    const frame = () => {
      raf = 0
      if (!visible) return
      // asleep: head drops a little and looks down
      const tx = modeRef.current === 'sleep' ? 0 : target.x
      const ty = modeRef.current === 'sleep' ? 0.35 : target.y
      cur.x += (tx - cur.x) * 0.1
      cur.y += (ty - cur.y) * 0.1
      const { x, y } = cur
      set(p.head, `rotate(${x * 5} 200 330)`)
      set(p.face, `translate(${x * 4} ${y * 3})`)
      set(p.features, `translate(${x * 13} ${y * 9})`)
      set(p.hair, `translate(${x * 7} ${y * 2})`)
      set(p.earL, `translate(${x * -3} 0)`)
      set(p.earR, `translate(${x * -3} 0)`)
      set(p.pupilL, `translate(${x * 6} ${y * 4})`)
      set(p.pupilR, `translate(${x * 6} ${y * 4})`)
      // keep going until it has caught up with the mouse
      if (Math.abs(tx - cur.x) > 0.002 || Math.abs(ty - cur.y) > 0.002) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame)
    }
    kickRef.current = kick
    const restartSleep = () => {
      clearTimeout(sleepT)
      sleepT = setTimeout(function nap() {
        // in the middle of a blink or a wink? try again in a moment
        if (modeRef.current === 'awake') setMode('sleep')
        else if (modeRef.current !== 'sleep') sleepT = setTimeout(nap, 600)
      }, SLEEP_AFTER)
    }

    // where is the mouse compared to the face?
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height * 0.42
      const clamp = (v) => Math.max(-1, Math.min(1, v))
      target = { x: clamp((e.clientX - cx) / (window.innerWidth * 0.35)), y: clamp((e.clientY - cy) / (window.innerHeight * 0.4)) }
      restartSleep()
      if (modeRef.current === 'sleep') setMode('awake')
      kick()
    }

    // random blinks
    const blink = () => {
      timers.push(
        setTimeout(() => {
          if (modeRef.current === 'awake') {
            setMode('blink')
            timers.push(setTimeout(() => modeRef.current === 'blink' && setMode('awake'), 150))
          }
          blink()
        }, 2400 + Math.random() * 3200)
      )
    }
    blink()

    // phones: look around on its own
    let wander
    if (!mouse) {
      wander = setInterval(() => {
        target = { x: Math.random() * 1.6 - 0.8, y: Math.random() * 1.0 - 0.5 }
        kick()
      }, 1800)
    } else {
      window.addEventListener('pointermove', onMove, { passive: true })
      restartSleep()
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      kick()
    })
    io.observe(el)

    return () => {
      window.removeEventListener('pointermove', onMove)
      clearInterval(wander)
      clearTimeout(sleepT)
      timers.forEach(clearTimeout)
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  const poke = () => {
    setMode('wink')
    clearTimeout(poke.t)
    poke.t = setTimeout(() => setMode('awake'), 750)
  }

  const r = (k) => (n) => (parts.current[k] = n)

  return (
    <div className={`avatar av-${mode}`} ref={wrap}>
      <svg
        viewBox="0 0 400 460"
        role="img"
        aria-label="Cartoon of Von that follows your mouse"
        onPointerDown={poke}
      >
        <defs>
          <radialGradient id="av-skin" cx="45%" cy="38%" r="70%">
            <stop offset="0" stopColor="#e2a985" />
            <stop offset="0.6" stopColor="#c98d68" />
            <stop offset="1" stopColor="#a96f4e" />
          </radialGradient>
          <linearGradient id="av-neck" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9a6142" />
            <stop offset="0.45" stopColor="#bf8360" />
          </linearGradient>
          <linearGradient id="av-shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#24252c" />
            <stop offset="1" stopColor="#101116" />
          </linearGradient>
          <linearGradient id="av-hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b2523" />
            <stop offset="1" stopColor="#120e0d" />
          </linearGradient>
          <clipPath id="av-eyeL">
            <path d="M141 206 C149 192 177 192 185 206 C177 217 149 217 141 206 Z" />
          </clipPath>
          <clipPath id="av-eyeR">
            <path d="M215 206 C223 192 251 192 259 206 C251 217 223 217 215 206 Z" />
          </clipPath>
        </defs>

        {/* body */}
        <path d="M168 300 L232 300 L236 372 L164 372 Z" fill="url(#av-neck)" />
        <path
          d="M34 460 C40 398 88 370 152 360 C170 382 230 382 248 360 C312 370 360 398 366 460 Z"
          fill="url(#av-shirt)"
        />
        <path d="M152 360 C170 386 230 386 248 360" fill="none" stroke="#2f3039" strokeWidth="7" strokeLinecap="round" />

        <g ref={r('head')}>
          {/* ears */}
          <g ref={r('earL')}>
            <ellipse cx="110" cy="218" rx="15" ry="25" fill="#c08260" />
            <path d="M112 206 C104 212 104 226 112 232" fill="none" stroke="#9a6142" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g ref={r('earR')}>
            <ellipse cx="290" cy="218" rx="15" ry="25" fill="#c08260" />
            <path d="M288 206 C296 212 296 226 288 232" fill="none" stroke="#9a6142" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* face */}
          <g ref={r('face')}>
            <path
              d="M200 334 C158 334 128 308 117 270 C109 242 107 206 109 176 C112 122 150 90 200 90 C250 90 288 122 291 176 C293 206 291 242 283 270 C272 308 242 334 200 334 Z"
              fill="url(#av-skin)"
            />
            {/* soft shadow under the hairline */}
            <ellipse cx="200" cy="150" rx="82" ry="22" fill="#7a4a33" opacity="0.18" />
            {/* jaw shading */}
            <path d="M130 282 C150 320 250 320 270 282 C255 312 145 312 130 282 Z" fill="#8f5a3e" opacity="0.18" />
          </g>

          {/* hair: short sides, textured top swept up and back */}
          <g ref={r('hair')}>
            <path
              d="M106 200 C96 146 108 98 146 72 C172 54 214 48 248 58 C290 72 308 112 300 172 C298 186 296 196 292 204 C290 170 282 146 266 132 C244 118 222 124 200 118 C176 114 150 122 134 140 C120 156 114 178 112 202 Z"
              fill="url(#av-hair)"
            />
            {/* front volume */}
            <path
              d="M134 140 C140 108 170 90 204 90 C240 90 266 104 270 132 C252 116 230 118 206 112 C182 108 156 116 134 140 Z"
              fill="#1b1615"
            />
            <g fill="none" strokeLinecap="round">
              <path d="M150 112 C168 92 196 82 226 84" stroke="#4a3f3b" strokeWidth="3" opacity="0.7" />
              <path d="M164 122 C182 102 210 94 240 98" stroke="#4a3f3b" strokeWidth="2.5" opacity="0.55" />
              <path d="M140 92 C160 74 190 66 222 68" stroke="#3a312e" strokeWidth="3" opacity="0.6" />
              <path d="M232 70 C258 76 280 94 288 122" stroke="#3a312e" strokeWidth="3" opacity="0.5" />
              <path d="M118 150 C116 130 124 110 138 98" stroke="#3a312e" strokeWidth="3" opacity="0.5" />
            </g>
          </g>

          {/* eyes, brows, glasses, nose, mouth */}
          <g ref={r('features')}>
            <g className="av-brows" fill="none" stroke="#1d1513" strokeWidth="7" strokeLinecap="round">
              <path className="av-browL" d="M140 177 C154 169 172 169 186 173" />
              <path className="av-browR" d="M214 173 C228 169 246 169 260 177" />
            </g>

            {/* left eye */}
            <g className="av-eye av-eyeL">
              <g clipPath="url(#av-eyeL)">
                <rect x="138" y="190" width="50" height="30" fill="#fbf7f2" />
                <g ref={r('pupilL')}>
                  <circle cx="163" cy="205" r="9.5" fill="#3d2618" />
                  <circle cx="163" cy="205" r="4.8" fill="#0c0705" />
                  <circle cx="159.5" cy="201.5" r="2.6" fill="#fff" />
                </g>
              </g>
              <path d="M141 206 C149 192 177 192 185 206" fill="none" stroke="#1d1513" strokeWidth="3.2" strokeLinecap="round" />
            </g>
            <path className="av-lash av-lashL" d="M142 207 C152 215 174 215 184 207" fill="none" stroke="#1d1513" strokeWidth="3.4" strokeLinecap="round" />
            <path className="av-squint av-squintL" d="M144 210 L162 200 L182 210" fill="none" stroke="#1d1513" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />

            {/* right eye */}
            <g className="av-eye av-eyeR">
              <g clipPath="url(#av-eyeR)">
                <rect x="212" y="190" width="50" height="30" fill="#fbf7f2" />
                <g ref={r('pupilR')}>
                  <circle cx="237" cy="205" r="9.5" fill="#3d2618" />
                  <circle cx="237" cy="205" r="4.8" fill="#0c0705" />
                  <circle cx="233.5" cy="201.5" r="2.6" fill="#fff" />
                </g>
              </g>
              <path d="M215 206 C223 192 251 192 259 206" fill="none" stroke="#1d1513" strokeWidth="3.2" strokeLinecap="round" />
            </g>
            <path className="av-lash av-lashR" d="M216 207 C226 215 248 215 258 207" fill="none" stroke="#1d1513" strokeWidth="3.4" strokeLinecap="round" />

            {/* clear square glasses */}
            <g className="av-glasses">
              <rect x="127" y="181" width="70" height="54" rx="13" fill="rgba(220,235,255,0.07)" stroke="rgba(236,240,248,0.62)" strokeWidth="3.4" />
              <rect x="203" y="181" width="70" height="54" rx="13" fill="rgba(220,235,255,0.07)" stroke="rgba(236,240,248,0.62)" strokeWidth="3.4" />
              <path d="M197 197 C199 192 201 192 203 197" fill="none" stroke="rgba(236,240,248,0.62)" strokeWidth="3.4" />
              <path d="M127 193 L110 198 M273 193 L290 198" stroke="rgba(236,240,248,0.5)" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M140 226 L160 190 M150 228 L166 200" stroke="#fff" strokeWidth="3" opacity="0.18" strokeLinecap="round" />
              <path d="M216 226 L236 190 M226 228 L242 200" stroke="#fff" strokeWidth="3" opacity="0.18" strokeLinecap="round" />
            </g>

            {/* nose */}
            <path d="M200 216 C198 234 192 246 194 253 C198 259 207 259 210 253" fill="none" stroke="#91573a" strokeWidth="3.2" strokeLinecap="round" />
            <ellipse cx="203" cy="250" rx="11" ry="6" fill="#d89a76" opacity="0.5" />

            {/* cheeks */}
            <ellipse cx="140" cy="256" rx="17" ry="10" fill="#e07f68" opacity="0.22" />
            <ellipse cx="260" cy="256" rx="17" ry="10" fill="#e07f68" opacity="0.22" />

            {/* mouths: normal smile / squint grimace */}
            <g className="av-mouth">
              <path d="M174 281 C188 299 214 299 228 281 C214 290 188 290 174 281 Z" fill="#b5604f" />
              <path d="M174 281 C188 290 214 290 228 281" fill="none" stroke="#6e3027" strokeWidth="3.4" strokeLinecap="round" />
            </g>
            <g className="av-grimace">
              <path d="M172 284 C186 276 216 276 230 284 C218 298 184 298 172 284 Z" fill="#fff" stroke="#6e3027" strokeWidth="3.4" strokeLinejoin="round" />
              <path d="M188 280 L188 294 M201 279 L201 295 M214 280 L214 294" stroke="#d9cfc8" strokeWidth="2" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}
