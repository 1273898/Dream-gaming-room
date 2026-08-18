import { useEffect } from 'react'
import { useRoomStore } from '../store'

/** 页面顶部的信息展示条：点击物品后出现，6 秒自动收起 */
export function TopInfo() {
  const info = useRoomStore((s) => s.info)
  const clearInfo = useRoomStore((s) => s.clearInfo)
  const isNight = useRoomStore((s) => s.isNight)

  useEffect(() => {
    if (!info) return
    const timer = setTimeout(clearInfo, 6000)
    return () => clearTimeout(timer)
  }, [info, clearInfo])

  return (
    <div className={`top-info${info ? ' open' : ''}${isNight ? ' night' : ''}`}>
      {info && (
        <>
          <strong>{info.title}</strong>
          <span>{info.text}</span>
          <button className="top-info-close" onClick={clearInfo} aria-label="关闭">
            ✕
          </button>
        </>
      )}
    </div>
  )
}
