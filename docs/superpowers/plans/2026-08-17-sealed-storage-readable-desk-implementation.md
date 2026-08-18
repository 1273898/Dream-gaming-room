# Sealed Storage and Readable Desk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复柜门密闭与方向、歌词朝向/厚度/首次播放闪动，并重做可辨识的对称电竞鼠标及有厚度的小说展示。

**Architecture:** 家具继续在 `furniture.tsx` 内管理 GSAP 门动画；歌词组件改用 drei 的 `Text3D` 并在首次交互前预加载其字体资源。小说展示从单平面换为带封面贴图的薄书盒。

**Tech Stack:** React、TypeScript、Three.js、R3F、drei、GSAP、Zustand。

## Global Constraints

- 两个柜关闭时内部完全不可见，门面朝房间中心，均由内向外打开。
- 歌词为单行、显示器正上方、正对椅子、具有 depth；长句完整显示，夜间明显发光。
- 首次点音响不得因歌词字体资源延迟造成 Canvas 可见重载。
- 鼠标是当前两倍大小的对称无线电竞鼠标。
- 抽出小说必须有实体书厚度，保留随机封面与放回。
- `Pc.tsx` 不修改；所有测试和构建通过。

---

### Task 1: Seal outward-opening storage and redesign the mouse

**Files:** Modify `src/scene/furniture.tsx`; Test `tests/desk-storage.test.mjs`.

- [ ] Write failing tests asserting opaque full door meshes, same outward rotation sign, and mouse parts for two buttons, wheel channel, side keys, RGB strip, skids.
- [ ] Run `node --test tests/desk-storage.test.mjs` and observe failure.
- [ ] Replace transparent snack glass with opaque front slab, orient both door pivots to room center and animate both outward; rebuild Mouse inside its existing 2× visual child with split shells, wheel recess, buttons, underglow and skids.
- [ ] Run focused test and `npm run build` successfully.

### Task 2: Preloaded extruded monitor lyrics

**Files:** Create `src/scene/LyricFontPreload.tsx`; Modify `src/scene/FloatingLyrics.tsx`, `src/App.tsx`; Test `tests/stereo-player.test.mjs`.

- [ ] Write failing assertions for `preloadFont`, `Text3D`, nonzero `height`, monitor-above position, chair-facing zero/straight rotation, and adaptive size.
- [ ] Run `node --test tests/stereo-player.test.mjs` and observe failure.
- [ ] Preload the chosen local/public font with drei before interaction. Render only current line as `Text3D` with `height: 0.03`, center it above the monitor facing the chair, and place a glow mesh behind it. Keep an adaptive font-size/max-width fallback so long text fits.
- [ ] Run focused tests and build successfully.

### Task 3: Make the random novel cover a physical book

**Files:** Modify `src/scene/furniture.tsx`; Test `tests/novel-display.test.mjs`.

- [ ] Write failing assertion for a textured front cover plus thin `boxGeometry` book body.
- [ ] Run `node --test tests/novel-display.test.mjs` and observe failure.
- [ ] Replace floating plane with a thin book box, map selected texture to a front cover plane, retain line frame and existing random/show-return animation.
- [ ] Run focused test and build successfully.

### Task 4: Full verification

- [ ] Run `node --test tests/*.test.mjs` with zero failures.
- [ ] Run `npm run build` with exit code 0.
- [ ] Verify browser first speaker click has no Canvas flash; inspect both closed/open cabinet states, 3D lyric, mouse and book return interaction.
