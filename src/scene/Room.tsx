import { useEffect, useRef, useState } from 'react'
import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace, TextureLoader, type Group, type Mesh } from 'three'
import gsap from 'gsap'
import { SketchBox, SketchPlane, SketchLine, SketchCylinder, Ring, useTheme } from './linework'
import { useInteractive } from './useInteractive'
import { useRoomStore } from '../store'
import { ACCENT } from '../data/infos'

const WALL_H = 3.2
const FLOOR_W = 10 // x: -5 ~ 5
const FLOOR_D = 8 // z: -4 ~ 4

/** 地板缝线条 */
function FloorPlanks() {
  const t = useTheme()
  const lines: [number, number, number][][] = []
  for (let x = -FLOOR_W / 2 + 0.5; x < FLOOR_W / 2; x += 0.5) {
    lines.push([
      [x, 0.005, -FLOOR_D / 2],
      [x, 0.005, FLOOR_D / 2],
    ])
  }
  return (
    <>
      {lines.map((pts, i) => (
        <SketchLine key={i} points={pts} color={t.dimmer} />
      ))}
    </>
  )
}

/** 窗帘（点击开合，合上时完全遮住窗户；帘身在窗台前方不穿模） */
function Curtain() {
  const t = useTheme()
  const [open, setOpen] = useState(true)
  const leftRef = useRef<Group>(null)
  const rightRef = useRef<Group>(null)

  const { groupRef, bind } = useInteractive('curtain', () => setOpen((v) => !v))

  useEffect(() => {
    // 合上：两片 0.95 宽各占半边，完整覆盖 1.8 的窗；打开：收拢到两侧
    const target = open ? 0.92 : 0.475
    const scale = open ? 0.25 : 1
    if (leftRef.current) {
      gsap.to(leftRef.current.position, { x: -target, duration: 1, ease: 'power3.inOut' })
      gsap.to(leftRef.current.scale, { x: scale, duration: 1, ease: 'power3.inOut' })
    }
    if (rightRef.current) {
      gsap.to(rightRef.current.position, { x: target, duration: 1, ease: 'power3.inOut' })
      gsap.to(rightRef.current.scale, { x: scale, duration: 1, ease: 'power3.inOut' })
    }
  }, [open])

  const pleats = [-0.36, -0.18, 0, 0.18, 0.36]
  const panel = (
    <>
      {/* 帘身：高 1.44，底边悬在窗台上方 */}
      <SketchPlane size={[0.95, 1.44]} position={[0, 0.06, 0]} />
      {pleats.map((x) => (
        <SketchLine key={x} points={[[x, 0.74, 0.008], [x, -0.62, 0.008]]} color={t.dim} />
      ))}
    </>
  )
  return (
    <group ref={groupRef} {...bind}>
      {/* 窗帘杆（前移到窗帘同一深度） */}
      <SketchCylinder args={[0.02, 0.02, 2.3, 10]} rotation={[0, 0, Math.PI / 2]} position={[0, 0.86, 0.18]} />
      {/* 左帘（z=0.18 在窗台前沿之外） */}
      <group ref={leftRef} position={[-0.92, 0, 0.18]} scale={[0.25, 1, 1]}>
        {panel}
      </group>
      {/* 右帘 */}
      <group ref={rightRef} position={[0.92, 0, 0.18]} scale={[0.25, 1, 1]}>
        {panel}
      </group>
    </group>
  )
}

/** 窗户 + 窗外昼夜景色 + 窗帘 */
function WindowFrame() {
  const t = useTheme()
  const isNight = useRoomStore((s) => s.isNight)
  const coastTextures = useLoader(TextureLoader, ['/window-view/coast-day.png', '/window-view/coast-night.png'])
  coastTextures.forEach((texture) => {
    texture.colorSpace = SRGBColorSpace
  })
  const coastTexture = coastTextures[isNight ? 1 : 0]
  const x = -FLOOR_W / 2 + 0.06

  return (
    <group position={[x, 1.9, -2.4]} rotation={[0, Math.PI / 2, 0]}>
      {/* 窗外昼夜海岸贴图 */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[1.8, 1.3]} />
        <meshBasicMaterial map={coastTexture} />
      </mesh>
      {/* 窗框十字 */}
      <SketchLine points={[[-0.9, 0, 0.01], [0.9, 0, 0.01]]} color={t.line} />
      <SketchLine points={[[0, -0.65, 0.01], [0, 0.65, 0.01]]} color={t.line} />
      {/* 窗台 */}
      <SketchBox size={[2.0, 0.06, 0.16]} position={[0, -0.71, 0.05]} />
      <Curtain />
    </group>
  )
}

/** 墙上电灯开关（点击切换昼夜） */
function WallSwitch() {
  const leverRef = useRef<Mesh>(null)
  const toggleNight = useRoomStore((s) => s.toggleNight)
  const { groupRef, bind } = useInteractive('switch', () => toggleNight())

  useEffect(() => {
    const unsub = useRoomStore.subscribe((s) => {
      if (leverRef.current) {
        gsap.to(leverRef.current.rotation, { z: s.isNight ? -0.5 : 0.5, duration: 0.25, ease: 'power2.out' })
      }
    })
    return unsub
  }, [])

  return (
    <group ref={groupRef} position={[-FLOOR_W / 2 + 0.07, 1.25, 2.9]} rotation={[0, Math.PI / 2, 0]} {...bind}>
      <SketchBox size={[0.16, 0.24, 0.04]} />
      {/* 隐形代理点击盒（开关太小，扩大可点区域） */}
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[0.7, 0.9, 0.3]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      <mesh ref={leverRef} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.03, 0.1, 0.03]} />
        <meshBasicMaterial color={ACCENT.lamp} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
    </group>
  )
}

/** 踢脚线 */
function Baseboards() {
  return (
    <>
      <SketchBox size={[FLOOR_W, 0.12, 0.03]} position={[0, 0.06, -FLOOR_D / 2 + 0.06]} />
      <SketchBox size={[0.03, 0.12, FLOOR_D]} position={[-FLOOR_W / 2 + 0.06, 0.06, 0]} />
    </>
  )
}

/** 房间外壳：地板 + 后墙 + 左墙（右侧开放） */
export function Room() {
  return (
    <group>
      <SketchPlane size={[FLOOR_W, FLOOR_D]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} />
      <FloorPlanks />

      {/* 后墙 */}
      <SketchBox size={[FLOOR_W, WALL_H, 0.1]} position={[0, WALL_H / 2, -FLOOR_D / 2 - 0.05]} />
      {/* 左墙 */}
      <SketchBox size={[0.1, WALL_H, FLOOR_D]} position={[-FLOOR_W / 2 - 0.05, WALL_H / 2, 0]} />

      <Baseboards />
      <WindowFrame />
      <WallSwitch />
    </group>
  )
}
