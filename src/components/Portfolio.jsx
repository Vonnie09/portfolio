import { useEffect, useRef, useState } from 'react'
import { achievements, certificateGroups, projects, skillGroups, techStack } from '../data'
import { ArrowUpRight, Badge, Code, GitHub, Layers, Trophy } from './Icons'
import Certificates from './Certificates'

const certCount = certificateGroups.reduce((n, g) => n + g.items.length, 0)

const tabs = [
  { id: 'projects', label: 'Projects', icon: Code, show: projects.length },
  { id: 'certificates', label: 'Certificates', icon: Badge, show: certCount },
  { id: 'achievements', label: 'Achievements', icon: Trophy, show: achievements.length },
  { id: 'stack', label: 'Tech Stack', icon: Layers, show: techStack.length || skillGroups.length },
].filter((t) => t.show)

const hues = [222, 262, 198, 286, 168]
// Logos that are black and need to be flipped to show on a dark background
const darkLogos = ['github', 'vercel', 'nextjs', 'prisma']

function ProjectCard({ p, i }) {
  return (
    <article className="card project" style={{ '--i': i }}>
      <div className="project-img" style={{ '--h': hues[i % hues.length] }}>
        {p.status && (
          <span className="status-pill">
            <i aria-hidden="true" /> {p.status}
          </span>
        )}
        {p.image ? <img src={p.image} alt={`${p.title} screenshot`} loading="lazy" /> : <span>{p.title}</span>}
      </div>
      <div className="card-body">
        {p.label && <p className="project-label">{p.label}</p>}
        <h3>{p.title}</h3>
        <p>{p.description}</p>
        {p.tags?.length > 0 && (
          <ul className="tags">
            {p.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        <div className="card-links">
          {!p.live && p.status && (
            <span className="btn btn-small status-btn" aria-label={`Status: ${p.status}`}>
              <i aria-hidden="true" /> {p.status}
            </span>
          )}
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer" className="btn btn-small btn-primary">
              Live demo <ArrowUpRight width={14} height={14} />
            </a>
          )}
          {p.code && (
            <a href={p.code} target="_blank" rel="noreferrer" className="btn btn-small btn-ghost">
              <GitHub width={14} height={14} /> Code
            </a>
          )}
          {!p.live && !p.code && !p.status && <span className="soon">Links coming soon</span>}
        </div>
      </div>
    </article>
  )
}

export default function Portfolio() {
  const [tab, setTab] = useState(tabs[0]?.id)
  // cards only start their entrance once the section is on screen (then replay on every tab switch)
  const [seen, setSeen] = useState(false)
  const tabsRef = useRef()
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setSeen(true)
        io.disconnect()
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(tabsRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <section id="portfolio" className="section">
      <h2 className="section-title" data-reveal>
        Portfolio
      </h2>
      <div className="tabs" role="tablist" data-reveal ref={tabsRef}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
          >
            <Icon width={16} height={16} /> {label}
          </button>
        ))}
      </div>

      <div className={`tab-panel ${seen ? 'play' : ''}`} key={tab}>
        {tab === 'projects' && (
          <div className={projects.length < 3 ? 'grid-2' : 'grid-3'}>
            {projects.map((p, i) => (
              <ProjectCard key={p.title} p={p} i={i} />
            ))}
          </div>
        )}

        {tab === 'certificates' && <Certificates />}

        {tab === 'achievements' && (
          <div className="grid-3">
            {achievements.map((a, i) => (
              <article className="card list-card" key={a.title} style={{ '--i': i }}>
                <div className="lc-icon">
                  <Trophy />
                </div>
                <h3>{a.title}</h3>
                <p>{a.detail}</p>
                <div className="lc-foot">
                  <span className="years">{a.year}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === 'stack' && (
          <>
            <div className="stack-grid">
              {techStack.map((t, i) => (
                <div className="card stack-item" key={t.name} style={{ '--i': i }}>
                  {t.icon && (
                    <img
                      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${t.icon}/${t.icon}-original.svg`}
                      alt=""
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      className={darkLogos.includes(t.icon) || t.icon === 'threejs' ? 'invert' : ''}
                    />
                  )}
                  <span>{t.name}</span>
                </div>
              ))}
            </div>
            {skillGroups.length > 0 && (
              <div className="skill-groups">
                {skillGroups.map((g, i) => (
                  <div className="card skill-group" key={g.group} style={{ '--i': techStack.length + i }}>
                    <h4>{g.group}</h4>
                    <ul className="tags">
                      {g.items.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
