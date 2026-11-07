import { useEffect, useState } from 'react'
import { isSoundOn, onSoundChange, setSound, wantsSound } from '../sound'
import { VolumeOff, VolumeOn } from './Icons'

const links = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'contact', label: 'Contact' },
]

export default function Nav() {
  const [active, setActive] = useState('home')
  const [sound, setSoundState] = useState(isSoundOn())

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    links.forEach((l) => {
      const el = document.getElementById(l.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  // Keep the button in sync with the sound engine
  useEffect(() => onSoundChange(setSoundState), [])

  // If the visitor had sound on last time, resume it on their first click (browsers need a click)
  useEffect(() => {
    if (!wantsSound()) return
    const start = (e) => {
      if (e.target.closest?.('.sound-btn')) return // the button handles itself
      setSound(true)
    }
    window.addEventListener('pointerdown', start, { once: true })
    return () => window.removeEventListener('pointerdown', start)
  }, [])

  return (
    <nav className="nav" aria-label="Main">
      {links.map((l) => (
        <a key={l.id} href={`#${l.id}`} className={active === l.id ? 'active' : ''}>
          {l.label}
        </a>
      ))}
      <span className="nav-divider" aria-hidden="true" />
      <button
        type="button"
        className={`sound-btn ${sound ? 'on' : ''}`}
        onClick={() => setSound(!sound)}
        aria-pressed={sound}
        aria-label={sound ? 'Turn background sound off' : 'Turn background sound on'}
        title={sound ? 'Sound on' : 'Sound off'}
      >
        {sound ? <VolumeOn width={16} height={16} /> : <VolumeOff width={16} height={16} />}
        {sound && <span className="sound-wave" aria-hidden="true" />}
      </button>
    </nav>
  )
}
