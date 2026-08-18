/**
 * 海报墙配置：
 * 图片放在 public/posters/，每个位置的 srcs 数组可放多张图，点击海报循环切换。
 * 图片会自动按 cover 方式裁切适配画框尺寸（不变形）。
 * srcs 为空时显示占位画框。
 */
export interface PosterSlot {
  srcs: string[]
  position: [number, number, number]
  /** 海报朝向（绕 Y 轴弧度） */
  rotationY: number
  size: [number, number]
}

const P = (file: string) => `/posters/${file}`

export const POSTERS: PosterSlot[] = [
  // 后墙·书桌上方·竖版（1.0×1.4）—— 五张竖构图轮播
  {
    srcs: [
      P('微信图片_20260817123336_43_9.jpg'),
      P('微信图片_20260817123337_44_9.jpg'),
      P('微信图片_20260817123338_46_9.jpg'),
      P('微信图片_20260817123339_47_9.jpg'),
      P('微信图片_20260817123340_48_9.jpg'),
    ],
    position: [1.5, 2.45, -3.94],
    rotationY: 0,
    size: [1.0, 1.4],
  },
  // 后墙·书桌上方·横版（1.2×0.8）—— 两张横构图
  {
    srcs: [P('微信图片_20260817123335_42_9.jpg'), P('微信图片_20260817123338_45_9.jpg')],
    position: [3.3, 2.4, -3.94],
    rotationY: 0,
    size: [1.2, 0.8],
  },
  // 左墙·书架旁边·横版（1.2×0.9）—— 包含指定图片的轮播
  {
    srcs: [P('微信图片_20260817123341_49_9.jpg'), P('微信图片_20260817152952_51_9.jpg')],
    position: [-4.93, 1.9, 1.6],
    rotationY: Math.PI / 2,
    size: [1.2, 0.9],
  },
]
