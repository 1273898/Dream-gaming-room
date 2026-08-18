import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import gsap from 'gsap'
import { SketchBox, SketchCylinder, useTheme } from './linework'
import { useInteractive } from './useInteractive'

/** 随机目的地（房间前部活动区） */
function randomSpot() {
  return {
    x: -3.4 + Math.random() * 6.4,
    z: 0.2 + Math.random() * 2.8,
  }
}

/** 小猫：在房间里随意走动，点击会跳起来 */
export function Cat() {
  const tailRef = useRef<Group>(null)

  const { groupRef, bind } = useInteractive('cat', () => {
    const g = groupRef.current
    if (!g) return
    // 点击：原地跳一下
    gsap.to(g.position, { y: 0.35, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1 })
  })

  // 随机漫步
  useEffect(() => {
    const g = groupRef.current
    if (!g) return
    let alive = true

    const walk = () => {
      if (!alive || !groupRef.current) return
      const { x, z } = randomSpot()
      const dx = x - g.position.x
      const dz = z - g.position.z
      const dist = Math.hypot(dx, dz)
      // 先转向再走
      gsap.to(g.rotation, { y: Math.atan2(dx, dz), duration: 0.3, ease: 'power2.out' })
      gsap.to(g.position, {
        x,
        z,
        duration: dist / 0.7,
        ease: 'none',
        delay: 0.25,
        onComplete: () => {
          // 走-停-走
          gsap.delayedCall(0.8 + Math.random() * 2.5, walk)
        },
      })
    }
    const start = gsap.delayedCall(1.5, walk)

    return () => {
      alive = false
      start.kill()
      gsap.killTweensOf(g.position)
      gsap.killTweensOf(g.rotation)
    }
  }, [groupRef])

  // 走路时身体轻微起伏 + 尾巴摇摆
  useEffect(() => {
    const g = groupRef.current
    if (!g || !tailRef.current) return
    const bob = gsap.to(g.scale, { y: 0.96, duration: 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    const wag = gsap.to(tailRef.current.rotation, {
      x: 0.5,
      duration: 0.7,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    })
    return () => {
      bob.kill()
      wag.kill()
    }
  }, [groupRef])

  const t = useTheme()

  return (
    // 面朝 +z 建模，rotation.y 控制朝向
    <group ref={groupRef} position={[0.5, 0, 1.5]} {...bind}>
      {/* 隐形代理点击盒 */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.8, 0.7, 0.9]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* 身体 */}
      <SketchBox size={[0.22, 0.2, 0.42]} position={[0, 0.24, 0]} />
      {/* 头 */}
      <SketchBox size={[0.2, 0.18, 0.18]} position={[0, 0.36, 0.28]} />
      {/* 耳朵 */}
      <SketchCylinder args={[0.001, 0.045, 0.09, 4]} position={[-0.06, 0.49, 0.26]} />
      <SketchCylinder args={[0.001, 0.045, 0.09, 4]} position={[0.06, 0.49, 0.26]} />
      {/* 眼睛 */}
      <SketchBox size={[0.03, 0.03, 0.01]} position={[-0.05, 0.37, 0.375]} fill={t.line} />
      <SketchBox size={[0.03, 0.03, 0.01]} position={[0.05, 0.37, 0.375]} fill={t.line} />
      {/* 四条腿 */}
      {[-0.07, 0.07].map((x) =>
        [-0.14, 0.14].map((z) => (
          <SketchCylinder key={`${x}${z}`} args={[0.025, 0.025, 0.14, 8]} position={[x, 0.07, z]} />
        )),
      )}
      {/* 尾巴（上翘摇摆） */}
      <group ref={tailRef} position={[0, 0.3, -0.22]} rotation={[0.8, 0, 0]}>
        <SketchCylinder args={[0.02, 0.03, 0.3, 8]} position={[0, 0.12, -0.05]} rotation={[0.5, 0, 0]} />
      </group>
    </group>
  )
}
