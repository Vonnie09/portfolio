// Draws the ID badge front, back and lanyard strap onto canvases.
// Everything is generated in code — only your cutout photo is an image file.
import QRCode from 'qrcode'
import { badge, profile } from '../data'

export const CARD_PX = { w: 800, h: 1125 }

const INK = '#141a33' // dark navy ink
const INK_SOFT = '#2a3358'
const PAPER = '#ece4d0'
const PAPER_DARK = '#d9cfb6'
const ACCENT = '#3b6cff'

/* ---------- helpers ---------- */

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Seeded random so the "paper grain" looks the same every load
function rng(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function paper(ctx, W, H, seed = 7) {
  const g = ctx.createRadialGradient(W * 0.5, H * 0.4, 50, W * 0.5, H * 0.5, H * 0.75)
  g.addColorStop(0, '#f3ecdb')
  g.addColorStop(1, PAPER_DARK)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  // grain
  const r = rng(seed)
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(60,45,20,0.06)' : 'rgba(255,255,255,0.10)'
    ctx.fillRect(r() * W, r() * H, 1.6, 1.6)
  }
  // faint crease lines
  ctx.strokeStyle = 'rgba(70,55,30,0.07)'
  ctx.lineWidth = 1.2
  for (let i = 0; i < 14; i++) {
    ctx.beginPath()
    const x = r() * W
    const y = r() * H
    ctx.moveTo(x, y)
    ctx.lineTo(x + (r() - 0.5) * 300, y + (r() - 0.5) * 300)
    ctx.stroke()
  }
}

function slot(ctx, W) {
  ctx.fillStyle = '#0b0d16'
  rr(ctx, W / 2 - 78, 30, 156, 30, 15)
  ctx.fill()
}

function fitFont(ctx, text, weightFamily, maxW, start, min = 10) {
  let size = start
  ctx.font = `${weightFamily.replace('{s}', size)}`
  while (ctx.measureText(text).width > maxW && size > min) {
    size -= 2
    ctx.font = `${weightFamily.replace('{s}', size)}`
  }
  return size
}

function hazard(ctx, x, y, w, h, angle = -1) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.fillStyle = INK
  for (let i = -h; i < w + h; i += 28) {
    ctx.beginPath()
    ctx.moveTo(x + i, y)
    ctx.lineTo(x + i + 14, y)
    ctx.lineTo(x + i + 14 + angle * -h, y + h)
    ctx.lineTo(x + i + angle * -h, y + h)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

function cropMarks(ctx, x, y, w, h, len = 18) {
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  const c = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ]
  c.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath()
    ctx.moveTo(cx, cy + dy * len)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx + dx * len, cy)
    ctx.stroke()
  })
}

