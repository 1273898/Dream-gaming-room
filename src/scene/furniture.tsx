import { useEffect, useMemo, useRef, useState } from 'react'
import { Edges } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { AdditiveBlending, SRGBColorSpace, TextureLoader, type Group } from 'three'
import gsap from 'gsap'
import { SketchBox, SketchCylinder, SketchLine, Ring, useTheme } from './linework'
import { useInteractive } from './useInteractive'
import { RgbStrip } from './RgbStrip'
import { ACCENT } from '../data/infos'
import { NOVEL_COVERS } from '../data/novels'
import { useStereoPlayer } from '../audio/useStereoPlayer'
import { useRoomStore } from '../store'

/** 机械键盘：键帽阵列 + 键帽下 RGB 透光层，点击切换流动 RGB */
function Keyboard() {
  const t = useTheme()
  const isNight = useRoomStore((state) => state.isNight)
  const [rgbOn, setRgbOn] = useState(false)
  const { groupRef, bind } = useInteractive(() => setRgbOn((v) => !v))

  // 键帽网格：14 列 x 4 行，底行为空格键
  const keys = useMemo(() => {
    const out: { x: number; z: number; w: number }[] = []
    const step = 0.058
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 14; c++) {
        if (r === 3 && c >= 4 && c < 10) continue // 底行中间留给空格键
        if (r === 0 && c >= 13) continue
        out.push({ x: -0.4 + c * step + 0.025, z: -0.115 + r * step + 0.025, w: 0.052 })
      }
    }
    out.push({ x: 0.025, z: 0.084, w: 0.34 }) // 空格键
    return out
  }, [])

  return (
    <group ref={groupRef} position={[-0.45, 0.81, 0.15]} {...bind}>
      {/* 夜间为键盘 RGB 提供明显更强的环境光晕。 */}
      <pointLight color="#e879f9" intensity={isNight ? 8 : 0.5} distance={1.6} decay={2} />
      {/* 底座 */}
      <SketchBox size={[0.92, 0.05, 0.36]} />
      {/* 键帽下方 RGB 透光层（水平，紧贴底座顶面） */}
      <RgbStrip
        size={[0.88, 0.32]}
        position={[0, 0.028, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        active={rgbOn}
        speed={0.5}
      />
      {/* 加色层直接强化灯带本身，夜晚而非仅周围物体会显著更亮。 */}
      <mesh visible={rgbOn} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.88, 0.32]} />
        <meshBasicMaterial color="#ffffff" transparent blending={AdditiveBlending} opacity={isNight ? 0.9 : 0.15} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* 键帽（RGB 点亮时键帽转深色，缝隙透出彩光） */}
      {keys.map((k, i) => (
        <SketchBox key={i} size={[k.w, 0.035, 0.052]} position={[k.x, 0.058, k.z]} fill={rgbOn ? '#14141b' : undefined} />
      ))}
      {/* 底座四周边缘 RGB 灯带（夜晚形成发光轮廓） */}
      <RgbStrip size={[0.92, 0.04]} position={[0, 0.02, 0.185]} active={rgbOn} speed={0.5} />
      <RgbStrip size={[0.92, 0.04]} position={[0, 0.02, -0.185]} rotation={[0, Math.PI, 0]} active={rgbOn} speed={0.5} />
      <RgbStrip size={[0.36, 0.04]} position={[0.46, 0.02, 0]} rotation={[0, Math.PI / 2, 0]} active={rgbOn} speed={0.5} />
      <RgbStrip size={[0.36, 0.04]} position={[-0.46, 0.02, 0]} rotation={[0, -Math.PI / 2, 0]} active={rgbOn} speed={0.5} />
    </group>
  )
}

