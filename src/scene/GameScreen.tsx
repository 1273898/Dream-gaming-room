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

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)
const easeOutBack = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2)

/** 画一帧「原神启动」经典画面：纯白底 + 大标题淡入 + 「启动！」盖章砸入（循环） */
function drawGenshin(ctx: CanvasRenderingContext2D, time: number) {
  const T = 3.4 // 一轮周期（秒）
  const t = time % T
  const FONT = `'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', sans-serif`

  // 纯白底
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // 「启动！」砸入瞬间的轻微震屏
  const shake = t > 1.1 && t < 1.3 ? Math.sin(t * 90) * 2.5 * (1 - (t - 1.1) / 0.2) : 0

  ctx.save()
  ctx.translate(W / 2 + shake, H / 2 + shake * 0.6)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#111111'

  // 「原神」淡入，随后轻微呼吸
  const inT = Math.min(1, t / 0.45)
  const breathe = 1 + Math.sin(time * 2.2) * 0.012
  ctx.globalAlpha = inT
  ctx.save()
  ctx.scale((0.86 + 0.14 * easeOutCubic(inT)) * breathe, (0.86 + 0.14 * easeOutCubic(inT)) * breathe)
  ctx.font = `900 54px ${FONT}`
  ctx.fillText('原神', 0, -16)
  ctx.restore()

  // 「启动！」在 1.1s 时盖章式砸入（带回弹）
  if (t > 1.1) {
    const st = Math.min(1, (t - 1.1) / 0.22)
    const s = 1 + 0.8 * (1 - easeOutBack(st)) // 从 1.8 倍砸到 1，带回弹
    ctx.globalAlpha = Math.min(1, st * 2)
    ctx.save()
    ctx.scale(s, s)
    ctx.font = `900 30px ${FONT}`
    ctx.fillText('启 动 ！', 0, 40)
    ctx.restore()
  }
  ctx.restore()

  // 结尾淡出到白，进入下一轮
  if (t > T - 0.5) {
    ctx.fillStyle = `rgba(255,255,255,${(t - (T - 0.5)) / 0.5})`
    ctx.fillRect(0, 0, W, H)
  }
}

/**
 * 播放游戏画面的屏幕（Canvas 动态纹理）
 * variant: platformer 横版跳跃 / genshin 原神启动
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
  variant?: 'platformer' | 'genshin'
}) {
  const acc = useRef(0)
  const time = useRef(0)
  const draw = variant === 'genshin' ? drawGenshin : drawFrame

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
