import { profile } from '../data'
import { ArrowUp } from './Icons'
import { SocialIcons } from './Social'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <p className="logo">
            <span>&gt;_</span> {profile.shortName}.dev
          </p>
          <p className="muted small">Building modern websites with clean code, sharp type and a little 3D.</p>
        </div>
        <div>
          <h5>Navigate</h5>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h5>Connect</h5>
          <SocialIcons />
        </div>
      </div>
      <div className="footer-bottom">
        <small>
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </small>
        <a href="#home" className="btn btn-small btn-ghost">
          Back to top <ArrowUp width={14} height={14} />
        </a>
      </div>
    </footer>
  )
}