/** 无线游戏鼠标：对称双键壳 + 滚轮凹槽，点击亮灯并按压回弹 */
function Mouse() {
  const t = useTheme()
  const [ledOn, setLedOn] = useState(false)
  const { groupRef, bind } = useInteractive(() => {
    setLedOn((v) => !v)
    if (!groupRef.current) return
    // 按压回弹
    gsap.fromTo(
      groupRef.current.scale,
      { x: 1, y: 0.75, z: 1 },
      { x: 1, y: 1, z: 1, duration: 0.5, ease: 'elastic.out(2, 0.4)' },
    )
  })

  return (
    <group ref={groupRef} position={[0.75, 0.81, 0.15]} {...bind}>
      {/* 仅放大视觉子组，交互组保持 1:1 以保留无线鼠标的悬停和按压动画。 */}
      <group scale={[2, 2, 2]}>
        {/* 对称的低矮拱形底壳 */}
        <mesh position={[0, 0.018, 0.004]} scale={[0.78, 0.43, 1.18]}>
          <sphereGeometry args={[0.1, 24, 16]} />
          <meshBasicMaterial color={t.fill} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        </mesh>
        {/* 左键外壳 */}
        <mesh position={[-0.037, 0.058, -0.052]} scale={[0.34, 0.17, 0.56]}>
          <sphereGeometry args={[0.1, 20, 12]} />
          <meshBasicMaterial color={t.fill} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        </mesh>
        {/* 右键外壳 */}
        <mesh position={[0.037, 0.058, -0.052]} scale={[0.34, 0.17, 0.56]}>
          <sphereGeometry args={[0.1, 20, 12]} />
          <meshBasicMaterial color={t.fill} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        </mesh>
        {/* 两枚按键之间的中央滚轮凹槽 */}
        <SketchBox size={[0.042, 0.018, 0.096]} position={[0, 0.072, -0.048]} fill={t.dimmer} />
        {/* 滚轮（点击亮灯） */}
        <SketchCylinder
          args={[0.016, 0.016, 0.032, 12]}
          rotation={[0, 0, Math.PI / 2]}
          position={[0, 0.086, -0.052]}
          fill={ledOn ? ACCENT.mouse : undefined}
        />
        {/* 左侧侧键：前进与后退 */}
        <SketchBox size={[0.014, 0.024, 0.034]} position={[-0.082, 0.039, -0.018]} fill={t.dimmer} />
        <SketchBox size={[0.014, 0.024, 0.034]} position={[-0.082, 0.039, 0.032]} fill={t.dimmer} />
        {/* 尾部 RGB 灯带 */}
        <RgbStrip size={[0.11, 0.018]} position={[0, 0.07, 0.086]} rotation={[-Math.PI / 2, 0, 0]} active={ledOn} speed={0.55} />
        {/* 底部脚贴 */}
        <SketchBox size={[0.07, 0.008, 0.026]} position={[0, -0.019, -0.064]} fill={t.dimmer} />
        <SketchBox size={[0.07, 0.008, 0.026]} position={[0, -0.019, 0.075]} fill={t.dimmer} />
      </group>
    </group>
  )
}

/** 桌面音响 */
function Speaker({ x }: { x: number }) {
  const toggle = useStereoPlayer((state) => state.toggle)
  const { groupRef, bind } = useInteractive(() => {
    toggle()
    if (!groupRef.current) return
    // 低音震动一下
    gsap.fromTo(
      groupRef.current.scale,
      { x: 1.12, y: 1.12, z: 1.12 },
      { x: 1, y: 1, z: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.3)' },
    )
  })

  return (
    <group ref={groupRef} position={[x, 0.92, -0.35]} {...bind}>
      <SketchBox size={[0.16, 0.28, 0.18]} />
      <Ring radius={0.055} position={[0, 0.06, 0.095]} />
      <Ring radius={0.03} position={[0, -0.06, 0.095]} />
    </group>
  )
}

