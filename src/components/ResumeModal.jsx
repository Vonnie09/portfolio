import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { profile } from '../data'
import { RESUME_EVENT } from '../resume'
import { ArrowUpRight, Close, Download, FileText } from './Icons'

// Resume pop-up. Opens from any "Resume" button (see src/resume.js).
// Closes with the X, the Esc key, or a click outside the resume.
export default function ResumeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener(RESUME_EVENT, show)
    return () => window.removeEventListener(RESUME_EVENT, show)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || !profile.resume) return null
  const close = () => setOpen(false)
  const fileName = profile.resume.split('/').pop()

  return createPortal(
    <div className="lightbox resume-modal" role="dialog" aria-modal="true" aria-label="Resume" onClick={close}>
      <div className="resume-panel" onClick={(e) => e.stopPropagation()}>
        <header className="resume-bar">
          <div className="resume-title">
            <FileText width={18} height={18} />
            <div>
              <strong>Resume</strong>
              <span>{profile.name}</span>
            </div>
          </div>
          <div className="lb-actions">
            <a className="btn btn-small btn-primary" href={profile.resume} download={fileName}>
              <Download width={14} height={14} /> Download
            </a>
            <a className="btn btn-small btn-ghost resume-open" href={profile.resume} target="_blank" rel="noreferrer">
              Open PDF <ArrowUpRight width={14} height={14} />
            </a>
            <button className="icon-close" onClick={close} aria-label="Close resume">
              <Close width={18} height={18} />
            </button>
          </div>
        </header>
        <div className="resume-page">
          {profile.resumePreview ? (
            <img src={profile.resumePreview} alt={`${profile.name} resume`} width="1400" height="1811" />
          ) : (
            <iframe title="Resume" src={profile.resume} />
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
