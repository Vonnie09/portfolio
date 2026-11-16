import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
import { CARD_PX, drawBack, drawBand, drawFront, loadBadgeAssets } from './badgeArt'

extend({ MeshLineGeometry, MeshLineMaterial })

// meshline bug fix: at the two ends of the strap the shader tests "is the neighbour the same point?"
// on screen positions that went through slightly different maths, so on any non-square screen the
// test fails, the end gets a random direction and the strap is pinched into a "V". Compare the
// original points instead.
const END_TEST = `if (nextP == currentP) dir = normalize(currentP - prevP);
    else if (prevP == currentP) dir = normalize(nextP - currentP);`
const END_FIX = `if (distance(next, position) < 1e-6) dir = normalize(currentP - prevP);
    else if (distance(previous, position) < 1e-6) dir = normalize(nextP - currentP);`
function fixStrapEnds(material) {
  if (!material || material.userData.endsFixed) return
  if (!material.vertexShader.includes(END_TEST)) {
    console.warn('Lanyard: meshline shader changed, strap end fix not applied')
    return
  }
  material.vertexShader = material.vertexShader.replace(END_TEST, END_FIX)
  material.userData.endsFixed = true
  material.needsUpdate = true
}

const CARD_W = 1.6
const CARD_H = 2.25
// Lanyard hardware, in card units (the card's top edge is at CARD_H / 2 = 1.125).
// The slot printed on the card (badgeArt.js) is centred 45px below the top of the 1125px print.
const SLOT_Y = CARD_H / 2 - 0.02 - (45 / 1125) * (CARD_H - 0.04)
const HOOK_R = 0.075 // loop radius; stretched 1.6x tall so it reads as a lobster-style hook
const HOOK_Y = SLOT_Y + HOOK_R * 1.6 // hook centre: its bottom passes through the slot
const SWIVEL_Y = HOOK_Y + HOOK_R * 1.6 + 0.03
const RING_Y = SWIVEL_Y + 0.06
// Like a real lanyard, the metal crimp belongs to the strap and the card swings on the small ring
// (the physics joint sits there). Distances below are measured from the ring along the strap.
const CRIMP_D = 0.09 // centre of the crimp
const TIP_D = CRIMP_D + 0.035 // where the strap ends, hidden inside the crimp
const GUIDE_D = CRIMP_D + 0.2 // the strap runs straight out of the crimp up to here, then curves
const UP = new THREE.Vector3(0, 1, 0)
const TWIST_LEN = 0.55 // share of the strap (from the card up) that twists when the card turns
const chrome = { color: '#d9dde4', metalness: 1, roughness: 0.18 }

// Creates a canvas texture and (re)draws it once fonts and the cutout photo are ready
function useCanvasTexture(width, height, draw) {
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
    loadBadgeAssets().then(({ cutout }) => {
      if (cancelled) return
      draw(texture.image, cutout)
      texture.needsUpdate = true
    })
    return () => {
      cancelled = true
    }
  }, [texture, draw])

  return texture
}

/* ---------- physics badge ---------- */