/** 电竞桌（含键盘、鼠标、音响、桌后 RGB 灯条） */
export function Desk() {
  return (
    <group position={[2.2, 0, -3.2]}>
      <SketchBox size={[3, 0.08, 1.2]} position={[0, 0.75, 0]} />
      {[-1.4, 1.4].map((x) =>
        [-0.5, 0.5].map((z) => (
          <SketchBox key={`${x}${z}`} size={[0.07, 0.75, 0.07]} position={[x, 0.375, z]} />
        )),
      )}
      <Keyboard />
      <Mouse />
      {/* 左右音响 */}
      <Speaker x={-1.2} />
      <Speaker x={1.2} />
      {/* 桌后 RGB 灯条（贴墙，常亮流动） */}
      <RgbStrip size={[3, 0.05]} position={[0, 1.0, -0.68]} active speed={0.25} />
    </group>
  )
}

/** 电竞椅：气压杆清晰可见，点击转一圈 */
export function Chair() {
  const { groupRef, bind } = useInteractive(() => {
    if (!groupRef.current) return
    gsap.to(groupRef.current.rotation, { y: '+=6.2832', duration: 1.1, ease: 'power2.inOut' })
  })

  return (
    <group ref={groupRef} position={[2.2, 0, -1.75]} {...bind}>
      {/* 坐垫 */}
      <SketchBox size={[0.62, 0.1, 0.58]} position={[0, 0.52, 0]} />
      {/* 靠背 */}
      <SketchBox size={[0.58, 0.85, 0.09]} position={[0, 1.0, 0.3]} rotation={[0.1, 0, 0]} />
      {/* 气压杆（加粗加深描边，保证可见） */}
      <SketchCylinder args={[0.05, 0.05, 0.42, 12]} position={[0, 0.26, 0]} />
      <SketchCylinder args={[0.07, 0.07, 0.08, 12]} position={[0, 0.45, 0]} />
      {/* 五星脚 */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <SketchBox
            key={i}
            size={[0.36, 0.04, 0.06]}
            position={[Math.cos(a) * 0.18, 0.03, Math.sin(a) * 0.18]}
            rotation={[0, -a, 0]}
          />
        )
      })}
    </group>
  )
}

/** 主机区置物架（电视下方） */
export function TvShelf() {
  return (
    <group position={[-2.2, 0, -3.65]}>
      <SketchBox size={[2.6, 0.06, 0.55]} position={[0, 0.42, 0]} />
      <SketchBox size={[2.6, 0.06, 0.55]} position={[0, 0.82, 0]} />
      <SketchBox size={[0.06, 0.82, 0.55]} position={[-1.27, 0.41, 0]} />
      <SketchBox size={[0.06, 0.82, 0.55]} position={[1.27, 0.41, 0]} />
      {/* 层板上的游戏盒 */}
      {[-0.9, -0.72, -0.54, -0.36, 0.62, 0.8].map((x, i) => (
        <SketchBox key={i} size={[0.14, 0.34, 0.4]} position={[x, 0.62, 0]} />
      ))}
    </group>
  )
}

