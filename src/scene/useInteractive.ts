import { useEffect, useRef, useState } from 'react'
import { useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'
import gsap from 'gsap'
import { useRoomStore } from '../store'
import { INFOS } from '../data/infos'

/**
 * 可交互物品的通用行为：
 * 悬停：光标变 pointer + 微放大
 * 点击：页面顶部展示对应文字，并执行 onActivate（物品动画）
 */
export function useInteractive(key: keyof typeof INFOS, onActivate?: () => void) {
  const groupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const showInfo = useRoomStore((s) => s.showInfo)

  useCursor(hovered)

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
      const info = INFOS[key]
      showInfo({ key, title: info.title, text: info.text })
      onActivate?.()
    },
  }

  return { groupRef, hovered, bind }
}
