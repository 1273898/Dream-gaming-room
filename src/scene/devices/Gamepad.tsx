import { ACCENT } from '../../data/infos'
import { SketchBox, SketchCylinder } from '../linework'
import { useInteractive } from '../useInteractive'
import gsap from 'gsap'

const COLOR = ACCENT.gamepad

/** 手柄：点击后悬浮旋转一圈再落回 */
export function Gamepad() {
  const { groupRef, hovered, bind } = useInteractive(() => {
    const g = groupRef.current
    if (!g) return
    gsap.killTweensOf([g.position, g.rotation])
    const tl = gsap.timeline()
    tl.to(g.position, { y: '+=0.35', duration: 0.5, ease: 'power2.out' })
      .to(g.rotation, { y: '+=6.2832', duration: 1.4, ease: 'power1.inOut' }, '<')
      .to(g.position, { y: '-=0.35', duration: 0.5, ease: 'bounce.out' })
  })

  return (
    <group ref={groupRef} position={[-1.35, 0.95, -3.55]} rotation={[0, 0.3, 0]} {...bind}>
      {/* 隐形代理点击盒 */}
      <mesh>
        <boxGeometry args={[0.9, 0.7, 0.9]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* 主体 */}
      <SketchBox size={[0.42, 0.09, 0.24]} edge={hovered ? COLOR : undefined} />
      {/* 握把 */}
      <SketchCylinder args={[0.05, 0.06, 0.2, 12]} position={[-0.19, -0.08, 0.06]} rotation={[0.5, 0, 0.4]} />
      <SketchCylinder args={[0.05, 0.06, 0.2, 12]} position={[0.19, -0.08, 0.06]} rotation={[0.5, 0, -0.4]} />
      {/* 摇杆 */}
      <SketchCylinder args={[0.035, 0.035, 0.05, 12]} position={[-0.1, 0.06, 0.02]} />
      <SketchCylinder args={[0.035, 0.035, 0.05, 12]} position={[0.06, 0.06, 0.07]} />
      {/* ABXY 按键（上色点缀） */}
      {[
        [0.15, 0.0],
        [0.11, -0.035],
        [0.19, -0.035],
        [0.15, -0.07],
      ].map(([x, z], i) => (
        <SketchCylinder key={i} args={[0.018, 0.018, 0.025, 10]} position={[x, 0.055, z]} fill={COLOR} />
      ))}
      {/* 十字键 */}
      <SketchBox size={[0.08, 0.02, 0.025]} position={[-0.13, 0.05, -0.05]} />
      <SketchBox size={[0.025, 0.02, 0.08]} position={[-0.13, 0.05, -0.05]} />
    </group>
  )
}
