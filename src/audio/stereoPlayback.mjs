export function createStereoPlayback({
  tracks,
  createAudio,
  fetchLyrics,
  parseLyrics,
  findLyricIndex,
  getState,
  setState,
}) {
  let audio = null;
  let loadVersion = 0;
  let isLoading = false;

  function ensureAudio() {
    if (audio) return audio;

    audio = createAudio();
    audio.loop = true;
    audio.addEventListener('play', () => {
      setState({ isPlaying: true });
    });
    audio.addEventListener('pause', () => {
      setState({ isPlaying: false, lyricIndex: -1, lyrics: [] });
    });
    audio.addEventListener('timeupdate', () => {
      const { lyrics } = getState();
      setState({ lyricIndex: findLyricIndex(lyrics, audio?.currentTime ?? 0) });
    });
    return audio;
  }

  async function playTrack(trackIndex) {
    const version = ++loadVersion;
    const track = tracks[trackIndex];
    const player = ensureAudio();

    player.pause();
    player.src = track.src;
    player.currentTime = 0;
    player.load();
    isLoading = true;
    setState({ trackIndex, isPlaying: false, lyricIndex: -1, lyrics: [] });

    try {
      const playPromise = Promise.resolve(player.play());
      const [response] = await Promise.all([fetchLyrics(track.lrc), playPromise]);
      if (version !== loadVersion) return;

      const lyrics = response.ok ? parseLyrics(await response.text()) : [];
      if (version !== loadVersion) return;

      setState({ lyrics });
      isLoading = false;
    } catch {
      if (version === loadVersion) {
        isLoading = false;
        setState({ isPlaying: false, lyricIndex: -1, lyrics: [] });
      }
    }
  }

  return {
    toggle() {
      const player = ensureAudio();
      if (isLoading) {
        loadVersion++;
        isLoading = false;
        player.pause();
        setState({ isPlaying: false, lyricIndex: -1, lyrics: [] });
        return;
      }
      if (getState().isPlaying) {
        player.pause();
        return;
      }
      void playTrack(getState().trackIndex);
    },
    previous() {
      const index = (getState().trackIndex - 1 + tracks.length) % tracks.length;
      void playTrack(index);
    },
    next() {
      const index = (getState().trackIndex + 1) % tracks.length;
      void playTrack(index);
    },
  };
}
