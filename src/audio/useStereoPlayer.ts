import { create } from 'zustand'
import { findLyricIndex, parseLrc, TRACKS, type LyricLine } from './tracks'
import { createStereoPlayback, type StereoPlayback } from './stereoPlayback.mjs'

interface StereoPlayerState {
  isPlaying: boolean
  trackIndex: number
  lyricIndex: number
  lyrics: LyricLine[]
  toggle: () => void
  previous: () => void
  next: () => void
}

let player: StereoPlayback

export const useStereoPlayer = create<StereoPlayerState>(() => ({
  isPlaying: false,
  trackIndex: 0,
  lyricIndex: -1,
  lyrics: [],
  toggle: () => player.toggle(),
  previous: () => player.previous(),
  next: () => player.next(),
}))

player = createStereoPlayback<StereoPlayerState>({
  tracks: TRACKS,
  createAudio: () => new Audio(),
  fetchLyrics: fetch,
  parseLyrics: parseLrc,
  findLyricIndex,
  getState: () => useStereoPlayer.getState(),
  setState: (update) => useStereoPlayer.setState(update),
})
