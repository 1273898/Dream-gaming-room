import { useState } from 'react'
import { ACCENT } from '../../data/infos'
import { SketchBox, SketchLine, SketchPlane, useTheme } from '../linework'
import { useInteractive } from '../useInteractive'
import { GameScreen } from '../GameScreen'

const COLOR = ACCENT.tv

/** 主机游戏站：超大电视（点击播放游戏画面）+ 游戏主机（指示灯联动） */
export function ConsoleStation() {
  const t = useTheme()
  const [on, setOn] = useState(false)
  const { groupRef, hovered, bind } = useInteractive('tv', () => setOn((v) => !v))
  const lit = on || hovered

  return (
    // 组原点放在电视中心，避免悬停缩放把电视推离墙面
    <group ref={groupRef} position={[-2.2, 0, -3.9]} {...bind}>
      {/* 超大电视 */}
      <group>
        <SketchBox size={[3.2, 1.8, 0.08]} position={[0, 1.95, 0]} />
        {on ? (
          <GameScreen size={[3.0, 1.6]} position={[0, 1.95, 0.06]} />
        ) : (
          <SketchPlane
            size={[3.0, 1.6]}
            position={[0, 1.95, 0.06]}
            fill={lit ? '#18271f' : '#161616'}
          />
        )}
        {/* 电源指示灯 */}
        <SketchBox size={[0.03, 0.015, 0.01]} position={[1.2, 1.08, 0.06]} fill={lit ? COLOR : undefined} />
      </group>

      {/* 游戏主机（置物架上层） */}
      <group position={[-0.55, 0.91, 0.25]}>
        <SketchBox size={[0.66, 0.12, 0.42]} />
        <SketchBox size={[0.05, 0.02, 0.02]} position={[-0.24, 0.05, 0.22]} fill={lit ? COLOR : undefined} />
        {[0.08, 0.14, 0.2].map((x) => (
          <SketchLine key={x} points={[[x, 0.065, -0.15], [x, 0.065, 0.15]]} color={t.line} />
        ))}
      </group>
    </group>
  )
}
