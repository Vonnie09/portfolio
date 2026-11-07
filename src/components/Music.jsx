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

export default function Music() {
  if (!music.link) return null
  const embed = toEmbed(music.link)

  return (
    <section className="section">
      <div className={`music ${embed ? '' : 'music-solo'}`} data-reveal>
        <div className="music-copy">
          <h3>
            {music.title}
            <br />
            <span className="grad">{music.accent}</span>
          </h3>
          <p className="muted">{music.text}</p>
          <a className="btn btn-ghost spotify-btn" href={music.link} target="_blank" rel="noreferrer">
            <MusicIcon width={15} height={15} /> {embed ? 'Open in Spotify' : 'Listen with me on Spotify'}{' '}
            <ArrowUpRight width={14} height={14} />
          </a>
        </div>
        {embed ? (
          <iframe
            title="Spotify player"
            src={embed}
            width="100%"
            height="352"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        ) : (
          <a className="now-playing" href={music.link} target="_blank" rel="noreferrer">
            <div className="np-art">
              <MusicIcon width={34} height={34} />
            </div>
            <div className="np-text">
              <small>On repeat</small>
              <strong>{profile.name.split(' ')[0]}'s Spotify</strong>
              <span>Playlists · Liked songs</span>
            </div>
            <Bars />
          </a>
        )}
      </div>
    </section>
  )
}
