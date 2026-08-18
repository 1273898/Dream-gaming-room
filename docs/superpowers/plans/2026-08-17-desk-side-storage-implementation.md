# 桌侧储物与氛围更新 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将机箱、桌旁零食柜/冰箱、无线鼠标、左墙海报和昼夜窗景更新为已确认的桌侧储物设计。

**Architecture:** 场景继续由现有 React Three Fiber 组件直接绘制，所有开合状态保持在对应家具组件内部。窗景采用 `TextureLoader` 加载两张本地贴图并从 Zustand 的 `isNight` 状态选择；海报继续使用现有数据驱动轮播。

**Tech Stack:** Vite 8、React 19、TypeScript、Three.js、@react-three/fiber、@react-three/drei、GSAP、Zustand。

## Global Constraints

- 保持现有黑白线稿基底与局部彩色点缀，不能新增光照依赖。
- 保留 PC 开机、昼夜开关、海报点击轮播与鼠标点击反馈。
- 零食柜与冰箱均为独立单门、独立点击开合；内部内容在门打开时可见。
- 左墙海报轮播必须包含 `微信图片_20260817152952_51_9.jpg`。
- 窗景为同构图的白天/夜晚海岸贴图，并且只由 `isNight` 控制切换。
- 验收以 `npm run build` 成功和本地浏览器手动交互检查为准。

---

## File structure

- Modify: `src/scene/Room.tsx` — 删除雷云灯；加载并渲染昼夜海岸贴图。
- Modify: `src/scene/furniture.tsx` — 无线鼠标、桌旁单门零食柜、桌旁单门冰箱及其 GSAP 开门动画。
- Modify: `src/scene/devices/Pc.tsx` — 镜像机箱可见侧透与内部组件，使玻璃面朝房间。
- Modify: `src/data/posters.ts` — 把指定图片加入左墙槽位的 `srcs`。
- Create: `public/window-view/coast-day.png` — 白天海岸窗景。
- Create: `public/window-view/coast-night.png` — 同构图夜晚海岸窗景。

### Task 1: Add paired coast-window assets and route the scene to them

**Files:**
- Create: `public/window-view/coast-day.png`
- Create: `public/window-view/coast-night.png`
- Modify: `src/scene/Room.tsx:1-115`

**Interfaces:**
- Consumes: `useRoomStore((s) => s.isNight)`.
- Produces: `WindowFrame` displays `/window-view/coast-day.png` when false and `/window-view/coast-night.png` when true.

- [ ] **Step 1: Create the two image assets**

Generate a 16:9 white-line-room-compatible coastal scene pair at 1536×864. The composition must match exactly: horizon slightly below center, distant coastline on the left, open water, light house/shore lights on the right. The day variant uses blue sky and warm sun; the night variant uses deep blue sky, moon reflection, and distant golden lights. Save the approved PNG files at the exact paths above.

- [ ] **Step 2: Replace the procedural landscape with texture rendering**

In `Room.tsx`, add these imports and use both textures inside `WindowFrame`:

```ts
import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace, TextureLoader } from 'three'

const coastTextures = useLoader(TextureLoader, ['/window-view/coast-day.png', '/window-view/coast-night.png'])
coastTextures.forEach((texture) => { texture.colorSpace = SRGBColorSpace })
const coastTexture = coastTextures[isNight ? 1 : 0]
```

Replace the existing colored `SketchPlane` plus the `!isNight` mountain/sun block and `isNight` moon/stars block with a `mesh` at the same local origin:

```tsx
<mesh position={[0, 0, 0.001]}>
  <planeGeometry args={[1.8, 1.3]} />
  <meshBasicMaterial map={coastTexture} />
</mesh>
```

Keep the window crossbars, sill and `Curtain` unchanged so they remain in front of the image.

- [ ] **Step 3: Remove the cloud lamp**

Delete `CloudLamp` and its now-unused `useMemo`, `Group`, `Mesh`, `ACCENT` imports that were exclusively required by that component. Remove `<CloudLamp />` from `Room`.

- [ ] **Step 4: Build-check the scene change**

Run: `npm run build`

Expected: TypeScript check and Vite build complete without errors.

### Task 2: Add the supplied image to the left-wall poster loop

**Files:**
- Modify: `src/data/posters.ts:37-42`

**Interfaces:**
- Consumes: `PosterImage` calls `setIndex((i) => (i + 1) % textures.length)`.
- Produces: The left-wall `PosterSlot.srcs` contains both existing image and `P('微信图片_20260817152952_51_9.jpg')`.

- [ ] **Step 1: Update the left-wall slot**

Replace the single-item `srcs` array in the third slot with:

```ts
srcs: [
  P('微信图片_20260817123341_49_9.jpg'),
  P('微信图片_20260817152952_51_9.jpg'),
],
```

