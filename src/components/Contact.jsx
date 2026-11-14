import { profile, whatsapp } from '../data'
import { Mail, WhatsApp } from './Icons'
import { SocialCards } from './Social'

export default function Contact() {
  return (
    <section id="contact" className="section">
      <h2 className="section-title" data-reveal>
        Contact
      </h2>
      <div className="contact-grid contact-grid-even">
        <div className="card contact-socials" data-reveal>
          <h4 className="sub-title">Find me</h4>
          <SocialCards />
        </div>

        <div className="contact-side" data-reveal>
          <a className="card email-card" href={`mailto:${profile.email}`}>
            <Mail width={20} height={20} />
            <span>
              <small>Email me directly</small>
              <strong>{profile.email}</strong>
            </span>
          </a>
          {whatsapp?.link && (
            <a className="card wa-card" href={whatsapp.link} target="_blank" rel="noreferrer">
              {whatsapp.qr && (
                <img src={whatsapp.qr} alt="WhatsApp QR code" width="500" height="500" loading="lazy" />
              )}
              <span>
                <small>
                  <WhatsApp width={14} height={14} /> Chat on WhatsApp
                </small>
                <strong>{whatsapp.number}</strong>
                <em>{whatsapp.qr ? 'Scan the code with your phone, or tap to open a chat' : 'Tap to open a chat'}</em>
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
