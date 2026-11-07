import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, RoundedBox } from '@react-three/drei'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { profile } from '../data'

extend({ MeshLineGeometry, MeshLineMaterial })

const CARD_W = 1.6
const CARD_H = 2.25

/* ---------- canvas textures (no image files needed) ---------- */

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function drawFront(canvas, photo) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height

  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0d1530')
  bg.addColorStop(1, '#060812')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // grid pattern
  ctx.strokeStyle = 'rgba(91,140,255,0.08)'
  ctx.lineWidth = 2
  for (let x = 0; x < W; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y < H; y += 48) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // slot hole
  ctx.fillStyle = '#02030a'
  roundRect(ctx, W / 2 - 70, 34, 140, 26, 13)
  ctx.fill()

  // header
  ctx.fillStyle = '#5b8cff'
  ctx.font = '600 30px "Space Grotesk", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('ACCESS · ALL AREAS', W / 2, 112)

  ctx.fillStyle = '#f2f4ff'
  ctx.font = '700 92px "Space Grotesk", sans-serif'
  ctx.fillText('DEVELOPER', W / 2, 205)

  // photo frame
  const px = 110, py = 250, pw = W - 220, ph = 470
  const grad = ctx.createLinearGradient(px, py, px + pw, py + ph)
  grad.addColorStop(0, '#2a4ed8')
  grad.addColorStop(1, '#101a3f')
  ctx.save()
  roundRect(ctx, px, py, pw, ph, 28)
  ctx.clip()
  ctx.fillStyle = grad
  ctx.fillRect(px, py, pw, ph)
  if (photo) {
    const s = Math.max(pw / photo.width, ph / photo.height)
    const iw = photo.width * s
    const ih = photo.height * s
    ctx.drawImage(photo, px + (pw - iw) / 2, py + (ph - ih) / 2, iw, ih)
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.font = '700 200px "Space Grotesk", sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(profile.initials || initials(profile.name) || '◆', W / 2, py + ph / 2 + 8)
    ctx.textBaseline = 'alphabetic'
  }
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 3
  roundRect(ctx, px, py, pw, ph, 28)
  ctx.stroke()

  // name + role
  ctx.fillStyle = '#ffffff'
  let size = 58
  ctx.font = `700 ${size}px "Space Grotesk", sans-serif`
  while (ctx.measureText(profile.name.toUpperCase()).width > W - 120 && size > 30) {
    size -= 2
    ctx.font = `700 ${size}px "Space Grotesk", sans-serif`
  }
  ctx.fillText(profile.name.toUpperCase(), W / 2, 805)

  ctx.fillStyle = '#9fb3ff'
  ctx.font = '500 34px Inter, sans-serif'
  ctx.fillText(profile.roles[0] || '', W / 2, 855)

  // footer strip
  ctx.fillStyle = '#5b8cff'
  ctx.fillRect(0, H - 120, W, 120)
  ctx.fillStyle = '#060812'
  ctx.font = '700 40px "Space Grotesk", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('PORTFOLIO', 60, H - 48)
  ctx.textAlign = 'right'
  ctx.font = '600 28px Inter, sans-serif'
  ctx.fillText(`ID ${new Date().getFullYear()}-001`, W - 60, H - 50)

  // barcode
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  let bx = 110
  const seed = profile.name.length * 7 + 3
  for (let i = 0; i < 44; i++) {
    const w = ((i * seed) % 3) + 2
    ctx.fillRect(bx, 895, w, 60)
    bx += w + 4
  }
}

function drawBack(canvas) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  ctx.fillStyle = '#080b18'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#02030a'
  roundRect(ctx, W / 2 - 70, 34, 140, 26, 13)
  ctx.fill()
  ctx.fillStyle = '#5b8cff'
  ctx.textAlign = 'center'
  ctx.font = '700 64px "Space Grotesk", sans-serif'
  ctx.fillText(`</${profile.shortName}>`, W / 2, H / 2 - 20)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '500 32px Inter, sans-serif'
  ctx.fillText('drag me around', W / 2, H / 2 + 50)
}

function drawBand(canvas) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height
  ctx.fillStyle = '#1b2f7a'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#5b8cff'
  ctx.fillRect(0, 0, W, 8)
  ctx.fillRect(0, H - 8, W, 8)
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 64px "Space Grotesk", sans-serif'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(`${profile.shortName.toUpperCase()} ✦`, W / 2, H / 2 + 4)
}

