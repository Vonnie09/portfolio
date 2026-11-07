import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { profile } from '../data'
import { ArrowRight, Send } from './Icons'
import { SocialIcons } from './Social'

// The 3D badge is loaded separately so the text shows up right away
const Lanyard = lazy(() => import('./Lanyard'))

function useTyping(words, { type = 70, erase = 35, hold = 1600 } = {}) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (!words.length) return
    let i = 0
    let len = 0
    let deleting = false
    let timer
    const step = () => {
      const word = words[i % words.length]
      if (!deleting) {
        len++
        setText(word.slice(0, len))
        if (len === word.length) {
          deleting = true
          timer = setTimeout(step, hold)
          return
        }
        timer = setTimeout(step, type)
      } else {
        len--
        setText(word.slice(0, len))
        if (len === 0) {
          deleting = false
          i++
        }
        timer = setTimeout(step, erase)
      }
    }
    timer = setTimeout(step, 400)
    return () => clearTimeout(timer)
  }, [words, type, erase, hold])
  return text
}

// true on screens wider than the phone/tablet breakpoint
function useWide() {
  const query = '(min-width: 901px)'
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}

export default function Hero({ ready }) {
  const role = useTyping(profile.roles)
  const heroRef = useRef()
  const badgeRef = useRef()
  const wide = useWide()
  const [flipped, setFlipped] = useState(false)
  const toggle = () => setFlipped((f) => !f)
  const lanyardProps = { flipped, onToggle: toggle, anchorRef: badgeRef, eventSourceRef: heroRef }

  return (
    <section id="home" ref={heroRef} className={`hero ${ready ? 'hero-in' : ''}`}>
      {/* On desktop the badge can be dragged across the whole hero */}
      {ready && wide && (
        <Suspense fallback={null}>
          <Lanyard wide {...lanyardProps} />
        </Suspense>
      )}
      <div className="hero-copy">
        <h1>
          <span className="grad">Welcome to</span>
          <br />
          My Portfolio
        </h1>
        <p className="role" aria-label={profile.roles.join(', ')}>
          <span aria-hidden="true">{role}</span>
          <i className="caret" aria-hidden="true" />
        </p>
        <p className="lead">{profile.heroText}</p>
        <div className="actions">
          <a href="#portfolio" className="btn btn-primary">
            View Projects <ArrowRight width={16} height={16} />
          </a>
          <a href="#contact" className="btn btn-ghost">
            Contact Me <Send width={15} height={15} />
          </a>
        </div>
        <div className="find-me">
          <span>Find me</span>
          <SocialIcons />
        </div>
      </div>
      <div className="hero-badge" ref={badgeRef}>
        {ready && !wide && (
          <Suspense fallback={null}>
            <Lanyard {...lanyardProps} />
          </Suspense>
        )}
        <p className="badge-hint">Drag it anywhere · Tap it to flip ✦</p>
        <button type="button" className="flip-btn" onClick={toggle} aria-pressed={flipped}>
          ↻ {flipped ? 'Show front' : 'Flip badge'}
        </button>
      </div>
    </section>
  )
}
