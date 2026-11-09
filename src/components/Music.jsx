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

function NowPlaying() {
  return (
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
  )
}

export default function Music() {
  if (!music.link) return null
  const embed = toEmbed(music.link)
  // While working locally, show where the picture will go; the live site only shows it once it's added
  const showPhoto = !embed && (music.photo || import.meta.env.DEV)

  return (
    <section className="section">
      <div className={`music ${embed ? '' : 'music-solo'} ${showPhoto ? '' : 'music-single'}`} data-reveal>
        <div className="music-copy">
          <h3>
            {music.title}
            <br />
            <span className="grad">{music.accent}</span>
          </h3>
          <p className="muted">{music.text}</p>
          {embed ? (
            <a className="btn btn-ghost spotify-btn" href={music.link} target="_blank" rel="noreferrer">
              <MusicIcon width={15} height={15} /> Open in Spotify <ArrowUpRight width={14} height={14} />
            </a>
          ) : (
            <NowPlaying />
          )}
        </div>

        {embed && (
          <iframe
            title="Spotify player"
            src={embed}
            width="100%"
            height="352"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        )}

        {showPhoto && (
          <div className={`music-photo ${music.photo ? '' : 'empty'}`}>
            {music.photo ? (
              <img src={music.photo} alt={`${profile.name} with music`} loading="lazy" />
            ) : (
              <span>Your picture goes here (set music.photo in data.js)</span>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
