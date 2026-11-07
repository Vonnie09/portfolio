import { Suspense, lazy, useEffect, useState } from 'react'
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

export default function Hero({ ready }) {
  const role = useTyping(profile.roles)

  return (
    <section id="home" className={`hero ${ready ? 'hero-in' : ''}`}>
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
      <div className="hero-badge">
        <Suspense fallback={null}>{ready && <Lanyard />}</Suspense>
        <p className="badge-hint">Drag the badge ✦</p>
      </div>
    </section>
  )
}
