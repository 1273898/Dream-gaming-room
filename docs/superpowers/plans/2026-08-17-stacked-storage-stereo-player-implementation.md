# Stacked Storage and Stereo Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将桌左储物改为冰箱下、零食柜上的紧凑叠放，并为两个音响接入统一音乐播放、切歌和 LRC 立体歌词。

**Architecture:** 新建独立的 `useStereoPlayer` Zustand store，唯一持有 `HTMLAudioElement`、曲目索引、播放状态与 LRC 当前行。`Speaker` 只调用这个共享 store；顶部信息条读取同一状态渲染前后切歌，场景内的 `FloatingLyrics` 读取当前行渲染 drei Text。

**Tech Stack:** React 19、TypeScript、Zustand、Three.js、@react-three/fiber、@react-three/drei、GSAP。

## Global Constraints

- 冰箱在下、零食柜在上，位于电脑桌左端靠后墙；机箱文件不得变更。
- 左右音响必须共享一个 HTMLAudioElement 与一个播放状态。
- 播放与切歌仅由用户点击触发；当前曲目循环播放。
- 顶部控件仅为上一首、当前曲名、下一首。
- 同步显示当前、前一、后一行用户提供的 LRC；停止后清空歌词。
- `node --test tests/*.test.mjs` 与 `npm run build` 必须通过。

---

## File structure

- Create: `src/audio/tracks.ts` — 曲目清单、LRC 解析和当前歌词行查询。
- Create: `src/audio/useStereoPlayer.ts` — 单例音频、播放/暂停/切歌状态。
- Create: `src/scene/FloatingLyrics.tsx` — 音响上方的三行 3D 文本。
- Modify: `src/scene/furniture.tsx` — 叠放储物尺寸、两个 `Speaker` 共享播放器。
- Modify: `src/ui/TopInfo.tsx` — 播放中的上一/下一曲控件。
- Modify: `src/App.tsx` — 挂载 `FloatingLyrics`。
- Modify: `src/index.css` — 播放器按钮布局。
- Test: `tests/stereo-player.test.mjs` — 静态结构与 LRC 文件映射验收。

### Task 1: Build the playlist and LRC parser

**Files:** Create `src/audio/tracks.ts`; Test `tests/stereo-player.test.mjs`.

**Interfaces:** Produces `Track`, `LyricLine`, `TRACKS`, `parseLrc(raw: string): LyricLine[]`, and `findLyricIndex(lines: LyricLine[], seconds: number): number`.

- [ ] **Step 1: Write the failing test**

```js
assert.match(tracks, /把喜欢吹进风 \(夏日版\) - 雪球\.mp3/)
assert.match(tracks, /オトノケ - Otonoke - Creepy Nuts\.lrc/)
assert.match(tracks, /export function parseLrc/)
```

- [ ] **Step 2: Run the test**

Run: `node --test tests/stereo-player.test.mjs`

Expected: FAIL because `src/audio/tracks.ts` does not exist.

- [ ] **Step 3: Implement parser and playlist**

```ts
export const TRACKS = [
  { title: '把喜欢吹进风 (夏日版) · 雪球', src: '/music/把喜欢吹进风 (夏日版) - 雪球.mp3', lrc: '/music/把喜欢吹进风 (夏日版) - 雪球.lrc' },
  { title: 'オトノケ · Creepy Nuts', src: '/music/オトノケ - Otonoke - Creepy Nuts.mp3', lrc: '/music/オトノケ - Otonoke - Creepy Nuts.lrc' },
] as const
```

Parse every `[mm:ss.xxx]` tag into milliseconds, discard bracketed metadata lines without timestamps, sort ascending, and return the last line whose timestamp is no greater than `seconds * 1000`.

- [ ] **Step 4: Run test green**

Run: `node --test tests/stereo-player.test.mjs`

Expected: PASS.

### Task 2: Create shared stereo playback state

**Files:** Create `src/audio/useStereoPlayer.ts`; Modify `src/scene/furniture.tsx`; Test `tests/stereo-player.test.mjs`.

**Interfaces:** Produces `useStereoPlayer` with `{ isPlaying, trackIndex, lyricIndex, toggle, previous, next }`. `toggle()` is safe before a user interaction but only calls `audio.play()` from the Speaker/TopInfo click handlers.

- [ ] **Step 1: Extend the failing test**

```js
assert.match(player, /let audio: HTMLAudioElement \| null = null/)
assert.match(player, /audio\.loop = true/)
assert.match(player, /toggle:/)
assert.match(player, /previous:/)
assert.match(player, /next:/)
```

