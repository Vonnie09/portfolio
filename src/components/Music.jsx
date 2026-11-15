import { music, profile } from '../data'
import { ArrowUpRight, Music as MusicIcon } from './Icons'

// Spotify can only embed playlists, albums, tracks and artists — not user profiles
function toEmbed(url) {
  const m = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|artist)\/([A-Za-z0-9]+)/)
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : null
}

function Bars() {
  return (
    <div className="eq" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <i key={i} style={{ animationDelay: `${i * -0.18}s` }} />
      ))}
    </div>
  )
}

function NowPlaying(props) {
  return (
    <a className="tile now-playing" href={music.link} target="_blank" rel="noreferrer" {...props}>
      <div className="np-top">
        <div className="np-art">
          <MusicIcon width={30} height={30} />
        </div>
        <Bars />
      </div>
      <div className="np-text">
        <small>On repeat</small>
        <strong>{profile.name.split(' ')[0]}'s Spotify</strong>
        <span>
          Playlists · Liked songs <ArrowUpRight width={14} height={14} />
        </span>
      </div>
    </a>
  )
}

export default function Music() {
  if (!music.link) return null
  const embed = toEmbed(music.link)

  return (
    <section className="section section-tight">
      <div className="bento music">
        <div className="tile music-copy" data-reveal>
          <h3>
            {music.title}
            <br />
            <span className="grad">{music.accent}</span>
          </h3>
          <p className="muted">{music.text}</p>
          {embed && (
            <a className="btn btn-ghost spotify-btn" href={music.link} target="_blank" rel="noreferrer">
              <MusicIcon width={15} height={15} /> Open in Spotify <ArrowUpRight width={14} height={14} />
            </a>
          )}
        </div>

        {embed ? (
          <div className="tile music-embed" data-reveal style={{ '--d': 1 }}>
            <iframe
              title="Spotify player"
              src={embed}
              width="100%"
              height="352"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          </div>
        ) : (
          <NowPlaying data-reveal style={{ '--d': 1 }} />
        )}

        {/* optional picture (set music.photo in data.js) */}
        {music.photo && (
          <div className="tile music-photo" data-reveal style={{ '--d': 2 }}>
            <img src={music.photo} alt={profile.name} loading="lazy" />
          </div>
        )}
      </div>
    </section>
  )
}