/** 地毯 */
export function Rug() {
  const t = useTheme()
  return (
    <group position={[-2.2, 0.006, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
      {[1.5, 1.15, 0.8, 0.45].map((r) => (
        <Ring key={r} radius={r} color={t.dim} />
      ))}
      <SketchLine
        points={[
          [0, 1.5, 0],
          [1.06, 0, 0],
          [0, -1.5, 0],
          [-1.06, 0, 0],
          [0, 1.5, 0],
        ]}
        color={t.dim}
      />
    </group>
  )
}

/** 小沙发（正对电视，点击弹跳） */
export function Sofa() {
  const { groupRef, bind } = useInteractive(() => {
    if (!groupRef.current) return
    gsap.fromTo(
      groupRef.current.scale,
      { x: 1.08, y: 0.85, z: 1.08 },
      { x: 1, y: 1, z: 1, duration: 0.8, ease: 'elastic.out(1.4, 0.3)' },
    )
  })

  return (
    <group ref={groupRef} position={[-2.2, 0, -1.2]} {...bind}>
      {/* 坐垫（面朝 -z 的电视） */}
      <SketchBox size={[1.5, 0.28, 0.7]} position={[0, 0.32, 0]} />
      {/* 靠背（在 +z 一侧） */}
      <SketchBox size={[1.5, 0.5, 0.18]} position={[0, 0.68, 0.32]} rotation={[0.12, 0, 0]} />
      {/* 扶手 */}
      <SketchBox size={[0.18, 0.3, 0.7]} position={[-0.84, 0.55, 0]} />
      <SketchBox size={[0.18, 0.3, 0.7]} position={[0.84, 0.55, 0]} />
      {/* 沙发腿 */}
      {[-0.65, 0.65].map((x) =>
        [-0.25, 0.25].map((z) => (
          <SketchCylinder key={`${x}${z}`} args={[0.03, 0.03, 0.18, 8]} position={[x, 0.09, z]} />
        )),
      )}
      {/* 抱枕 */}
      <SketchBox size={[0.32, 0.32, 0.12]} position={[-0.45, 0.6, 0.22]} rotation={[0.2, 0, 0.3]} />
    </group>
  )
}

/** 轻小说/漫画书脊（细长高本 = 漫画，矮厚 = 轻小说，少量彩脊点缀） */
function BookRow({ y, seed }: { y: number; seed: number }) {
  const colored = [ACCENT.book, '#7cc4ff', '#fbbf24']
  const books: { z: number; h: number; w: number; c?: string }[] = []
  let z = -0.48
  let i = 0
  while (z < 0.42) {
    const w = 0.05 + ((seed * 7 + i * 13) % 4) * 0.012
    const h = 0.3 + ((seed * 3 + i * 7) % 3) * 0.03
    books.push({ z, h, w, c: (seed + i) % 5 === 0 ? colored[(seed + i) % 3] : undefined })
    z += w + 0.015
    i++
  }
  return (
    <group>
      {books.map((b, i) => (
        <SketchBox key={i} size={[0.26, b.h, b.w]} position={[0, y + b.h / 2, b.z]} fill={b.c} />
      ))}
    </group>
  )
}

/** 书架：摆满轻小说和漫画，点击浮出随机封面 */
export function Bookshelf() {
  const textures = useLoader(TextureLoader, NOVEL_COVERS)
  const [selectedCover, setSelectedCover] = useState<number | null>(null)
  const [isReturning, setIsReturning] = useState(false)
  const coverRef = useRef<Group>(null)
  const { groupRef, bind } = useInteractive(() => {
    if (isReturning) return

    if (selectedCover === null) {
      setSelectedCover(Math.floor(Math.random() * NOVEL_COVERS.length))
      return
    }

    if (!coverRef.current) return
    setIsReturning(true)
    gsap.to(coverRef.current.position, {
      x: 0.12,
      y: 1.08,
      z: 0,
      duration: 0.45,
      ease: 'power3.in',
      onComplete: () => {
        setSelectedCover(null)
        setIsReturning(false)
      },
    })
  })

  useEffect(() => {
    if (selectedCover === null || isReturning || !coverRef.current) return
    const texture = textures[selectedCover]
    texture.colorSpace = SRGBColorSpace
    gsap.fromTo(
      coverRef.current.position,
      { x: 0.12, y: 1.08, z: 0 },
      {
      x: 0.52,
      y: 1.62,
      z: 0,
      duration: 0.6,
      ease: 'power3.out',
      },
    )
  }, [isReturning, selectedCover, textures])

  return (
    <group ref={groupRef} position={[-4.75, 0, -0.6]} {...bind}>
      {/* 外框 */}
      <SketchBox size={[0.06, 2.2, 0.5]} position={[0, 1.1, -0.55]} />
      <SketchBox size={[0.06, 2.2, 0.5]} position={[0, 1.1, 0.55]} />
      <SketchBox size={[0.4, 0.06, 1.16]} position={[0, 2.17, 0]} />
      <SketchBox size={[0.4, 0.06, 1.16]} position={[0, 0.03, 0]} />
      {[0.75, 1.45].map((y) => (
        <SketchBox key={y} size={[0.4, 0.05, 1.1]} position={[0, y, 0]} />
      ))}
      {/* 三层书 */}
      <BookRow y={0.06} seed={1} />
      <BookRow y={0.78} seed={4} />
      <BookRow y={1.48} seed={8} />
      {selectedCover !== null && (
        <group ref={coverRef} position={[0.12, 1.08, 0]} rotation={[0, 0, 0]}>
          {/* 书身：厚 0.06 沿 +x（书脊方向）、高 0.66 沿 y、宽 0.44 沿 z（封面/封底方向），
              这样从房间内部 +x 看，封面（高 0.66 × 宽 0.44）正对观众。 */}
          <mesh>
            <boxGeometry args={[0.06, 0.66, 0.44]} />
            <meshBasicMaterial color="#f3efe6" toneMapped={false} />
            <Edges threshold={20} />
          </mesh>
          {/* 封面贴在书身 +x 面，绕 Y 旋转 90° 让 plane 法线从 +z 转到 +x，宽 0.44 沿 z、高 0.66 沿 y，正对房间内部。 */}
          <mesh position={[0.031, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.44, 0.66]} />
            <meshBasicMaterial map={textures[selectedCover]} toneMapped={false} />
          </mesh>
        </group>
      )}
      {/* 顶层横放的一摞 */}
      <SketchBox size={[0.3, 0.05, 0.24]} position={[0, 2.23, -0.2]} />
      <SketchBox size={[0.3, 0.05, 0.24]} position={[0, 2.28, -0.18]} />
      <SketchBox size={[0.3, 0.05, 0.24]} position={[0, 2.33, -0.22]} />
    </group>
  )
}

/** 盆栽 */
export function Plant() {
  const leaf = (a: number, len: number): [number, number, number][] => {
    const pts: [number, number, number][] = []
    for (let i = 0; i <= 8; i++) {
      const t = i / 8
      pts.push([Math.cos(a) * t * 0.28, 0.42 + t * len - t * t * 0.15, Math.sin(a) * t * 0.28])
    }
    return pts
  }
  return (
    <group position={[-4.3, 0, -3.3]}>
      <SketchCylinder args={[0.16, 0.12, 0.3, 16]} position={[0, 0.15, 0]} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <SketchLine key={i} points={leaf((i / 6) * Math.PI * 2, 0.55 + (i % 3) * 0.12)} />
      ))}
    </group>
  )
}

