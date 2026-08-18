import { TRACKS } from '../audio/tracks'
import { useStereoPlayer } from '../audio/useStereoPlayer'
import { useRoomStore } from '../store'

/** 页面底部的独立音响控制台，仅在播放时展开。 */
export function StereoConsole() {
  const isPlaying = useStereoPlayer((state) => state.isPlaying)
  const trackIndex = useStereoPlayer((state) => state.trackIndex)
  const previous = useStereoPlayer((state) => state.previous)
  const next = useStereoPlayer((state) => state.next)
  const isNight = useRoomStore((state) => state.isNight)

  const stopSceneClick = (event: React.MouseEvent) => event.stopPropagation()

  return (
    <section
      className={`stereo-console${isPlaying ? ' open' : ''}${isNight ? ' night' : ''}`}
      aria-hidden={!isPlaying}
      onClick={stopSceneClick}
    >
      <button
        type="button"
        aria-label="上一首"
        tabIndex={isPlaying ? 0 : -1}
        onClick={(event) => {
          event.stopPropagation()
          previous()
        }}
      >
        上一首
      </button>
      <strong>{TRACKS[trackIndex].title}</strong>
      <button
        type="button"
        aria-label="下一首"
        tabIndex={isPlaying ? 0 : -1}
        onClick={(event) => {
          event.stopPropagation()
          next()
        }}
      >
        下一首
      </button>
    </section>
  )
}
