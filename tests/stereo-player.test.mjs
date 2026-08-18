import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createStereoPlayback } from '../src/audio/stereoPlayback.mjs';

const tracksPath = path.resolve('src/audio/tracks.ts');
const playerPath = path.resolve('src/audio/useStereoPlayer.ts');
const furniturePath = path.resolve('src/scene/furniture.tsx');
const lyricsPath = path.resolve('src/scene/FloatingLyrics.tsx');
const topInfoPath = path.resolve('src/ui/TopInfo.tsx');
const stereoConsolePath = path.resolve('src/ui/StereoConsole.tsx');
const appPath = path.resolve('src/App.tsx');
const cssPath = path.resolve('src/index.css');

test('playlist maps both bundled music files and exports parser helpers', () => {
  const source = fs.readFileSync(tracksPath, 'utf8');

  assert.match(source, /export (?:interface|type) Track/);
  assert.match(source, /export (?:interface|type) LyricLine/);
  assert.match(source, /把喜欢吹进风 \(夏日版\) - 雪球\.mp3/);
  assert.match(source, /把喜欢吹进风 \(夏日版\) - 雪球\.lrc/);
  assert.match(source, /オトノケ - Otonoke - Creepy Nuts\.mp3/);
  assert.match(source, /オトノケ - Otonoke - Creepy Nuts\.lrc/);
  assert.match(source, /export const TRACKS/);
  assert.match(source, /export function parseLrc/);
  assert.match(source, /export function findLyricIndex/);
});