- [ ] **Step 2: Verify data-driven loop behavior**

Start the development server, click the left-wall poster twice, and confirm the image sequence returns to the first picture after showing the supplied image.

### Task 3: Rebuild the desk-side storage interaction

**Files:**
- Modify: `src/scene/furniture.tsx:1-469`

**Interfaces:**
- Consumes: `useInteractive('fridge', ...)`, `useInteractive('snack', ...)`, `SketchBox`, `SketchCylinder`, `SketchLine`, `Ring`, and GSAP.
- Produces: `Fridge` and `SnackCabinet` each render a single hinged door, animate `doorRef.current.rotation.y` between `0` and a signed 1.25 radian open state, and occupy the desk-side positions.

- [ ] **Step 1: Make the mouse wireless**

Remove `QuadraticBezierCurve3` and `Vector3` imports, delete `cablePts`, and delete the final cable `<SketchLine>`. Keep the body, button split, wheel, LED state, `useInteractive('mouse')`, and GSAP scale bounce intact.

- [ ] **Step 2: Implement the single-door refrigerator**

Replace the two `leftRef`/`rightRef` groups with one `doorRef = useRef<Group>(null)`. In the effect, use:

```ts
gsap.to(doorRef.current.rotation, {
  y: open ? -1.25 : 0,
  duration: 0.85,
  ease: 'power3.inOut',
})
```

Render the body at `[3.98, 0, -2.7]` with `rotation={[0, Math.PI, 0]}`, size `[0.74, 1.48, 0.62]`, two interior shelves and six existing `Can` instances. Parent the door at its left edge, render an opaque `SketchBox` door and a vertical handle, so it hides cans when closed and swings toward room center when open.

- [ ] **Step 3: Implement the glass-door snack cabinet**

Add `open` state and `doorRef` to `SnackCabinet`; change its activation to `setOpen((value) => !value)`. Use the same `useEffect` GSAP pattern with `y: open ? 1.25 : 0`. Place the cabinet at `[3.12, 0, -2.7]` with `rotation={[0, Math.PI, 0]}`. Retain the existing three shelf levels and chip contents, then add a door group pivoted on the outer edge containing a thin transparent `<mesh>` (`transparent`, `opacity={0.18}`, `depthWrite={false}`), `Edges`, and a `SketchBox` handle. The transparent closed door must remain in front of all chips.

- [ ] **Step 4: Verify open/closed interaction**

Start `npm run dev`, click each storage unit once from the desk-side view, then again to close it. Confirm: the snack cabinet shows chip bags/tubes, the fridge shows colored cans, and no door crosses the chair or PC.

### Task 4: Mirror the PC side panel toward the room

**Files:**
- Modify: `src/scene/devices/Pc.tsx:48-112`

**Interfaces:**
- Consumes: `powerOn`, `hovered`, `lit`, `CaseFan`, `RgbStrip`.
- Produces: The opaque side moves to `+x`; the transparent glass panel and visible internal parts move to `-x`, while front fans remain at `+z`.

- [ ] **Step 1: Mirror X-axis internals and side panels**

In `Pc`, move the solid left-side panel from `x=-0.19` to `x=0.19`. Change the glass plane from `x=0.211` to `x=-0.211`. Negate the X positions of the motherboard, CPU fan, GPU, memory sticks, PSU and RGB strip so they sit behind the new glass rather than behind the solid side panel. Keep Y/Z coordinates and all power animation state unchanged.

- [ ] **Step 2: Validate PC behavior**

Run `npm run dev`, orbit so the room-facing side is visible, click the PC, and confirm the front fan rotation and RGB strip still activate while the components remain visible through glass.

### Task 5: Run integrated validation

**Files:**
- Verify only: `src/scene/Room.tsx`, `src/scene/furniture.tsx`, `src/scene/devices/Pc.tsx`, `src/data/posters.ts`, `public/window-view/coast-day.png`, `public/window-view/coast-night.png`

**Interfaces:**
- Consumes: all tasks above.
- Produces: a buildable scene that fulfils the confirmed specification.

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: process exits with code 0; no TypeScript errors and `dist/` is generated.

- [ ] **Step 2: Run manual end-to-end scene checklist**

Run `npm run dev` and verify each condition in one browser session:

1. The left-wall cloud lamp is absent.
2. The supplied poster appears on the second click of the left-wall frame and loops back on the third click.
3. The day/night wall switch exchanges the full coastal image rather than procedural line art.
4. The mouse has no cable and still lights/bounces when clicked.
5. Each desk-side door opens and closes independently, revealing only its intended snack/can contents.
6. The PC's room-facing side is transparent and its powered internal RGB animation is visible.

- [ ] **Step 3: Record verification**

Add the executed commands and pass/fail outcomes to the task handoff message. Do not create a Git commit because this workspace does not contain an active Git repository.
