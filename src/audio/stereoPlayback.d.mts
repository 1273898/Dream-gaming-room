export interface StereoPlaybackTrack {
  src: string
  lrc: string
}

export interface StereoPlaybackAudio {
  loop: boolean
  src: string
  currentTime: number
  pause: () => void
  load: () => void
  play: () => Promise<void>
  addEventListener: (type: 'play' | 'pause' | 'timeupdate', listener: () => void) => void
}

export interface StereoPlaybackOptions<State extends { trackIndex: number; isPlaying: boolean; lyricIndex: number; lyrics: unknown[] }> {
  tracks: StereoPlaybackTrack[]
  createAudio: () => StereoPlaybackAudio
  fetchLyrics: (url: string) => Promise<{ ok: boolean; text: () => Promise<string> }>
  parseLyrics: (raw: string) => State['lyrics']
  findLyricIndex: (lyrics: State['lyrics'], seconds: number) => number
  getState: () => State
  setState: (update: Partial<State>) => void
}

export interface StereoPlayback {
  toggle: () => void
  previous: () => void
  next: () => void
}

export function createStereoPlayback<State extends { trackIndex: number; isPlaying: boolean; lyricIndex: number; lyrics: unknown[] }>(
  options: StereoPlaybackOptions<State>,
): StereoPlayback
