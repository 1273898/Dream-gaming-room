import { useEffect, useRef, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'
import gsap from 'gsap'

/**
 * 可交互物品的通用行为：
 * 悬停：微放大
 * 点击：执行 onActivate（物品动画）
 */
export function useInteractive(onActivate?: () => void) {
  const groupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!groupRef.current) return
    gsap.to(groupRef.current.scale, {
      x: hovered ? 1.04 : 1,
      y: hovered ? 1.04 : 1,
      z: hovered ? 1.04 : 1,
      duration: 0.35,
      ease: 'power2.out',
    })
  }, [hovered])

  const bind = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setHovered(true)
    },
    onPointerOut: () => setHovered(false),
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      onActivate?.()
    },
  }

  return { groupRef, hovered, bind }
}
