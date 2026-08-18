# Compact Media and Novel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让桌侧储物更矮、歌词与音乐控制更清晰、鼠标和键盘更醒目，并以随机小说封面取代书籍抽出效果。

**Architecture:** 保持既有 Zustand 音乐状态；把控制台提取为独立 UI 组件，歌词组件改为单行屏幕上方文本。书架内部维护随机封面索引与展示状态，使用 Three `TextureLoader` 预加载小说封面。

**Tech Stack:** React、TypeScript、Three.js、R3F、drei、GSAP、Zustand。

## Global Constraints

- 两柜实体高度各缩短为当前一半，门朝房间中间；冰箱门外开。
- 鼠标视觉尺寸为当前 200%。
- 底部音乐控制台与顶部提示栏完全独立。
- 仅显示一行自动适配宽度的歌词；夜间青紫荧光明显。
- 书架随机展示 `public/novel/` 中一张封面，再点放回。
- `Pc.tsx` 不得修改，测试和构建通过。

---

### Task 1: Compact furniture and night accessories

**Files:** Modify `src/scene/furniture.tsx`; Test `tests/desk-storage.test.mjs`.

- [ ] Write failing assertions for 0.5 height child scales, mouse scale `[2, 2, 2]`, night keyboard RGB intensity, and signed fridge/snack door rotations.
- [ ] Run `node --test tests/desk-storage.test.mjs` and observe failure.
- [ ] Halve only cabinet child Y scale and proportionally adjust inner shelf/content positions; set fridge external door swing and snack inward swing; put mouse geometry under a `scale={[2,2,2]}` child group; make keyboard RGB strips use a stronger night-active color/intensity.
- [ ] Run focused test and `npm run build`; both pass.

### Task 2: Separate player console and single glowing lyric

**Files:** Create `src/ui/StereoConsole.tsx`; Modify `src/ui/TopInfo.tsx`, `src/scene/FloatingLyrics.tsx`, `src/App.tsx`, `src/index.css`; Test `tests/stereo-player.test.mjs`.

- [ ] Write failing tests asserting `StereoConsole`, no stereo controls in `TopInfo`, one `Text` in `FloatingLyrics`, screen-top position, adaptive `maxWidth/fontSize`, and night glow materials.
- [ ] Run `node --test tests/stereo-player.test.mjs` and observe failure.
- [ ] Render the fixed bottom console only while `isPlaying`, with previous/title/next. Restore `TopInfo` to normal `info` only. Render one current lyric above the monitor, calculate font size from `current.length`, use `maxWidth`, and add layered Text/mesh glow that strengthens in night mode.
- [ ] Run focused test and `npm run build`; both pass.

### Task 3: Random floating novel cover interaction

**Files:** Create `src/data/novels.ts`; Modify `src/scene/furniture.tsx`; Test `tests/novel-display.test.mjs`.

- [ ] Write failing test requiring all three WebP paths and a `useLoader(TextureLoader, NOVEL_COVERS)` cover display.
- [ ] Run `node --test tests/novel-display.test.mjs` and observe failure.
- [ ] Define `NOVEL_COVERS` as the three `/novel/*.webp` URLs. On first bookshelf click select `Math.floor(Math.random() * NOVEL_COVERS.length)`, animate a cover plane with line frame to float in front of/above bookshelf; on next click animate it back then hide. Do not show pages or extra text.
- [ ] Run focused test and `npm run build`; both pass.

### Task 4: Integrated validation

- [ ] Run `node --test tests/*.test.mjs` and require zero failures.
- [ ] Run `npm run build` and require exit 0.
- [ ] In browser verify: outer fridge door, independent bottom console, long lyric fit, night glow/keyboard, and book click toggle.
