import { useMemo, useState } from 'react'
import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace, TextureLoader } from 'three'
import { POSTERS, type PosterSlot } from '../data/posters'
import { SketchBox, SketchPlane, SketchLine, useTheme } from './linework'
import { useInteractive } from './useInteractive'

/** 有图海报：预加载全部图片，cover 裁切适配画框，点击循环切换 */
function PosterImage({ slot }: { slot: PosterSlot }) {
  const rawTextures = useLoader(TextureLoader, slot.srcs)
  const [index, setIndex] = useState(0)

  // cover 适配：调整纹理 repeat/offset，让图片铺满画框且不变形
  const textures = useMemo(() => {
    const slotAspect = slot.size[0] / slot.size[1]
    return rawTextures.map((tex) => {
      tex.colorSpace = SRGBColorSpace
      const img = tex.image as HTMLImageElement
      const imgAspect = img.width / img.height
      if (imgAspect > slotAspect) {
        // 图片更宽：裁两侧
        tex.repeat.set(slotAspect / imgAspect, 1)
        tex.offset.set((1 - slotAspect / imgAspect) / 2, 0)
      } else {
        // 图片更高：裁上下
        tex.repeat.set(1, imgAspect / slotAspect)
        tex.offset.set(0, (1 - imgAspect / slotAspect) / 2)
      }
      return tex
    })
  }, [rawTextures, slot.size])

  const { bind } = useInteractive('poster', () => {
    setIndex((i) => (i + 1) % textures.length)
  })

  return (
    <mesh position={[0, 0, 0.03]} {...bind}>
      <planeGeometry args={slot.size} />
      <meshBasicMaterial map={textures[index]} />
    </mesh>
  )
}

/** 占位画面：灰底 + 对角线 */
function PosterPlaceholder({ size }: { size: [number, number] }) {
  const t = useTheme()
  const [w, h] = size
  return (
    <group>
      <SketchPlane size={size} position={[0, 0, 0.03]} fill={t.dimmer} edge={t.dim} />
      <SketchLine points={[[-w / 2, -h / 2, 0.04], [w / 2, h / 2, 0.04]]} color={t.dim} />
      <SketchLine points={[[-w / 2, h / 2, 0.04], [w / 2, -h / 2, 0.04]]} color={t.dim} />
    </group>
  )
}

function Poster({ slot }: { slot: PosterSlot }) {
  const [w, h] = slot.size
  return (
    <group position={slot.position} rotation={[0, slot.rotationY, 0]}>
      {/* 线稿画框 */}
      <SketchBox size={[w + 0.12, h + 0.12, 0.04]} />
      {slot.srcs.length > 0 ? <PosterImage slot={slot} /> : <PosterPlaceholder size={slot.size} />}
    </group>
  )
}

export function Posters() {
  return (
    <group>
      {POSTERS.map((slot, i) => (
        <Poster key={i} slot={slot} />
      ))}
    </group>
  )
}
