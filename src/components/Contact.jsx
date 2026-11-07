import { useState } from 'react'
import { contactForm, profile } from '../data'
import { Mail, Message, Send, User } from './Icons'
import { SocialCards } from './Social'

export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  async function onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // No Formspree yet → open the visitor's email app with the message filled in
    if (!contactForm.formspreeEndpoint) {
      const subject = encodeURIComponent(`Portfolio message from ${data.get('name')}`)
      const body = encodeURIComponent(`${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`)
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
      return
    }

    setStatus('sending')
    try {
      const res = await fetch(contactForm.formspreeEndpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error('Request failed')
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="section">
      <h2 className="section-title" data-reveal>
        Contact
      </h2>
      <div className="contact-grid">
        <form className="card contact-form" onSubmit={onSubmit} data-reveal>
          <h3 className="grad">Let's talk</h3>
          <p className="muted">Have a project, a question, or just want to say hi? Send me a message.</p>

          <label>
            Name
            <span className="field">
              <User width={16} height={16} />
              <input name="name" required placeholder="Your name" autoComplete="name" />
            </span>
          </label>
          <label>
            Email
            <span className="field">
              <Mail width={16} height={16} />
              <input name="email" type="email" required placeholder="you@email.com" autoComplete="email" />
            </span>
          </label>
          <label>
            Message
            <span className="field field-area">
              <Message width={16} height={16} />
              <textarea name="message" required rows={5} placeholder="Write your message…" />
            </span>
          </label>

          <button className="btn btn-primary btn-block" type="submit" disabled={status === 'sending'}>
            <Send width={15} height={15} /> {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
          {status === 'sent' && <p className="form-note ok">Thanks! Your message was sent.</p>}
          {status === 'error' && (
            <p className="form-note err">
              Something went wrong. You can email me directly at <a href={`mailto:${profile.email}`}>{profile.email}</a>.
            </p>
          )}
        </form>

        <div className="contact-side" data-reveal>
          <div className="card">
            <h4 className="sub-title">Find me</h4>
            <SocialCards />
          </div>
          <a className="card email-card" href={`mailto:${profile.email}`}>
            <Mail width={20} height={20} />
            <span>
              <small>Email me directly</small>
              <strong>{profile.email}</strong>
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