test('LRC implementation handles timestamp parsing, sorting, and lookup boundaries', () => {
  const source = fs.readFileSync(tracksPath, 'utf8');

  assert.match(source, /const TIMESTAMP/);
  assert.match(source, /matchAll\(TIMESTAMP\)/);
  assert.match(source, /sort\(/);
  assert.match(source, /seconds \* 1000/);
  assert.match(source, /result = -1/);
});

test('stereo player connects the shared playback controller to the Zustand state', () => {
  const source = fs.readFileSync(playerPath, 'utf8');

  assert.match(source, /createStereoPlayback/);
  assert.match(source, /createAudio: \(\) => new Audio\(\)/);
  assert.match(source, /lyrics:/);
  assert.match(source, /toggle:/);
  assert.match(source, /previous:/);
  assert.match(source, /next:/);
  assert.match(source, /fetchLyrics: fetch/);
  assert.match(source, /parseLyrics: parseLrc/);
  assert.match(source, /findLyricIndex,/);
});

test('toggle starts audio synchronously and a second toggle cancels the pending lyric load', async () => {
  let resolveLyrics;
  const lyricsRequest = new Promise((resolve) => {
    resolveLyrics = resolve;
  });
  const listeners = {};
  const audio = {
    loop: false,
    src: '',
    currentTime: 0,
    playCalls: 0,
    pause() {
      listeners.pause?.();
    },
    load() {},
    async play() {
      this.playCalls += 1;
      listeners.play?.();
    },
    addEventListener(type, listener) {
      listeners[type] = listener;
    },
  };
  const state = {
    isPlaying: false,
    trackIndex: 0,
    lyricIndex: -1,
    lyrics: [],
  };
  const player = createStereoPlayback({
    tracks: [{ src: '/song.mp3', lrc: '/song.lrc' }],
    createAudio: () => audio,
    fetchLyrics: () => lyricsRequest,
    parseLyrics: () => [],
    findLyricIndex: () => -1,
    getState: () => state,
    setState: (update) => Object.assign(state, update),
  });

  player.toggle();
  assert.equal(audio.playCalls, 1);
  assert.equal(state.isPlaying, true);
  player.toggle();
  resolveLyrics({ ok: true, text: async () => '[00:00.000]never play' });
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(audio.playCalls, 1);
  assert.equal(state.isPlaying, false);
  assert.deepEqual(state.lyrics, []);
});

test('track switching starts the selected audio before its lyric request resolves', async () => {
  let resolveLyrics;
  const lyricsRequest = new Promise((resolve) => {
    resolveLyrics = resolve;
  });
  const audio = {
    loop: false,
    src: '',
    currentTime: 0,
    playCalls: 0,
    pause() {},
    load() {},
    play() {
      this.playCalls += 1;
      return Promise.resolve();
    },
    addEventListener() {},
  };
  const state = {
    isPlaying: false,
    trackIndex: 0,
    lyricIndex: -1,
    lyrics: [],
  };
  const player = createStereoPlayback({
    tracks: [
      { src: '/first.mp3', lrc: '/first.lrc' },
      { src: '/second.mp3', lrc: '/second.lrc' },
    ],
    createAudio: () => audio,
    fetchLyrics: () => lyricsRequest,
    parseLyrics: () => [],
    findLyricIndex: () => -1,
    getState: () => state,
    setState: (update) => Object.assign(state, update),
  });

  player.next();

  assert.equal(audio.src, '/second.mp3');
  assert.equal(audio.playCalls, 1);
  resolveLyrics({ ok: true, text: async () => '' });
  await Promise.resolve();
  await Promise.resolve();
});

test('both speakers use the shared stereo toggle while retaining their bounce', () => {
  const source = fs.readFileSync(furniturePath, 'utf8');

  assert.match(source, /useStereoPlayer/);
  assert.match(source, /toggle\(\)/);
  assert.match(source, /gsap\.fromTo/);
});

test('top info stays limited to selected object information', () => {
  const source = fs.readFileSync(topInfoPath, 'utf8');

  assert.doesNotMatch(source, /useStereoPlayer/);
  assert.doesNotMatch(source, /stereo-controls/);
  assert.match(source, /info \? ' open' : ''/);
  assert.match(source, /info &&/);
});

test('bottom stereo console owns track navigation independently of top info', () => {
  const source = fs.readFileSync(stereoConsolePath, 'utf8');
  const appSource = fs.readFileSync(appPath, 'utf8');
  const cssSource = fs.readFileSync(cssPath, 'utf8');

  assert.match(source, /useStereoPlayer/);
  assert.match(source, /isPlaying/);
  assert.match(source, /previous/);
  assert.match(source, /TRACKS\[trackIndex\]\.title/);
  assert.match(source, /next/);
  assert.match(source, /stereo-console/);
  assert.match(source, /stopPropagation\(\)/);
  assert.match(appSource, /StereoConsole/);
  assert.match(cssSource, /\.stereo-console/);
  assert.match(cssSource, /\.stereo-console\.night/);
});

test('floating lyrics preload their Text3D font before speakers and render one fitted extruded current line', () => {
  const source = fs.readFileSync(lyricsPath, 'utf8');
  const appSource = fs.readFileSync(appPath, 'utf8');

  assert.match(source, /Text3D/);
  assert.match(source, /useFont/);
  assert.match(source, /export const LYRIC_FONT_URL/);
  assert.match(source, /export function LyricFontPreload/);
  assert.match(source, /useFont\.preload\(LYRIC_FONT_URL\)/);
  assert.match(source, /useStereoPlayer/);
  assert.match(source, /isPlaying/);
  assert.match(source, /lyrics/);
  assert.match(source, /lyricIndex/);
  assert.match(source, /if \(!isPlaying \|\| lyricIndex < 0(?: \|\| lyrics\.length === 0)?\) return null/);
  assert.match(source, /position=\{\[2(?:\.0+)?, 2\.16, -3\.45\]\}/);
  assert.match(source, /rotation=\{\[0, Math\.PI \/ 2, 0\]\}/);
  assert.match(source, /const current = lyrics\[lyricIndex\]\?\.text \?\? ''/);
  assert.match(source, /const textScale =/);
  assert.match(source, /scale=\{\[textScale, textScale, textScale\]\}/);
  assert.match(source, /<Text3D/);
  assert.match(source, /font=\{LYRIC_FONT_URL\}/);
  assert.match(source, /size=\{fontSize\}/);
  assert.match(source, /height=\{0\.045\}/);
  assert.match(source, /bevelEnabled/);
  assert.match(source, /emissive/);
  assert.match(source, /#7ef9ff/);
  assert.match(source, /#a855f7/);
  assert.doesNotMatch(source, /const previous/);
  assert.doesNotMatch(source, /const next/);
  assert.match(appSource, /FloatingLyrics/);
  assert.match(appSource, /LyricFontPreload/);
  assert.match(appSource, /<LyricFontPreload\s*\/>[\s\S]*<Furniture\s*\/>/);
});