/** 易拉罐（罐装饮料）：罐身 + 顶部拉环 */
function Can({ position, fill }: { position: [number, number, number]; fill: string }) {
  const t = useTheme()
  return (
    <group position={position}>
      <SketchCylinder args={[0.028, 0.028, 0.046, 12]} fill={fill} />
      {/* 顶部拉环 */}
      <Ring radius={0.011} position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} color={t.line} />
    </group>
  )
}

/** 冰箱：靠后墙的立式冰箱，门朝房间内部（+z），打开后展示两层罐装饮料 */
export function Fridge() {
  const [open, setOpen] = useState(false)
  const doorRef = useRef<Group>(null)
  const { groupRef, bind } = useInteractive(() => setOpen((v) => !v))

  useEffect(() => {
    if (!doorRef.current) return
    // 门绕右端竖向铰链（Y 轴）向房间内部(+z)朝外打开 +1.3 rad（约 75°），右缘固定、左缘向外甩出，露出正面所有饮料
    gsap.to(doorRef.current.rotation, { x: 0, y: open ? 1.3 : 0, z: 0, duration: 0.85, ease: 'power3.inOut' })
  }, [open])

  return (
    // 位置：x=0.35，背靠后墙（z=-4.05），柜深 0.52，中心 z=-3.79 使背面贴合墙面。
    <group ref={groupRef} position={[0.35, 0, -3.79]} {...bind}>
      {/* 支脚 */}
      {[-0.2, 0.2].map((z) => (
        <SketchBox key={z} size={[0.41, 0.019, 0.036]} position={[0, 0.01, z]} />
      ))}
      {/* 箱体外壳：5 面（无 +z 前面板），由门板在关闭时覆盖正面 */}
      <SketchBox size={[0.66, 0.023, 0.52]} position={[0, 0, 0]} />
      <SketchBox size={[0.66, 0.38, 0.023]} position={[0, 0.19, -0.26]} />
      <SketchBox size={[0.023, 0.38, 0.52]} position={[-0.33, 0.19, 0]} />
      <SketchBox size={[0.023, 0.38, 0.52]} position={[0.33, 0.19, 0]} />
      {/* 顶部压缩机罩（跨在柜体顶面，略宽） */}
      <SketchBox size={[0.678, 0.023, 0.533]} position={[0, 0.392, 0]} />
      {/* 内部隔层（前后贯通，门开时直接可见饮料） */}
      <SketchBox size={[0.55, 0.011, 0.45]} position={[0, 0.125, 0]} />
      <SketchBox size={[0.55, 0.011, 0.45]} position={[0, 0.25, 0]} />
      {/* 罐装饮料：下/上两层，朝门（+z）摆放便于开启时可见 */}
      <Can position={[-0.12, 0.07, 0.05]} fill="#ef4444" />
      <Can position={[0.02, 0.07, 0.12]} fill="#3b82f6" />
      <Can position={[-0.04, 0.07, -0.02]} fill="#22c55e" />
      <Can position={[-0.11, 0.19, 0.11]} fill="#f59e0b" />
      <Can position={[0.04, 0.19, 0.01]} fill="#a855f7" />
      <Can position={[0.1, 0.19, 0.12]} fill="#f43f5e" />
      {/* 密封不透明门板：正面朝世界 +z，竖向铰链在柜体右前角（x=0.33），开门时右缘固定、左缘向房间内部(+z)朝外甩开。 */}
      <group ref={doorRef} position={[0.33, 0.38, 0.26]} name="fridgeDoor">
        <SketchBox size={[0.66, 0.38, 0.045]} position={[-0.33, -0.19, 0]} />
        <SketchBox size={[0.021, 0.1, 0.02]} position={[-0.53, -0.35, 0.03]} />
      </group>
    </group>
  )
}