function schoolBlock(ctx, xRight, y) {
  // simple emblem (circle + chevron), not a real logo
  ctx.save()
  ctx.textAlign = 'left'
  ctx.font = '700 30px "Space Grotesk", sans-serif'
  const t1 = badge.school
  ctx.font = '400 30px Anton, sans-serif'
  const w1 = ctx.measureText(t1).width
  ctx.font = '600 15px Inter, sans-serif'
  const w2 = ctx.measureText(badge.schoolSub).width
  const textW = Math.max(w1, w2)
  const x = xRight - textW
  // emblem
  const ex = x - 34
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.arc(ex, y + 4, 24, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = PAPER
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.moveTo(ex - 11, y + 10)
  ctx.lineTo(ex, y - 6)
  ctx.lineTo(ex + 11, y + 10)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(ex, y + 4, 18, 0, Math.PI * 2)
  ctx.lineWidth = 1.5
  ctx.stroke()
  // text
  ctx.fillStyle = INK
  ctx.font = '400 30px Anton, sans-serif'
  ctx.fillText(t1, x, y + 8)
  ctx.font = '600 15px Inter, sans-serif'
  ctx.fillStyle = INK_SOFT
  ctx.fillText(badge.schoolSub, x, y + 30)
  ctx.restore()
}

function verticalText(ctx, text, x, y, h, size = 40) {
  ctx.save()
  ctx.translate(x, y + h)
  ctx.rotate(-Math.PI / 2)
  ctx.font = `400 ${size}px Anton, sans-serif`
  let s = size
  while (ctx.measureText(text).width > h - 30 && s > 16) {
    s -= 2
    ctx.font = `400 ${s}px Anton, sans-serif`
  }
  ctx.fillStyle = INK
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(text, h / 2, 0)
  ctx.restore()
}

/* ---------- front ---------- */

export function drawFront(canvas, cutout) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  paper(ctx, W, H, 11)
  slot(ctx, W)

  // outer thin frame
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ctx.strokeRect(34, 84, W - 68, H - 118)

  // JUNIOR tag
  ctx.fillStyle = INK
  rr(ctx, 54, 104, 150, 44, 6)
  ctx.fill()
  ctx.fillStyle = PAPER
  ctx.font = '400 28px Anton, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(badge.tag, 129, 127)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  schoolBlock(ctx, W - 58, 122)

  // giant title
  ctx.fillStyle = INK
  const titleSize = fitFont(ctx, badge.title, '400 {s}px Anton, sans-serif', W - 100, 190)
  ctx.textAlign = 'center'
  ctx.fillText(badge.title, W / 2, 168 + titleSize * 0.86)
  const titleBottom = 168 + titleSize * 0.86
  ctx.textAlign = 'left'

  // dotted guide lines around title
  ctx.setLineDash([4, 6])
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(48, 166)
  ctx.lineTo(W - 48, 166)
  ctx.moveTo(48, titleBottom + 14)
  ctx.lineTo(W - 48, titleBottom + 14)
  ctx.stroke()
  ctx.setLineDash([])

  // photo panel
  const px = 70
  const py = titleBottom + 40
  const pw = W - 210
  const ph = H - 150 - py
  const pg = ctx.createLinearGradient(px, py, px + pw, py + ph)
  pg.addColorStop(0, '#2e4fd0')
  pg.addColorStop(0.55, '#16245e')
  pg.addColorStop(1, '#0b112b')
  ctx.fillStyle = pg
  ctx.fillRect(px, py, pw, ph)
  // halftone dots on panel
  ctx.fillStyle = 'rgba(255,255,255,0.10)'
  for (let y = py + 10; y < py + ph; y += 16) {
    for (let x = px + 10; x < px + pw; x += 16) {
      const d = 1 + 3 * ((x - px) / pw) * (1 - (y - py) / ph)
      ctx.beginPath()
      ctx.arc(x, y, d, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  // code-ish text in panel
  ctx.font = '600 15px "Space Grotesk", monospace'
  ctx.fillStyle = 'rgba(180,200,255,0.35)'
  ;['const dev = {', `  name: '${profile.shortName}',`, "  stack: ['js','react'],", '  ride: true,', '}'].forEach((l, i) =>
    ctx.fillText(l, px + 18, py + 30 + i * 20)
  )
  ctx.strokeStyle = INK
  ctx.lineWidth = 4
  ctx.strokeRect(px, py, pw, ph)

  // the cutout — allowed to break out above the panel top
  if (cutout) {
    const targetH = ph + 150
    const s = targetH / cutout.height
    const iw = cutout.width * s
    const ih = cutout.height * s
    const ix = px + (pw - iw) / 2 + 10
    const iy = py + ph - ih
    ctx.save()
    // clip: everything inside the panel + the area above it (so the head pops out), but not below/sides
    ctx.beginPath()
    ctx.rect(px + 4, iy, pw - 8, py + ph - iy - 4)
    ctx.clip()
    ctx.shadowColor = 'rgba(0,0,0,0.35)'
    ctx.shadowBlur = 24
    ctx.drawImage(cutout, ix, iy, iw, ih)
    ctx.restore()
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = '400 220px Anton, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(profile.initials || 'ME', px + pw / 2, py + ph / 2 + 80)
    ctx.textAlign = 'left'
  }

  // vertical side text
  ctx.strokeStyle = INK
  ctx.lineWidth = 2.5
  ctx.strokeRect(W - 124, py, 64, ph)
  verticalText(ctx, badge.sideText, W - 92, py, ph, 44)

  // name tag over the lower-left of the photo
  const name = profile.name.toUpperCase()
  ctx.font = '400 34px Anton, sans-serif'
  const nw = Math.min(ctx.measureText(name).width, pw - 40)
  fitFont(ctx, name, '400 {s}px Anton, sans-serif', pw - 40, 34)
  const tx = px - 14
  const ty = py + ph - 92
  ctx.fillStyle = PAPER
  ctx.fillRect(tx, ty, nw + 36, 56)
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.strokeRect(tx, ty, nw + 36, 56)
  ctx.fillStyle = INK
  ctx.textBaseline = 'middle'
  ctx.fillText(name, tx + 18, ty + 30)
  ctx.textBaseline = 'alphabetic'

  cropMarks(ctx, px - 16, py - 16, pw + 32, ph + 32)

  // footer band
  const fy = H - 118
  ctx.fillStyle = INK
  ctx.fillRect(34, fy, W - 68, 84)
  ctx.fillStyle = PAPER
  ctx.font = '400 58px Anton, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('PORTFOLIO', 56, fy + 44)
  // pill
  ctx.strokeStyle = 'rgba(236,228,208,0.6)'
  ctx.lineWidth = 2
  rr(ctx, 392, fy + 28, 92, 30, 15)
  ctx.stroke()
  ctx.fillStyle = ACCENT
  ctx.beginPath()
  ctx.arc(468, fy + 43, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = PAPER
  ctx.font = '500 21px Inter, sans-serif'
  ctx.fillText(badge.motto[0], 506, fy + 30)
  ctx.fillText(badge.motto[1], 506, fy + 58)
  ctx.textBaseline = 'alphabetic'
}

/* ---------- back ---------- */

export function drawBack(canvas) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  paper(ctx, W, H, 23)
  slot(ctx, W)

  // SCAN HERE tag (slanted)
  ctx.save()
  ctx.translate(70, 150)
  ctx.rotate(-0.12)
  ctx.fillStyle = INK
  ctx.fillRect(0, -42, 250, 70)
  ctx.fillStyle = PAPER
  ctx.font = '400 44px Anton, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('SCAN HERE', 18, -6)
  hazard(ctx, 0, 34, 250, 20)
  ctx.restore()

  schoolBlock(ctx, W - 58, 122)

  // QR panel
  const px = 92
  const py = 230
  const pw = W - 250
  const ph = 640
  ctx.fillStyle = INK
  ctx.fillRect(px, py, pw, ph)
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.strokeRect(px - 12, py - 12, pw + 24, ph + 24)

  ctx.fillStyle = PAPER
  ctx.textAlign = 'center'
  ctx.font = '400 48px Anton, sans-serif'
  ctx.fillText(badge.qrTitle, px + pw / 2, py + 76)
  ctx.font = '600 22px Inter, sans-serif'
  const sub = `—  ${badge.qrSub}  —`
  ctx.fillText(sub, px + pw / 2, py + 112)
  ctx.textAlign = 'left'

  // QR code
  try {
    const qr = QRCode.create(badge.qrLink || 'https://github.com', { errorCorrectionLevel: 'M' })
    const n = qr.modules.size
    const size = pw - 120
    const cell = size / n
    const qx = px + 60
    const qy = py + 150
    ctx.fillStyle = PAPER
    ctx.fillRect(qx - 18, qy - 18, size + 36, size + 36)
    ctx.fillStyle = INK
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.modules.get(r, c)) ctx.fillRect(qx + c * cell, qy + r * cell, Math.ceil(cell), Math.ceil(cell))
      }
    }
  } catch {
    /* invalid QR text — leave panel empty */
  }

  // left hazard column
  hazard(ctx, 40, 260, 30, 300, -1)
  // vertical side text
  ctx.strokeStyle = INK
  ctx.lineWidth = 2.5
  ctx.strokeRect(W - 128, py - 12, 64, ph + 24)
  verticalText(ctx, badge.backSideText, W - 96, py - 12, ph + 24, 44)

  // name + role
  ctx.fillStyle = INK
  ctx.fillRect(34, H - 190, W - 68, 150)
  ctx.fillStyle = PAPER
  ctx.textAlign = 'center'
  fitFont(ctx, profile.name.toUpperCase(), '400 {s}px Anton, sans-serif', W - 120, 50)
  ctx.fillText(profile.name.toUpperCase(), W / 2, H - 112)
  ctx.font = '500 26px Inter, sans-serif'
  ctx.fillText(`—  ${profile.roles[0] || ''}  —`, W / 2, H - 66)
  ctx.textAlign = 'left'

  // corner swirl ornament
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.arc(34, H - 190, 40 + i * 16, -Math.PI / 2, 0)
    ctx.stroke()
  }
}

/* ---------- lanyard strap ---------- */

export function drawBand(canvas) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  ctx.fillStyle = '#0c0d12'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fillRect(0, 6, W, 2)
  ctx.fillRect(0, H - 8, W, 2)
  // logo circle
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(70, H / 2, 30, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.font = '400 38px Anton, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText((profile.initials || 'V')[0], 70, H / 2 + 2)
  ctx.font = '700 46px "Space Grotesk", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(badge.lanyardText, 122, H / 2 + 2)
}

/* ---------- asset loading ---------- */

export async function loadBadgeAssets() {
  // Fonts only download when something uses them, so request them explicitly
  if (document.fonts?.load) {
    await Promise.allSettled([
      document.fonts.load('400 100px Anton'),
      document.fonts.load('700 40px "Space Grotesk"'),
      document.fonts.load('600 20px Inter'),
      document.fonts.load('500 20px Inter'),
    ])
  }
  let cutout = null
  const src = badge.cutout || profile.photo
  if (src) {
    cutout = await new Promise((res) => {
      const img = new Image()
      img.onload = () => res(img)
      img.onerror = () => res(null)
      img.src = src
    })
  }
  return { cutout }
}
