import { useEffect, useRef } from 'react'
import { useRoomStore } from '../store'

/** 自定义光标：简约圆点，跟随鼠标 */
function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dotRef.current) return
      dotRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return <div ref={dotRef} className="cursor-dot" />
}

export function Hud() {
  const isNight = useRoomStore((s) => s.isNight)

  return (
    <>
      <CursorDot />
      <div className={`hud-hint${isNight ? ' night' : ''}`}>
        拖动环视 · 滚轮缩放 · 点击房间里的物品
      </div>
    </>
  )
}
