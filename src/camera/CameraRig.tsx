import { useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import gsap from 'gsap'

const HOME_POSITION: [number, number, number] = [6.2, 4.0, 7.8]
const HOME_TARGET: [number, number, number] = [0, 1.0, -1]

/** 镜头：仅保留进入推镜动画 + 自由环视 */
export function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const camera = useThree((s) => s.camera)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    camera.position.set(13, 9, 15)
    controls.target.set(...HOME_TARGET)
    const tween = gsap.to(camera.position, {
      x: HOME_POSITION[0],
      y: HOME_POSITION[1],
      z: HOME_POSITION[2],
      duration: 2.6,
      ease: 'power3.inOut',
      onUpdate: () => controls.update(),
      onComplete: () => setEntered(true),
    })
    return () => {
      tween.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={entered}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={2.5}
      maxDistance={11}
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI * 0.49}
    />
  )
}
