import { Text } from '@react-three/drei'
import { Suspense, type JSX } from 'react'
import { useStereoPlayer } from '../audio/useStereoPlayer'
import { useRoomStore } from '../store'

// 本地完整中文字体（微软雅黑 ttc），支持简体中文/日文歌词渲染。
// 注意：Text3D 的 ASCII 字体会把中文显示成 '?'，故此处沿用 troika `<Text>` + 本地中文字体，
// 并以“多层 Z 轴堆叠挤出”的方式模拟立体厚度（见下方 ExtrudedLyricText）。
export const LYRIC_FONT_URL = '/fonts/msyh.ttc'

/** 把十六进制颜色按系数调暗/调亮，用于给堆叠层的侧面制造深浅层次。 */
function shade(hex: string, factor: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.round(((n >> 16) & 0xff) * factor))
  const g = Math.min(255, Math.round(((n >> 8) & 0xff) * factor))
  const b = Math.min(255, Math.round((n & 0xff) * factor))
  return `rgb(${r}, ${g}, ${b})`
}

/** 渲染有真实厚度的单行立体歌词：沿 Z 轴堆叠多层 troika `<Text>`，逐层偏移形成挤出效果。 */
function ExtrudedLyricText(props: {
  text: string
  fontSize: number
  fillColor: string
  outlineColor: string
  outlineWidth: number
  depth?: number
}): JSX.Element {
  const { text, fontSize, fillColor, outlineColor, outlineWidth, depth = 0.04 } = props
  const LAYERS = 5
  const layers: JSX.Element[] = []
  for (let i = 0; i < LAYERS; i++) {
    const front = i === 0
    const back = i === LAYERS - 1
    // 最前层 z 最大（朝观众），最后层 z 最小；front 为最前层。
    const z = depth * (0.5 - i / (LAYERS - 1))
    // 中间层用略深颜色与细描边体现侧面层次；正面/背面用完整描边勾勒边缘。
    const isFace = front || back
    layers.push(
      <Text
        key={i}
        font={LYRIC_FONT_URL}
        fontSize={fontSize}
        color={isFace ? fillColor : shade(fillColor, 0.72)}
        outlineWidth={isFace ? outlineWidth : outlineWidth * 0.6}
        outlineColor={outlineColor}
        anchorX="center"
        anchorY="middle"
        position={[0, 0, z]}
      >
        {text}
      </Text>
    )
  }
  return <group>{layers}</group>
}

/**
 * 应用启动时即在场景内挂载一个隐藏的 troika `<Text>`，触发 troika 字体管线的预加载，
 * 确保用户首次点击音响播放音乐时，`<Text>` 不会再因字体挂起，
 * 从而避免外层 `<Suspense fallback={null}>` 把整個 3D 场景卸载/重载。
 *
 * index.html 中的 `<link rel="preload">` 负责预热浏览器 HTTP/字体缓存，
 * 本组件则负责预热 troika 自身的字体解析与 glyph 缓存（双保险）。
 */
export function LyricFontPreload() {
  return (
    <Suspense fallback={null}>
      <Text
        font={LYRIC_FONT_URL}
        fontSize={0.001}
        color="transparent"
        anchorX="center"
        anchorY="middle"
        // 放到相机视锥外，避免即使渲染也不可见
        position={[9999, 9999, 9999]}
      >
        {' '}
      </Text>
    </Suspense>
  )
}

/** 在显示器正上方显示随播放进度更新的一句立体歌词，文字正对电脑椅方向。 */
export function FloatingLyrics() {
  const isPlaying = useStereoPlayer((state) => state.isPlaying)
  const lyrics = useStereoPlayer((state) => state.lyrics)
  const lyricIndex = useStereoPlayer((state) => state.lyricIndex)
  const isNight = useRoomStore((state) => state.isNight)

  if (!isPlaying || lyricIndex < 0 || lyrics.length === 0) return null

  const current = lyrics[lyricIndex]?.text ?? ''
  const length = Math.max(Array.from(current).length, 1)
  const fontSize = 0.17
  const textScale = Math.min(1, 17 / length)
  const fillColor = isNight ? '#a8f1ff' : '#2a5168'
  // 夜晚添加柔和描边增强可读性与微弱发光观感（无需修改 troika 内部材质，避免 uniforms 错误）
  const outlineColor = isNight ? '#ff79c6' : '#9ecbe2'
  const outlineWidth = isNight ? 0.006 : 0.003

  // 歌词悬浮于 [2.0, 2.16, -3.45]（桌面正上方），电脑椅位于 [2.2, 0, -1.75]（其 +z 方向）。
  // troika Text 正面朝 +z，绕 Y 轴旋转使文字正对椅子：atan2(0.2, 1.7) ≈ 0.117。
  //
  // 内层 `<Suspense fallback={null}>` 仅隔离歌词本身的字体加载挂起：
  // 即使 `<Text>` 因某种原因再次挂起，也只会让歌词暂时不显示（fallback=null），
  // 而不会冒泡到 App 层 `<Suspense fallback={null}>` 导致整個房间/家具被卸载重载。
  return (
    <group position={[2.0, 2.16, -3.45]} rotation={[0, 0.117, 0]}>
      <pointLight
        color={isNight ? '#a855f7' : '#b7dce8'}
        intensity={isNight ? 5 : 0.8}
        distance={2.4}
        decay={2}
      />
      <Suspense fallback={null}>
        <group scale={[textScale, textScale, textScale]}>
          <ExtrudedLyricText
            text={current}
            fontSize={fontSize}
            fillColor={fillColor}
            outlineColor={outlineColor}
            outlineWidth={outlineWidth}
          />
        </group>
      </Suspense>
    </group>
  )
}