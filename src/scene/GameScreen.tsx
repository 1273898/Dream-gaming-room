import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture } from 'three'

type V3 = [number, number, number]

const W = 256
const H = 144

/** 画一帧横版跳跃游戏画面 */
function drawFrame(ctx: CanvasRenderingContext2D, time: number) {
  // 天空
  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#1b2a52')
  sky.addColorStop(0.7, '#5b3a7a')
  sky.addColorStop(1, '#c65d3b')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)

  // 太阳
  ctx.fillStyle = '#ffd76a'
  ctx.beginPath()
  ctx.arc(W * 0.72, H * 0.34, 14, 0, Math.PI * 2)
  ctx.fill()

  // 远景山（慢视差）
  ctx.fillStyle = '#3a2d5c'
  const off1 = (time * 6) % 64
  for (let x = -64; x < W + 64; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x - off1, H)
    ctx.lineTo(x - off1 + 32, H * 0.45)
    ctx.lineTo(x - off1 + 64, H)
    ctx.fill()
  }

  // 近景山（快视差）
  ctx.fillStyle = '#241b3d'
  const off2 = (time * 14) % 48
  for (let x = -48; x < W + 48; x += 48) {
    ctx.beginPath()
    ctx.moveTo(x - off2, H)
    ctx.lineTo(x - off2 + 24, H * 0.62)
    ctx.lineTo(x - off2 + 48, H)
    ctx.fill()
  }

  // 地面
  ctx.fillStyle = '#151022'
  ctx.fillRect(0, H * 0.82, W, H * 0.18)
  ctx.fillStyle = '#2e2450'
  const offG = (time * 30) % 16
  for (let x = -16; x < W + 16; x += 16) {
    ctx.fillRect(x - offG, H * 0.82, 8, 3)
  }

  // 跳跃的小人
  const jumpT = (time % 1.2) / 1.2
  const jumpY = Math.sin(jumpT * Math.PI) * 22
  const cx = W * 0.32
  const cy = H * 0.82 - 10 - jumpY
  ctx.fillStyle = '#7ef0d4'
  ctx.fillRect(cx - 5, cy - 5, 10, 10)
  ctx.fillStyle = '#0d0d14'
  ctx.fillRect(cx + 1, cy - 2, 2, 2) // 眼睛

  // 金币
  ctx.fillStyle = '#ffd76a'
  const coinY = H * 0.5 + Math.sin(time * 3) * 3
  ctx.beginPath()
  ctx.arc(W * 0.6, coinY, 4, 0, Math.PI * 2)
  ctx.fill()
}

/** 画一帧太空射击游戏画面 */
function drawSpace(ctx: CanvasRenderingContext2D, time: number) {
  // 深空
  ctx.fillStyle = '#04040c'
  ctx.fillRect(0, 0, W, H)

  // 星星（两层视差滚动）
  for (let layer = 0; layer < 2; layer++) {
    const speed = layer === 0 ? 10 : 26
    const size = layer === 0 ? 1 : 2
    ctx.fillStyle = layer === 0 ? '#3a4a6a' : '#cfe0ff'
    for (let i = 0; i < 26; i++) {
      const seed = i * 37 + layer * 91
      const x = (((seed * 53) % W) + W - ((time * speed) % W)) % W
      const y = (seed * 29) % H
      ctx.fillRect(x, y, size, size)
    }
  }

  // 敌舰（红色三角，缓慢盘旋下降）
  const ex = W * 0.3 + Math.sin(time * 0.5) * 24
  const ey = ((time * 18) % (H * 1.5)) - 20
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.moveTo(ex, ey + 8)
  ctx.lineTo(ex - 7, ey - 6)
  ctx.lineTo(ex + 7, ey - 6)
  ctx.fill()

  // 第二艘敌舰（错位）
  const ex2 = W * 0.7 + Math.cos(time * 0.4) * 20
  const ey2 = (((time + 3) * 15) % (H * 1.5)) - 20
  ctx.fillStyle = '#f97316'
  ctx.beginPath()
  ctx.moveTo(ex2, ey2 + 7)
  ctx.lineTo(ex2 - 6, ey2 - 5)
  ctx.lineTo(ex2 + 6, ey2 - 5)
  ctx.fill()

  // 玩家飞船（底部，左右游走）
  const sx = W * 0.5 + Math.sin(time * 0.9) * W * 0.22
  const sy = H - 18
  ctx.fillStyle = '#7cc4ff'
  ctx.beginPath()
  ctx.moveTo(sx, sy - 9)
  ctx.lineTo(sx - 8, sy + 7)
  ctx.lineTo(sx + 8, sy + 7)
  ctx.fill()
  // 尾焰
  ctx.fillStyle = '#fbbf24'
  ctx.fillRect(sx - 2, sy + 8, 4, 3 + Math.sin(time * 20) * 2)

  // 子弹（循环上升）
  ctx.fillStyle = '#fef08a'
  for (let k = 0; k < 3; k++) {
    const by = sy - ((time * 140 + k * 60) % (H + 20))
    const bx = W * 0.5 + Math.sin((time - (H - by) / 140) * 0.9) * W * 0.22
    ctx.fillRect(bx - 1, by, 2, 6)
  }
}

/**
 * 播放游戏画面的屏幕（Canvas 动态纹理）
 * variant: platformer 横版跳跃 / space 太空射击
 */
export function GameScreen({
  size,
  position,
  rotation,
  variant = 'platformer',
}: {
  size: [number, number]
  position?: V3
  rotation?: V3
  variant?: 'platformer' | 'space'
}) {
  const acc = useRef(0)
  const time = useRef(0)
  const draw = variant === 'space' ? drawSpace : drawFrame

  const { texture, ctx } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    draw(ctx, 0)
    const texture = new CanvasTexture(canvas)
    return { texture, ctx }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant])

  useFrame((_, delta) => {
    acc.current += delta
    if (acc.current < 0.08) return // ~12fps 就够
    time.current += acc.current
    acc.current = 0
    draw(ctx, time.current)
    texture.needsUpdate = true
  })

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}
