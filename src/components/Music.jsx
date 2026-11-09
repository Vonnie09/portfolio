import { music, profile } from '../data'
import Avatar from './Avatar'
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

        {/* right side: a real picture if one is set in data.js, otherwise the cartoon that follows the mouse */}
        {!embed &&
          (music.photo ? (
            <div className="music-photo">
              <img src={music.photo} alt={profile.name} loading="lazy" />
            </div>
          ) : (
            <div className="music-avatar">
              <Avatar />
              <p className="avatar-hint">
                <span className="on-mouse">Move your mouse around · click me ✦</span>
                <span className="on-touch">Tap me ✦</span>
              </p>
            </div>
          ))}
      </div>
    </section>
  )
}
