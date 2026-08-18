import { useRoomStore } from '../store'

export function Hud() {
  const isNight = useRoomStore((s) => s.isNight)

  return (
    <>
      <div className={`hud-title${isNight ? ' night' : ''}`}>
        <h1>线稿游戏房</h1>
        <p>MY DREAM GAME ROOM · 先搭一个虚拟的</p>
      </div>
      <div className={`hud-hint${isNight ? ' night' : ''}`}>
        拖动环视 · 滚轮缩放 · 点击房间里的物品
      </div>
    </>
  )
}
