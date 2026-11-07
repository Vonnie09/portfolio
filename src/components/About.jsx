import { useEffect, useRef, useState } from 'react'
import { achievements, certificateGroups, education, experience, profile, projects } from '../data'

const certCount = certificateGroups.reduce((n, g) => n + g.items.length, 0)
import { ArrowRight, Badge, Code, Download, Send, Trophy } from './Icons'

function CountUp({ to }) {
  const ref = useRef()
  const [n, setN] = useState(0)
  useEffect(() => {
    const el = ref.current
    let raf
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const run = (t) => {
        const p = Math.min(1, (t - start) / 1200)
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(run)
      }
      raf = requestAnimationFrame(run)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to])
  return <span ref={ref}>{n}</span>
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

export default function About() {
  const [first, ...rest] = profile.name.split(' ')
  const stats = [
    { icon: Code, value: projects.length, label: 'Projects', sub: 'Things I have built' },
    { icon: Badge, value: certCount, label: 'Certificates', sub: 'Skills validated' },
    { icon: Trophy, value: achievements.length, label: 'Awards', sub: 'Achievements earned' },
  ].filter((s) => s.value > 0)

  return (
    <section id="about" className="section">
      <h2 className="section-title" data-reveal>
        About Me
      </h2>

      <div className="about-grid">
        <div className="about-intro" data-reveal>
          <p className="hi">Hi, I'm</p>
          <h3 className="about-name">
            {first}
            {rest.length > 0 && (
              <>
                <br />
                {rest.join(' ')}
              </>
            )}
          </h3>
          {profile.aboutText.map((t, i) => (
            <p key={i} className="muted">
              {t}
            </p>
          ))}
          <div className="actions">
            <a href="#contact" className="btn btn-primary">
              Contact Me <Send width={15} height={15} />
            </a>
            {profile.resume ? (
              <a href={profile.resume} className="btn btn-ghost" download>
                Resume <Download width={15} height={15} />
              </a>
            ) : (
              <a href="#portfolio" className="btn btn-ghost">
                View Projects <ArrowRight width={15} height={15} />
              </a>
            )}
          </div>
        </div>

        <div className="about-photo" data-reveal>
          <div className="photo-frame">
            {profile.photo ? (
              <img src={profile.photo} alt={profile.name} loading="lazy" />
            ) : (
              <div className="photo-placeholder">
                <span>{profile.initials || initials(profile.name)}</span>
                <small>Add your photo in data.js</small>
              </div>
            )}
          </div>
          <div className="photo-tag">
            <span className="dot" /> {profile.location}
          </div>
        </div>
      </div>

      <div className={`timeline-grid ${education.length && experience.length ? '' : 'single'}`}>
        {education.length > 0 && (
          <div data-reveal>
            <h4 className="sub-title">Education</h4>
            {education.map((e) => (
              <div className="info-card" key={e.school}>
                <div className="info-mark">{initials(e.school)}</div>
                <div>
                  <strong>{e.school}</strong>
                  <p>{e.level}</p>
                  <span className="years">{e.years}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {experience.length > 0 && (
          <div data-reveal>
            <h4 className="sub-title">Experience</h4>
            {experience.map((e) => (
              <div className="info-card" key={e.place + e.role}>
                <div className="info-mark">{initials(e.place)}</div>
                <div>
                  <strong>{e.place}</strong>
                  <p>{e.role}</p>
                  <span className="years">{e.years}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="stats" data-reveal style={{ '--cols': stats.length }}>
        {stats.map(({ icon: Icon, value, label, sub }) => (
          <div className="stat" key={label}>
            <div className="stat-icon">
              <Icon />
            </div>
            <div className="stat-num">
              <CountUp to={value} />
            </div>
            <strong>{label}</strong>
            <small>{sub}</small>
          </div>
        ))}
      </div>
    </section>
  )
}