function Band({ maxSpeed = 50, minSpeed = 10, flipped = false, onToggle, anchorX = 0, onHot, grabRef, lite = false, trackHover = false }) {
  const band = useRef()
  const fixed = useRef()
  const j1 = useRef()
  const j2 = useRef()
  const j3 = useRef()
  const card = useRef()
  const cardVis = useRef() // the card as drawn on screen (physics is interpolated, so it can trail the body)

  const vec = useMemo(() => new THREE.Vector3(), [])
  const ang = useMemo(() => new THREE.Vector3(), [])
  const rot = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const tip = useMemo(() => new THREE.Vector3(), [])
  const guide = useMemo(() => new THREE.Vector3(), [])
  const pivot = useMemo(() => new THREE.Vector3(), [])
  const strapDir = useMemo(() => new THREE.Vector3(), [])
  // strap points, made once and refilled every frame: tip, midpoint, then 31 points along the curve
  const strapPts = useMemo(() => Array.from({ length: 33 }, () => new THREE.Vector3()), [])
  // Twist: the bottom of the strap turns with the card (by its yaw, the turn around the vertical axis)
  // and the twist fades out going up. The strap is drawn as a flat ribbon facing the screen, so a
  // turned piece is shown by making it narrower (|cos|), like a real strap seen edge-on.
  const twistYaw = useRef(0)
  const strapWidth = useMemo(() => (p) => Math.max(0.12, Math.abs(Math.cos(twistYaw.current * Math.max(0, 1 - p / TWIST_LEN)))), [])
  const yawQ = useMemo(() => new THREE.Quaternion(), [])
  const crimp = useRef()
  const bandMat = useRef()
  useLayoutEffect(() => fixStrapEnds(bandMat.current), [])
  const press = useRef(null) // where/when the pointer went down, to tell a click from a drag

  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 2, linearDamping: 2 }
  const { width, height } = useThree((s) => s.size)
  const [curve] = useState(
    () =>
      // just above the crimp → two rope points → top anchor (the bit inside the crimp is drawn straight)
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  )
  curve.curveType = 'chordal'
  curve.arcLengthDivisions = 64
  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)

  const front = useCanvasTexture(CARD_PX.w, CARD_PX.h, drawFront)
  const back = useCanvasTexture(CARD_PX.w, CARD_PX.h, drawBack)
  const bandTex = useCanvasTexture(512, 128, drawBand)
  bandTex.wrapS = bandTex.wrapT = THREE.RepeatWrapping

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, RING_Y, 0]]) // the card swings on the ring

  // Wake the physics up when flipping so the card starts turning right away
  useEffect(() => {
    ;[card, j1, j2, j3].forEach((r) => r.current?.wakeUp())
  }, [flipped])

  // Let the canvas catch the mouse only while it's over (or dragging) the card
  useEffect(() => {
    onHot?.(hovered || !!dragged)
  }, [hovered, dragged, onHot])

  useEffect(() => {
    if (!hovered) return
    document.body.style.cursor = dragged ? 'grabbing' : 'grab'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    // Re-check hover every frame: the card can swing away from a mouse that isn't moving,
    // and the page underneath must become clickable again right away
    if (trackHover) state.events.update?.()
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
      // The strap ends inside the metal crimp on the card. (The card joint j3 sits almost on top of that
      // point; using both made the curve fold back on itself and pinch the strap into a "V".)
      // Use the card as it is drawn, not the physics body, so the strap end never lags the crimp
      cardVis.current.updateWorldMatrix(true, false)
      cardVis.current.localToWorld(pivot.set(0, RING_Y, 0)) // the ring, as drawn
      strapDir.copy(j2.current.lerped).sub(pivot).normalize() // which way the strap leaves the ring
      tip.copy(pivot).addScaledVector(strapDir, TIP_D)
      guide.copy(pivot).addScaledVector(strapDir, GUIDE_D)
      // The card's yaw, between -π and π. Width uses cos, which is the same for +π and -π,
      // so the twist never jumps when the angle wraps around.
      const q = card.current.rotation()
      const yaw = 2 * Math.atan2(q.y, q.w)
      twistYaw.current = Math.atan2(Math.sin(yaw), Math.cos(yaw))
      // the crimp sits on the strap: it points along the strap and turns with the card when it flips
      crimp.current.position.copy(pivot).addScaledVector(strapDir, CRIMP_D)
      crimp.current.quaternion.setFromUnitVectors(UP, strapDir).multiply(yawQ.setFromAxisAngle(UP, twistYaw.current))
      curve.points[0].copy(guide)
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      curve.needsUpdate = true
      // The last bit (inside the crimp up to just above it) is a straight piece lined up with the card.
      // Bending the curve right down to the crimp made it double back and pinch the strap into a "V".
      // Points are evenly spaced so the print on the strap never bunches up.
      strapPts[0].copy(tip)
      strapPts[1].copy(tip).lerp(guide, 0.5)
      for (let i = 0; i <= 30; i++) curve.getPointAt(i / 30, strapPts[i + 2])
      band.current.geometry.setPoints(strapPts, strapWidth)
      // Turn the card to face the screen (front), or its back when flipped
      ang.copy(card.current.angvel())
      let err = (flipped ? Math.PI : 0) - yaw
      err = Math.atan2(Math.sin(err), Math.cos(err)) // shortest way around
      card.current.setAngvel({ x: ang.x, y: ang.y + (err * 6 - ang.y) * 0.12, z: ang.z })
    }
  })

  return (
    <>
      <group position={[anchorX, 4, 0]}>
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
            ref={cardVis}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              e.target.releasePointerCapture(e.pointerId)
              drag(false)
              // A quick tap without moving = click → flip the card
              const p = press.current
              if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 6 && performance.now() - p.t < 350) onToggle?.()
              press.current = null
            }}
            onPointerCancel={() => {
              // the browser took over the touch (e.g. started scrolling) — let go cleanly
              drag(false)
              press.current = null
              if (grabRef) grabRef.current = false
            }}
            onPointerDown={(e) => {
              if (grabRef) grabRef.current = true // tells the page not to scroll while dragging on touch screens
              press.current = { x: e.clientX, y: e.clientY, t: performance.now() }
              e.target.setPointerCapture(e.pointerId)
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            }}
          >
            {/* card body */}
            <RoundedBox args={[CARD_W, CARD_H, 0.03]} radius={0.06} smoothness={lite ? 2 : 4}>
              {lite ? (
                <meshStandardMaterial color="#0a0e1c" roughness={0.45} />
              ) : (
                <meshPhysicalMaterial color="#0a0e1c" roughness={0.4} clearcoat={1} clearcoatRoughness={0.2} />
              )}
            </RoundedBox>
            {/* front print */}
            <mesh position={[0, 0, 0.0155]}>
              <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
              {/* unlit so the print keeps its true colors and stays readable */}
              <meshBasicMaterial map={front} toneMapped={false} />
            </mesh>
            {/* back print */}
            <mesh position={[0, 0, -0.0155]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
              <meshBasicMaterial map={back} toneMapped={false} />
            </mesh>
            {/* lanyard hardware on the card: small ring → swivel → hook through the card slot (the crimp is on the strap) */}
            <mesh position={[0, RING_Y, 0]}>
              <torusGeometry args={[0.038, 0.011, 10, 24]} />
              <meshStandardMaterial {...chrome} />
            </mesh>
            <mesh position={[0, SWIVEL_Y, 0]}>
              <cylinderGeometry args={[0.026, 0.03, 0.07, 16]} />
              <meshStandardMaterial {...chrome} />
            </mesh>
            {/* turned partly sideways so it reads as a loop going through the card, front to back */}
            <mesh position={[0, HOOK_Y, 0]} rotation={[0, Math.PI / 2 - 0.55, 0]} scale={[1, 1.6, 1]}>
              <torusGeometry args={[HOOK_R, 0.014, 12, 40]} />
              <meshStandardMaterial {...chrome} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      {/* metal crimp on the end of the strap (placed every frame in useFrame) */}
      <RoundedBox ref={crimp} args={[0.27, 0.14, 0.05]} radius={0.018} smoothness={3}>
        <meshStandardMaterial {...chrome} />
      </RoundedBox>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          ref={bandMat}
          color="white"
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

// Converts the badge column's center into a 3D x position and keeps the band anchored there
function AnchoredBand({ anchorFrac, ...props }) {
  const viewport = useThree((st) => st.viewport)
  const x = Math.round(anchorFrac * viewport.width * 10) / 10
  // remount when the anchor moves (window resize) so the physics restarts in the right place
  return <Band key={x} anchorX={x} {...props} />
}

export default function Lanyard({ wide = false, flipped, onToggle, anchorRef, eventSourceRef }) {
  const wrap = useRef()
  const [visible, setVisible] = useState(true)
  const [anchorFrac, setAnchorFrac] = useState(0)
  const isSmall = typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches
  // phones/tablets or touch-first devices get a lighter renderer
  const lite = isSmall || (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)
  const grabRef = useRef(false)

  // On touch screens: if the finger landed on the badge, stop the page from scrolling
  // (otherwise the browser cancels the drag halfway and it feels laggy)
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const block = (e) => {
      if (grabRef.current && e.cancelable) e.preventDefault()
    }
    const release = () => {
      grabRef.current = false
    }
    el.addEventListener('touchstart', block, { passive: false })
    el.addEventListener('touchmove', block, { passive: false })
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    return () => {
      el.removeEventListener('touchstart', block)
      el.removeEventListener('touchmove', block)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
    }
  }, [])

  // Stop rendering when the badge is scrolled out of view (saves battery on phones)
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 })
    if (wrap.current) io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  // Wide mode: the canvas spans the whole hero, so hang the badge above the right column
  useEffect(() => {
    if (!wide) return
    const measure = () => {
      const c = wrap.current?.getBoundingClientRect()
      const a = anchorRef?.current?.getBoundingClientRect()
      if (!c || !a || !c.width) return
      setAnchorFrac((a.left + a.width / 2 - (c.left + c.width / 2)) / c.width)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap.current)
    if (anchorRef?.current) ro.observe(anchorRef.current)
    return () => ro.disconnect()
  }, [wide, anchorRef])

  const onHot = useCallback(
    (on) => {
      if (wide && wrap.current) wrap.current.style.pointerEvents = on ? 'auto' : 'none'
    },
    [wide]
  )

  return (
    <div className={wide ? 'lanyard lanyard-wide' : 'lanyard'} ref={wrap}>
      <Canvas
        camera={{ position: [0, 0, isSmall ? 12 : 10], fov: 25 }}
        dpr={[1, isSmall ? 1.5 : 2]}
        frameloop={visible ? 'always' : 'never'}
        gl={{ alpha: true, antialias: !lite, powerPreference: 'high-performance' }}
        // In wide mode, listen on the whole hero so the text underneath stays clickable
        eventSource={wide ? eventSourceRef : undefined}
        eventPrefix={wide ? 'client' : 'offset'}
      >
        <ambientLight intensity={Math.PI} />
        <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60} updatePriority={-1 /* move the card before the strap follows it */}>
          <AnchoredBand
            anchorFrac={wide ? anchorFrac : 0}
            flipped={flipped}
            onToggle={onToggle}
            onHot={onHot}
            grabRef={grabRef}
            lite={lite}
            trackHover={wide}
          />
        </Physics>
        <Environment blur={0.75} frames={1} resolution={lite ? 64 : 256}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="#ffc999" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}
