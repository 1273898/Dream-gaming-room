import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, DoubleSide, RepeatWrapping } from 'three'
import { Edges } from '@react-three/drei'
import { useTheme } from './linework'

type V3 = [number, number, number]

/**
 * 流动 RGB 灯条：Canvas 渐变纹理 + 偏移滚动
 * active=false 时熄灭为暗色
 */
export function RgbStrip({
  size,
  position,
  rotation,
  active = true,
  speed = 0.12,
}: {
  size: [number, number]
  position?: V3
  rotation?: V3
  active?: boolean
  speed?: number
}) {
  const t = useTheme()
  const activeRef = useRef(active)
  activeRef.current = active

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 8
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createLinearGradient(0, 0, 128, 0)
    for (let i = 0; i <= 6; i++) {
      gradient.addColorStop(i / 6, `hsl(${i * 60}, 90%, 55%)`)
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 8)
    const tex = new CanvasTexture(canvas)
    tex.wrapS = RepeatWrapping
    return tex
  }, [])

  useFrame((_, delta) => {
    if (activeRef.current) texture.offset.x -= delta * speed
  })

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      {/* key 强制重建材质，避免切换时 dimmer 色残留在带贴图的材质上（彩色被乘黑） */}
      {active ? (
        <meshBasicMaterial key="on" map={texture} toneMapped={false} />
      ) : (
        <meshBasicMaterial key="off" color={t.dimmer} />
      )}
      <Edges threshold={20} color={t.line} />
    </mesh>
  )
}

/** 彩虹渐变纹理（两个组件共用） */
function useRainbowTexture(speed: number, active: boolean) {
  const activeRef = useRef(active)
  activeRef.current = active

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 8
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createLinearGradient(0, 0, 128, 0)
    for (let i = 0; i <= 6; i++) {
      gradient.addColorStop(i / 6, `hsl(${i * 60}, 90%, 55%)`)
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 8)
    const tex = new CanvasTexture(canvas)
    tex.wrapS = RepeatWrapping
    return tex
  }, [])

  useFrame((_, delta) => {
    if (activeRef.current) texture.offset.x -= delta * speed
  })

  return texture
}

/**
 * 环绕椭圆侧缘的流动 RGB 灯带：开口圆柱侧面 + 彩虹纹理环绕滚动
 * 与椭圆底座贴合，成为底座的一部分
 */
export function RgbRingStrip({
  scale,
  height = 0.014,
  position,
  active = true,
  speed = 0.12,
}: {
  /** 椭圆半径缩放 [rx, 1, rz] */
  scale: [number, number, number]
  height?: number
  position?: V3
  active?: boolean
  speed?: number
}) {
  const t = useTheme()
  const texture = useRainbowTexture(speed, active)

  return (
    <mesh position={position} scale={scale}>
      <cylinderGeometry args={[1, 1, height, 48, 1, true]} />
      {/* key 强制重建材质，避免切换时 dimmer 色残留在带贴图的材质上（彩色被乘黑） */}
      {active ? (
        <meshBasicMaterial key="on" map={texture} toneMapped={false} side={DoubleSide} />
      ) : (
        <meshBasicMaterial key="off" color={t.dimmer} side={DoubleSide} />
      )}
    </mesh>
  )
}
