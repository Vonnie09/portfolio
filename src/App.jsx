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
