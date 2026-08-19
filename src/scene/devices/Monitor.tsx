import { useState } from 'react'
import { ACCENT } from '../../data/infos'
import { SketchBox, SketchLine, SketchPlane } from '../linework'
import { useInteractive } from '../useInteractive'
import { GameScreen } from '../GameScreen'

const COLOR = ACCENT.monitor

/** 显示器：点击切换游戏画面 */
export function Monitor() {
  const [on, setOn] = useState(false)
  const { groupRef, hovered, bind } = useInteractive(() => setOn((v) => !v))
  const lit = on || hovered

  return (
    <group ref={groupRef} position={[2.0, 0, -3.45]} {...bind}>
      {/* 底座 + 支架（藏在屏幕框后面） */}
      <SketchBox size={[0.42, 0.03, 0.26]} position={[0, 0.805, -0.08]} />
      <SketchBox size={[0.08, 0.36, 0.05]} position={[0, 0.99, -0.08]} />
      {/* 屏幕框 */}
      <SketchBox size={[1.6, 0.95, 0.06]} position={[0, 1.45, 0]} />
      {on ? (
        <GameScreen variant="space" size={[1.5, 0.85]} position={[0, 1.45, 0.035]} />
      ) : (
        <group>
          <SketchPlane size={[1.5, 0.85]} position={[0, 1.45, 0.035]} fill={lit ? '#eaf4ff' : undefined} />
          {/* 待机桌面线稿 */}
          <group position={[0, 1.45, 0.045]}>
            <SketchLine
              points={[
                [-0.55, -0.25, 0],
                [-0.55, 0.28, 0],
                [0.25, 0.28, 0],
                [0.25, -0.25, 0],
                [-0.55, -0.25, 0],
              ]}
              color={lit ? COLOR : undefined}
            />
            <SketchLine points={[[-0.55, 0.2, 0], [0.25, 0.2, 0]]} color={lit ? COLOR : undefined} />
            {[-0.02, -0.09, -0.16].map((y) => (
              <SketchLine key={y} points={[[-0.48, y, 0], [0.1, y, 0]]} />
            ))}
            <SketchLine points={[[-0.75, -0.36, 0], [0.75, -0.36, 0]]} color={lit ? COLOR : undefined} />
          </group>
        </group>
      )}
      {/* 电源指示灯 */}
      <SketchBox size={[0.03, 0.015, 0.01]} position={[0.6, 1.0, 0.035]} fill={lit ? COLOR : undefined} />
    </group>
  )
}
