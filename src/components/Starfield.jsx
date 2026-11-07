import { useEffect, useRef } from 'react'

// Twinkling stars + the occasional shooting star, drawn on one fixed canvas.
export default function Starfield() {
  const ref = useRef()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w, h, stars, raf
    let shooting = null
    let nextShot = performance.now() + 2500

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round((w * h) / 5200)
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.2,
        a: Math.random() * 0.6 + 0.2,
        s: Math.random() * 0.002 + 0.0006,
        p: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const alpha = reduce ? s.a : s.a * (0.55 + 0.45 * Math.sin(t * s.s + s.p))
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!reduce) {
        if (!shooting && t > nextShot) {
          shooting = { x: Math.random() * w * 0.8 + w * 0.2, y: Math.random() * h * 0.4, life: 0 }
        }
        if (shooting) {
          shooting.life += 1
          const len = 140
          const x = shooting.x - shooting.life * 9
          const y = shooting.y + shooting.life * 4.5
          const g = ctx.createLinearGradient(x, y, x + len, y - len / 2)
          g.addColorStop(0, 'rgba(180,200,255,0.9)')
          g.addColorStop(1, 'rgba(180,200,255,0)')
          ctx.globalAlpha = Math.max(0, 1 - shooting.life / 70)
          ctx.strokeStyle = g
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + len, y - len / 2)
          ctx.stroke()
          if (shooting.life > 70) {
            shooting = null
            nextShot = t + 4000 + Math.random() * 5000
          }
        }
      }
      ctx.globalAlpha = 1
      if (!reduce) raf = requestAnimationFrame(draw)
    }

    const onResize = () => {
      resize()
      if (reduce) draw(0)
    }

    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="space" aria-hidden="true">
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="glow glow-3" />
      <canvas ref={ref} />
    </div>
  )
}