/** 薯片桶：桶身 + 盖子 + 波浪薯片图案 */
function ChipTube({ position, color }: { position: [number, number, number]; color: string }) {
  const t = useTheme()
  return (
    <group position={position}>
      <SketchCylinder args={[0.033, 0.033, 0.098, 14]} fill={color} />
      {/* 顶部银色封盖 */}
      <SketchCylinder args={[0.034, 0.034, 0.012, 14]} position={[0, 0.053, 0]} fill={t.dimmer} />
      {/* 薯片波浪图案 */}
      <SketchLine
        points={[
          [-0.02, 0.021, 0.033],
          [-0.01, 0.018, 0.033],
          [0, 0.023, 0.033],
          [0.01, 0.018, 0.033],
          [0.02, 0.021, 0.033],
        ]}
      />
      {/* 底部装饰线 */}
      <SketchLine points={[[-0.024, -0.021, 0.033], [0.024, -0.021, 0.033]]} />
    </group>
  )
}

/** 薯片袋：扁袋 + 顶部锯齿 + 品牌线 */
function ChipBag({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <SketchBox size={[0.059, 0.09, 0.018]} fill="#f97316" />
      {/* 袋顶锯齿封口 */}
      <SketchLine
        points={[
          [-0.026, 0.051, 0.01],
          [-0.013, 0.046, 0.01],
          [0, 0.051, 0.01],
          [0.013, 0.046, 0.01],
          [0.026, 0.051, 0.01],
        ]}
      />
      {/* 中间品牌横线 */}
      <SketchLine points={[[-0.023, 0.008, 0.01], [0.023, 0.008, 0.01]]} />
    </group>
  )
}

