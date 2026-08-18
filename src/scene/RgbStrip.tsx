import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, RepeatWrapping } from 'three'
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
      {active ? (
        <meshBasicMaterial map={texture} toneMapped={false} />
      ) : (
        <meshBasicMaterial color={t.dimmer} />
      )}
      <Edges threshold={20} color={t.line} />
    </mesh>
  )
}
