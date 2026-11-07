import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { certificateGroups } from '../data'
import { ArrowUpRight, Badge } from './Icons'

const INITIAL = 6

function Lightbox({ cert, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  // Rendered straight into <body> so animated parents can't trap the fixed overlay
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={cert.title} onClick={onClose}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={cert.image} alt={`${cert.title} certificate`} />
        <figcaption>
          <div>
            <strong>{cert.title}</strong>
            <span>
              {cert.issuer}
              {cert.year && ` · ${cert.year}`}
            </span>
          </div>
          <div className="lb-actions">
            {cert.url && (
              <a className="btn btn-small btn-primary" href={cert.url} target="_blank" rel="noreferrer">
                Verify <ArrowUpRight width={14} height={14} />
              </a>
            )}
            <button className="btn btn-small btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </figcaption>
      </figure>
    </div>,
    document.body
  )
}

function CertCard({ c, onOpen }) {
  return (
    <article className="card cert-card">
      {c.thumb ? (
        <button className="cert-thumb" onClick={() => onOpen(c)} aria-label={`View ${c.title} certificate`}>
          <img src={c.thumb} alt="" loading="lazy" width="640" height="494" />
        </button>
      ) : (
        <div className="cert-thumb cert-thumb-empty">
          <Badge width={28} height={28} />
        </div>
      )}
      <div className="cert-body">
        <h3>{c.title}</h3>
        <p>{c.issuer}</p>
        <div className="lc-foot">
          <span className="years">{c.year}</span>
          <span className="cert-links">
            {c.image && (
              <button type="button" onClick={() => onOpen(c)}>
                View
              </button>
            )}
            {c.url && (
              <a href={c.url} target="_blank" rel="noreferrer">
                Verify <ArrowUpRight width={13} height={13} />
              </a>
            )}
          </span>
        </div>
      </div>
    </article>
  )
}

function Group({ g, onOpen }) {
  const [all, setAll] = useState(false)
  const items = all ? g.items : g.items.slice(0, INITIAL)
  const hidden = g.items.length - INITIAL
  return (
    <div className="cert-group">
      <h3 className="group-title">
        {g.group} <span>{g.items.length}</span>
      </h3>
      <div className="grid-3">
        {items.map((c) => (
          <CertCard key={c.title} c={c} onOpen={onOpen} />
        ))}
      </div>
      {hidden > 0 && (
        <div className="show-more">
          <button className="btn btn-ghost" onClick={() => setAll((a) => !a)}>
            {all ? 'Show less' : `Show ${hidden} more`}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Certificates() {
  const [open, setOpen] = useState(null)
  return (
    <>
      {certificateGroups
        .filter((g) => g.items.length)
        .map((g) => (
          <Group key={g.group} g={g} onOpen={setOpen} />
        ))}
      {open && <Lightbox cert={open} onClose={() => setOpen(null)} />}
    </>
  )
}
