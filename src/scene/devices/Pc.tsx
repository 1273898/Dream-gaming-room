import { useEffect, useRef, useState } from 'react'
import type { Group } from 'three'
import { Edges } from '@react-three/drei'
import gsap from 'gsap'
import { ACCENT } from '../../data/infos'
import { SketchBox, SketchCylinder, Ring, useTheme } from '../linework'
import { useInteractive } from '../useInteractive'
import { RgbStrip } from '../RgbStrip'

const COLOR = ACCENT.pc

/** 前面板风扇：开机后原地旋转（每个风扇独立绕自身轴心） */
function CaseFan({ y, lit, spinning }: { y: number; lit: boolean; spinning: boolean }) {
  const bladesRef = useRef<Group>(null)

  useEffect(() => {
    if (!spinning || !bladesRef.current) return
    const spin = gsap.to(bladesRef.current.rotation, { z: '-=6.2832', duration: 0.9, repeat: -1, ease: 'none' })
    return () => {
      spin.kill()
    }
  }, [spinning])

  return (
    <group position={[0, y, 0.41]}>
      <Ring radius={0.11} color={lit ? COLOR : undefined} />
      <Ring radius={0.028} />
      {/* 扇叶（旋转部分） */}
      <group ref={bladesRef}>
        {[0, 1, 2, 3].map((i) => (
          <SketchBox
            key={i}
            size={[0.026, 0.16, 0.006]}
            rotation={[0, 0, (i / 4) * Math.PI + 0.45]}
            fill={lit ? COLOR : undefined}
          />
        ))}
      </group>
    </group>
  )
}

/**
 * PC 主机：立式小机箱（放在桌边地上）
 * 前面朝 +z（房间），-x 面是侧透玻璃，可看到内部硬件
 * 点击 → 开机：电源灯亮 + 风扇原地旋转 + 内部 RGB 灯条流动
 */
export function Pc() {
  const t = useTheme()
  const [powerOn, setPowerOn] = useState(false)
  const { groupRef, hovered, bind } = useInteractive('pc', () => setPowerOn((v) => !v))
  const lit = powerOn || hovered

  return (
    <group ref={groupRef} position={[4.35, 0, -2.6]} {...bind}>
      {/* 机箱框架（-x 面留给侧透玻璃） */}
      <SketchBox size={[0.42, 0.04, 0.8]} position={[0, 0.045, 0]} /> {/* 底 */}
      <SketchBox size={[0.42, 0.04, 0.8]} position={[0, 0.855, 0]} /> {/* 顶 */}
      <SketchBox size={[0.42, 0.85, 0.04]} position={[0, 0.45, 0.38]} /> {/* 前面板 */}
      <SketchBox size={[0.42, 0.85, 0.04]} position={[0, 0.45, -0.38]} /> {/* 背板 */}
      <SketchBox size={[0.04, 0.85, 0.8]} position={[0.19, 0.45, 0]} /> {/* 右侧实板 */}
      {/* 顶部出风孔 */}
      {[-0.12, 0, 0.12].map((z) => (
        <SketchBox key={z} size={[0.3, 0.005, 0.04]} position={[0, 0.878, z]} />
      ))}

      {/* 电源按钮（开机变亮） */}
      <SketchCylinder
        args={[0.03, 0.03, 0.02, 12]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0.12, 0.78, 0.41]}
        fill={lit ? COLOR : undefined}
      />
      {/* 前面板风扇 ×2 */}
      <CaseFan y={0.56} lit={lit} spinning={powerOn} />
      <CaseFan y={0.28} lit={lit} spinning={powerOn} />

      {/* 内部硬件（透过侧透玻璃可见） */}
      <group>
        {/* 主板 */}
        <SketchBox size={[0.02, 0.62, 0.6]} position={[0.13, 0.46, 0]} fill={t.dimmer} />
        {/* CPU 散热风扇（朝向玻璃） */}
        <Ring radius={0.085} position={[0.1, 0.58, -0.08]} rotation={[0, Math.PI / 2, 0]} color={lit ? COLOR : undefined} />
        <Ring radius={0.025} position={[0.095, 0.58, -0.08]} rotation={[0, Math.PI / 2, 0]} />
        {/* 显卡 */}
        <SketchBox size={[0.12, 0.07, 0.34]} position={[0.03, 0.35, 0.04]} />
        {/* 内存条 ×2 */}
        <SketchBox size={[0.03, 0.2, 0.03]} position={[0.08, 0.56, 0.15]} />
        <SketchBox size={[0.03, 0.2, 0.03]} position={[0.08, 0.56, 0.21]} />
        {/* 电源仓 */}
        <SketchBox size={[0.3, 0.14, 0.68]} position={[0.02, 0.13, 0]} />
        {/* 内部 RGB 灯条（开机流动） */}
        <RgbStrip size={[0.6, 0.03]} position={[-0.12, 0.22, 0]} rotation={[0, Math.PI / 2, 0]} active={lit} speed={0.5} />
      </group>

      {/* 侧透玻璃（-x 面，半透明） */}
      <mesh position={[-0.211, 0.45, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.72, 0.77]} />
        <meshBasicMaterial color="#aecbdb" transparent opacity={0.14} depthWrite={false} />
        <Edges threshold={20} color={t.line} />
      </mesh>
    </group>
  )
}
