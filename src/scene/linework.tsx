import { Edges, Line } from '@react-three/drei'
import type { ReactNode } from 'react'
import { useRoomStore } from '../store'

export interface Theme {
  line: string
  fill: string
  dim: string
  dimmer: string
  bg: string
}

export const DAY: Theme = {
  line: '#1a1a1a',
  fill: '#ffffff',
  dim: '#c8c8c8',
  dimmer: '#dcdcdc',
  bg: '#fafafa',
}

export const NIGHT: Theme = {
  line: '#e8e8ee',
  fill: '#26262e',
  dim: '#565660',
  dimmer: '#3c3c46',
  bg: '#121218',
}

/** 昼夜主题（组件内使用） */
export function useTheme(): Theme {
  const isNight = useRoomStore((s) => s.isNight)
  return isNight ? NIGHT : DAY
}

type V3 = [number, number, number]

interface BaseProps {
  position?: V3
  rotation?: V3
  /** 不传则跟随昼夜主题 */
  fill?: string
  edge?: string
  children?: ReactNode
}

/** 填充面 + 描边 的方块（线稿基本单元） */
export function SketchBox({ size, position, rotation, fill, edge, children }: BaseProps & { size: V3 }) {
  const t = useTheme()
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshBasicMaterial
        color={fill ?? t.fill}
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
      <Edges threshold={20} color={edge ?? t.line} />
      {children}
    </mesh>
  )
}

/** 填充面 + 描边 的圆柱 */
export function SketchCylinder({
  args,
  position,
  rotation,
  fill,
  edge,
  children,
}: BaseProps & { args: [number, number, number, number?] }) {
  const t = useTheme()
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[args[0], args[1], args[2], args[3] ?? 24]} />
      <meshBasicMaterial
        color={fill ?? t.fill}
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
      <Edges threshold={20} color={edge ?? t.line} />
      {children}
    </mesh>
  )
}

/** 填充面 + 描边 的平面 */
export function SketchPlane({ size, position, rotation, fill, edge, children }: BaseProps & { size: [number, number] }) {
  const t = useTheme()
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        color={fill ?? t.fill}
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
      <Edges threshold={20} color={edge ?? t.line} />
      {children}
    </mesh>
  )
}

/** 生成 XY 平面上的圆环点集（闭合） */
export function circlePoints(radius: number, segments = 48): V3[] {
  const pts: V3[] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push([Math.cos(a) * radius, Math.sin(a) * radius, 0])
  }
  return pts
}

/** 线稿圆环 */
export function Ring({
  radius,
  position,
  rotation,
  color,
}: {
  radius: number
  position?: V3
  rotation?: V3
  color?: string
}) {
  const t = useTheme()
  return <Line points={circlePoints(radius)} position={position} rotation={rotation} color={color ?? t.line} />
}

/** 手工折线 */
export function SketchLine({
  points,
  color,
  position,
  rotation,
}: {
  points: V3[]
  color?: string
  position?: V3
  rotation?: V3
}) {
  const t = useTheme()
  return <Line points={points} position={position} rotation={rotation} color={color ?? t.line} />
}