function useCanvasTexture(width, height, draw, deps = []) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [width, height])

  useEffect(() => {
    let cancelled = false
    const redraw = (...args) => {
      if (cancelled) return
      draw(texture.image, ...args)
      texture.needsUpdate = true
    }
    // Wait for web fonts so the text is drawn with the right typeface
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve()
    fontsReady.then(() => {
      if (profile.photo && draw === drawFront) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => redraw(img)
        img.onerror = () => redraw(null)
        img.src = profile.photo
      } else {
        redraw(null)
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texture, ...deps])

  return texture
}

/* ---------- physics badge ---------- */

function Band({ maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef()
  const fixed = useRef()
  const j1 = useRef()
  const j2 = useRef()
  const j3 = useRef()
  const card = useRef()

  const vec = useMemo(() => new THREE.Vector3(), [])
  const ang = useMemo(() => new THREE.Vector3(), [])
  const rot = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])

  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 2, linearDamping: 2 }
  const { width, height } = useThree((s) => s.size)
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  )
  curve.curveType = 'chordal'
  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)

  const front = useCanvasTexture(800, 1125, drawFront)
  const back = useCanvasTexture(800, 1125, drawBack)
  const bandTex = useCanvasTexture(512, 128, drawBand)
  bandTex.wrapS = bandTex.wrapT = THREE.RepeatWrapping

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]])

  useEffect(() => {
    if (!hovered) return
    document.body.style.cursor = dragged ? 'grabbing' : 'grab'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((r) => r.current?.wakeUp())
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z })
    }
    if (fixed.current) {
      // Smooth the rope points so it doesn't jitter when pulled hard
      ;[j1, j2].forEach((r) => {
        if (!r.current.lerped) r.current.lerped = new THREE.Vector3().copy(r.current.translation())
        const d = Math.max(0.1, Math.min(1, r.current.lerped.distanceTo(r.current.translation())))
        r.current.lerped.lerp(r.current.translation(), delta * (minSpeed + d * (maxSpeed - minSpeed)))
      })
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(32))
      // Gently turn the card back to face the screen
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    }
  })

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[CARD_W / 2, CARD_H / 2, 0.01]} />
          <group
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              e.target.releasePointerCapture(e.pointerId)
              drag(false)
            }}
            onPointerDown={(e) => {
              e.target.setPointerCapture(e.pointerId)
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            }}
          >
            {/* card body */}
            <RoundedBox args={[CARD_W, CARD_H, 0.03]} radius={0.06} smoothness={4}>
              <meshPhysicalMaterial color="#0a0e1c" roughness={0.4} clearcoat={1} clearcoatRoughness={0.2} />
            </RoundedBox>
            {/* front print */}
            <mesh position={[0, 0, 0.0155]}>
              <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
              <meshPhysicalMaterial map={front} roughness={0.35} clearcoat={1} clearcoatRoughness={0.15} />
            </mesh>
            {/* back print */}
            <mesh position={[0, 0, -0.0155]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
              <meshPhysicalMaterial map={back} roughness={0.5} />
            </mesh>
            {/* metal clip */}
            <mesh position={[0, CARD_H / 2 + 0.08, 0]}>
              <boxGeometry args={[0.28, 0.16, 0.06]} />
              <meshStandardMaterial color="#c9ced8" metalness={1} roughness={0.25} />
            </mesh>
            <mesh position={[0, CARD_H / 2 + 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.08, 0.022, 12, 24]} />
              <meshStandardMaterial color="#c9ced8" metalness={1} roughness={0.25} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={bandTex}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  )
}

export default function Lanyard() {
  const wrap = useRef()
  const [visible, setVisible] = useState(true)
  const isSmall = typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches

  // Stop rendering when the badge is scrolled out of view (saves battery on phones)
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 })
    if (wrap.current) io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  return (
    <div className="lanyard" ref={wrap}>
      <Canvas
        camera={{ position: [0, 0, isSmall ? 15 : 13], fov: 25 }}
        dpr={[1, isSmall ? 1.5 : 2]}
        frameloop={visible ? 'always' : 'never'}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={Math.PI} />
        <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
          <Band />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="#9fb3ff" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}
