import { socials } from '../data'
import { socialIcon, ArrowUpRight } from './Icons'

const active = socials.filter((s) => s.url)

export function SocialIcons() {
  return (
    <div className="social-icons">
      {active.map((s) => {
        const Icon = socialIcon[s.name] || ArrowUpRight
        return (
          <a key={s.name} href={s.url} target="_blank" rel="noreferrer" aria-label={s.name} title={s.name}>
            <Icon />
          </a>
        )
      })}
    </div>
  )
}

export function SocialCards() {
  return (
    <div className="social-cards">
      {active.map((s) => {
        const Icon = socialIcon[s.name] || ArrowUpRight
        return (
          <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className={`social-card sc-${s.name.toLowerCase()}`}>
            <span className="sc-icon">
              <Icon width={20} height={20} />
            </span>
            <span className="sc-text">
              <strong>{s.name}</strong>
              <small>{s.handle}</small>
            </span>
            <ArrowUpRight className="sc-arrow" width={16} height={16} />
          </a>
        )
      })}
    </div>
  )
}
