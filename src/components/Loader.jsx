import { useEffect, useState } from 'react'

// Percent counter shown while fonts and the page finish loading.
export default function Loader({ onDone }) {
  const [pct, setPct] = useState(0)
  const [hide, setHide] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let raf
    let ready = false
    const start = performance.now()
    const minTime = 900

    const pageReady = new Promise((res) => {
      if (document.readyState === 'complete') res()
      else window.addEventListener('load', res, { once: true })
    })
    Promise.all([pageReady, document.fonts?.ready]).then(() => (ready = true))

    let value = 0
    const tick = (t) => {
      const elapsed = t - start
      // climb to 90% on time alone, finish once everything is ready
      const target = ready && elapsed > minTime ? 100 : Math.min(90, (elapsed / minTime) * 90)
      value += (target - value) * 0.12
      if (target === 100 && value > 99.4) value = 100
      setPct(value)
      if (value < 100) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    // Safety net: never keep visitors waiting more than 4 seconds
    const failsafe = setTimeout(() => {
      cancelAnimationFrame(raf)
      setPct(100)
    }, 4000)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(failsafe)
    }
  }, [])

  useEffect(() => {
    if (pct < 100 || hide) return
    setHide(true)
    onDone?.()
    const t = setTimeout(() => setGone(true), 700)
    return () => clearTimeout(t)
  }, [pct, hide, onDone])

  if (gone) return null
  return (
    <div className={`loader ${hide ? 'loader-out' : ''}`} role="status" aria-live="polite">
      <div className="loader-num">
        {Math.round(pct)}
        <span>%</span>
      </div>
      <div className="loader-bar">
        <i style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <p>Loading assets…</p>
    </div>
  )
}
