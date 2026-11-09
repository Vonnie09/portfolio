import { useEffect, useState } from 'react'
import Starfield from './components/Starfield'
import Loader from './components/Loader'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Music from './components/Music'
import Portfolio from './components/Portfolio'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  // Fade sections in as they scroll into view
  useEffect(() => {
    if (!loaded) return
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [loaded])

  // Glow that follows the mouse around the border of boxes (desktop only).
  // One listener for the whole page: it tells the box under the cursor where the mouse is.
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let raf = 0
    let last = null
    const update = () => {
      raf = 0
      const el = last.target.closest?.('.card, .stat, .info-card')
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${last.clientX - r.left}px`)
      el.style.setProperty('--my', `${last.clientY - r.top}px`)
    }
    const onMove = (e) => {
      last = e
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <Starfield />
      <Loader onDone={() => setLoaded(true)} />
      <Nav />
      <main>
        <Hero ready={loaded} />
        <About />
        <Music />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
