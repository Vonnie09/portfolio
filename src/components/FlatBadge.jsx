import { useEffect, useRef } from 'react'
import { badge } from '../data'
import { CARD_PX, drawBack, drawFront, loadBadgeAssets } from './badgeArt'

// Backup badge for browsers where 3D (WebGL) is turned off or not working.
// Same artwork as the 3D badge, drawn flat, swinging gently, and it still flips when clicked.
export default function FlatBadge({ flipped, onToggle }) {
  const front = useRef()
  const back = useRef()

  useEffect(() => {
    let cancelled = false
    loadBadgeAssets().then(({ cutout }) => {
      if (cancelled) return
      drawFront(front.current, cutout)
      drawBack(back.current)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flat-badge">
      <div className="fb-strap" aria-hidden="true">
        <span>{badge.lanyardText}</span>
      </div>
      <i className="fb-clip" aria-hidden="true" />
      <button
        type="button"
        className="fb-card"
        onClick={onToggle}
        aria-label={flipped ? 'Show the front of the badge' : 'Flip the badge'}
      >
        <span className={`fb-inner ${flipped ? 'flipped' : ''}`}>
          <canvas ref={front} width={CARD_PX.w} height={CARD_PX.h} className="fb-face" />
          <canvas ref={back} width={CARD_PX.w} height={CARD_PX.h} className="fb-face fb-back" />
        </span>
      </button>
    </div>
  )
}
