import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

const CARD_W = 1.6
const CARD_H = 2.25

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

function Band({ maxSpeed = 50, minSpeed = 10, flipped = false, onToggle, anchorX = 0, onHot }) {
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
  const press = useRef(null) // where/when the pointer went down, to tell a click from a drag

  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 2, linearDamping: 2 }
  const { width, height } = useThree((s) => s.size)
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  )
  curve.curveType = 'chordal'
  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)

  const front = useCanvasTexture(CARD_PX.w, CARD_PX.h, drawFront)
  const back = useCanvasTexture(CARD_PX.w, CARD_PX.h, drawBack)
  const bandTex = useCanvasTexture(512, 128, drawBand)
  bandTex.wrapS = bandTex.wrapT = THREE.RepeatWrapping

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]])

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
    state.events.update?.()
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
      // Turn the card to face the screen (front), or its back when flipped
      ang.copy(card.current.angvel())
      const q = card.current.rotation()
      const yaw = 2 * Math.atan2(q.y, q.w)
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
            onPointerDown={(e) => {
              press.current = { x: e.clientX, y: e.clientY, t: performance.now() }
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
              {/* unlit so the print keeps its true colors and stays readable */}
              <meshBasicMaterial map={front} toneMapped={false} />
            </mesh>
            {/* back print */}
            <mesh position={[0, 0, -0.0155]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
              <meshBasicMaterial map={back} toneMapped={false} />
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
        gl={{ alpha: true, antialias: true }}
        // In wide mode, listen on the whole hero so the text underneath stays clickable
        eventSource={wide ? eventSourceRef : undefined}
        eventPrefix={wide ? 'client' : 'offset'}
      >
        <ambientLight intensity={Math.PI} />
        <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
          <AnchoredBand anchorFrac={wide ? anchorFrac : 0} flipped={flipped} onToggle={onToggle} onHot={onHot} />
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