/** 零食柜：靠后墙的三层抽屉柜，点击后抽屉向房间内部（+z）拉出，露出薯片与零食 */
export function SnackCabinet() {
  const [open, setOpen] = useState(false)
  const drawerRefs = useRef<(Group | null)[]>([])
  const { groupRef, bind } = useInteractive(() => {
    setOpen((value) => !value)
  })

  useEffect(() => {
    drawerRefs.current.forEach((ref) => {
      if (!ref) return
      gsap.to(ref.position, { z: open ? 0.2 : 0, duration: 0.7, ease: 'power3.out' })
    })
  }, [open])

  // 三层抽屉的纵向中心（外框高 0.41）
  const layerY = [0.075, 0.205, 0.335]

  return (
    // 位置：x=0.35，叠于冰箱上方，背靠后墙（z=-4.05），柜深 0.52，中心 z=-3.79。
    <group ref={groupRef} position={[0.35, 0.445, -3.79]} {...bind}>
      {/* 外框 */}
      <SketchBox size={[0.033, 0.41, 0.52]} position={[-0.3135, 0.205, 0]} />
      <SketchBox size={[0.033, 0.41, 0.52]} position={[0.3135, 0.205, 0]} />
      <SketchBox size={[0.66, 0.021, 0.52]} position={[0, 0.3995, 0]} />
      <SketchBox size={[0.66, 0.025, 0.52]} position={[0, 0.0125, 0]} />
      {/* 背板（靠 -z 墙侧） */}
      <SketchBox size={[0.6, 0.41, 0.013]} position={[0, 0.205, -0.2535]} />
      {/* 三层抽屉：点击后整体向 +z 拉出 */}
      {layerY.map((y, i) => (
        <group
          key={i}
          position={[0, y, 0]}
          ref={(el) => {
            drawerRefs.current[i] = el
          }}
        >
          {/* 抽屉侧板 / 底板 / 后面板 */}
          <SketchBox size={[0.012, 0.1, 0.42]} position={[-0.29, 0, 0.05]} />
          <SketchBox size={[0.012, 0.1, 0.42]} position={[0.29, 0, 0.05]} />
          <SketchBox size={[0.56, 0.012, 0.42]} position={[0, -0.048, 0.05]} />
          <SketchBox size={[0.56, 0.1, 0.013]} position={[0, 0, -0.18]} />
          {/* 抽屉前面板 */}
          <SketchBox size={[0.58, 0.105, 0.02]} position={[0, 0, 0.235]} />
          <SketchBox size={[0.03, 0.014, 0.008]} position={[0, 0, 0.272]} />
          {/* 各层内容物（随抽屉移动）：全部落在抽屉底板(y=-0.048)上，高度不超出抽屉前面板上沿(y≈0.0525)，避免与上层抽屉穿模 */}
          {i === 0 && (
            <>
              <ChipTube position={[-0.16, 0.001, 0.04]} color="#f59e0b" />
              <ChipTube position={[0.02, 0.001, 0.08]} color="#ef4444" />
              <ChipBag position={[0.19, -0.003, 0.01]} rotation={[0, 0.3, 0]} />
            </>
          )}
          {i === 1 && (
            <>
              <ChipBag position={[-0.16, -0.003, 0.08]} rotation={[0, -0.2, 0]} />
              <ChipBag position={[0.02, -0.003, -0.01]} rotation={[0, 0.25, 0]} />
              <SketchCylinder args={[0.028, 0.028, 0.082, 12]} position={[0.2, -0.007, 0.05]} fill="#a855f7" />
            </>
          )}
          {i === 2 && (
            <>
              <SketchBox size={[0.092, 0.041, 0.073]} position={[-0.15, -0.027, 0.06]} fill="#22c55e" />
              <SketchBox size={[0.106, 0.049, 0.052]} position={[0.02, -0.023, 0.01]} fill="#f43f5e" />
              <SketchBox size={[0.079, 0.066, 0.062]} position={[0.19, -0.015, 0.08]} fill="#0ea5e9" />
            </>
          )}
        </group>
      ))}
    </group>
  )
}

/** 全部家具 */
export function Furniture() {
  return (
    <group>
      <Desk />
      <Chair />
      <TvShelf />
      <Rug />
      <Sofa />
      <Bookshelf />
      <Plant />
      <Fridge />
      <SnackCabinet />
    </group>
  )
}