- [ ] **Step 2: Run test red**

Run: `node --test tests/stereo-player.test.mjs`

Expected: FAIL because `useStereoPlayer.ts` does not exist.

- [ ] **Step 3: Implement one audio instance**

Create `ensureAudio()` which lazily creates `new Audio()`, sets `loop = true`, registers `timeupdate` to write `lyricIndex`, and pauses/resets line state on `pause`. On each `previous`/`next`, wrap the index, load the selected `src`, fetch/parse its LRC, set `currentTime = 0`, and call `audio.play()`.

In `Speaker`, replace the per-speaker bounce-only activation with `toggle()` plus the bounce. Both existing `<Speaker>` instances call the same store; do not add an Audio element to either speaker.

- [ ] **Step 4: Run test green**

Run: `node --test tests/stereo-player.test.mjs`

Expected: PASS.

### Task 3: Add music controls and floating lyrics

**Files:** Create `src/scene/FloatingLyrics.tsx`; Modify `src/ui/TopInfo.tsx`, `src/index.css`, `src/App.tsx`; Test `tests/stereo-player.test.mjs`.

**Interfaces:** `FloatingLyrics` consumes `useStereoPlayer`; `TopInfo` consumes `isPlaying`, `trackIndex`, `previous`, `next`; `TRACKS[trackIndex].title` is the displayed title.

- [ ] **Step 1: Extend failing test**

```js
assert.match(topInfo, /previous\(\)/)
assert.match(topInfo, /next\(\)/)
assert.match(lyrics, /<Text/)
assert.match(lyrics, /position=\{\[2\.2, 1\.55, -3\.1\]\}/)
```

- [ ] **Step 2: Run test red**

Run: `node --test tests/stereo-player.test.mjs`

Expected: FAIL because the player controls and `FloatingLyrics.tsx` are missing.

- [ ] **Step 3: Implement UI and 3D lyrics**

When `info?.key === 'speaker' && isPlaying`, render two buttons with `onClick={(event) => { event.stopPropagation(); previous() }}` and `next()` around the current track title. Use CSS buttons with the existing day/night colors.

Create `FloatingLyrics` using drei `Text`: current line at scale `0.16` and opacity 1, previous/next at scale `0.08` and opacity 0.45. Group it at `[2.2, 1.55, -3.1]`, rotate it toward room center, and return `null` when not playing or no lyrics are loaded. Mount it immediately after `<Furniture />` in `App.tsx`.

- [ ] **Step 4: Run test green**

Run: `node --test tests/stereo-player.test.mjs`

Expected: PASS.

### Task 4: Stack and scale desk-left storage

**Files:** Modify `src/scene/furniture.tsx`; Test `tests/desk-storage.test.mjs`.

**Interfaces:** `Fridge` stays independently interactive at lower position; `SnackCabinet` stays independently interactive at the same X/Z and elevated Y. `Pc.tsx` is untouched.

- [ ] **Step 1: Update failing layout assertions**

```js
assert.match(source, /position=\{\[0\.35, 0, -3\.2\]\}/)
assert.match(source, /position=\{\[0\.35, 0\.8, -3\.2\]\}/)
assert.match(source, /size=\{\[0\.66, 0\.76, 0\.52\]\}/)
```

- [ ] **Step 2: Run test red**

Run: `node --test tests/desk-storage.test.mjs`

Expected: FAIL because the storage still has right-side coordinates.

- [ ] **Step 3: Implement geometry changes**

Move Fridge to `[0.35, 0, -3.2]`, set its body to `[0.66, 0.76, 0.52]`, proportionally shrink shelves/cans/door. Move SnackCabinet to `[0.35, 0.8, -3.2]`, scale its frame, shelves, food and glass door to `0.66 × 0.82 × 0.52`. Retain independent `doorRef` effects. Do not edit `src/scene/devices/Pc.tsx`.

- [ ] **Step 4: Run test green**

Run: `node --test tests/desk-storage.test.mjs`

Expected: PASS.

### Task 5: Integrated verification

- [ ] **Step 1: Run all tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests pass, zero failures.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: exit code 0.

- [ ] **Step 3: Browser checklist**

Start `npm run dev`; click left and right speaker separately to confirm one track starts/stops. Use the top control buttons to change tracks and verify title/lyrics update. Open the lower fridge and upper snack cabinet independently and verify the PC remains unchanged.
