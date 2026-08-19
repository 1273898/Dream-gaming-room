import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { CameraRig } from './camera/CameraRig'
import { Room } from './scene/Room'
import { Furniture } from './scene/furniture'
import { Posters } from './scene/Posters'
import { Devices } from './scene/devices'
import { Cat } from './scene/Cat'
import { FloatingLyrics, LyricFontPreload } from './scene/FloatingLyrics'
import { Hud } from './ui/Hud'
import { StereoConsole } from './ui/StereoConsole'
import { useTheme } from './scene/linework'

function SceneBackground() {
  const t = useTheme()
  return <color attach="background" args={[t.bg]} />
}

/** 调试：把 R3F 内部状态挂到 window（仅开发环境） */
function R3fDebug() {
  const get = useThree((s) => s.get)
  useEffect(() => {
    if (import.meta.env.DEV) {
      const w = window as unknown as { __r3f: unknown; __r3fGet: unknown }
      w.__r3f = get()
      w.__r3fGet = get
    }
  }, [get])
  return null
}

export default function App() {
  return (
    <>
      <Canvas camera={{ fov: 40, position: [13, 9, 15], near: 0.1, far: 100 }}>
        <Suspense fallback={null}>
          <LyricFontPreload />
          <R3fDebug />
          <SceneBackground />
          <CameraRig />
          <Room />
          <Furniture />
          <Posters />
          <Devices />
          <Cat />
          <FloatingLyrics />
        </Suspense>
      </Canvas>
      <Hud />
      <StereoConsole />
    </>
  )
}
