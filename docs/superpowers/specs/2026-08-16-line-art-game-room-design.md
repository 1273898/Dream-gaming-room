# 线稿游戏房 · 设计文档

日期：2026-08-16
参考项目：[Animnia/pure-line-room](https://github.com/Animnia/pure-line-room)

## 概念

"既然现实中还没有属于自己的游戏房，那就先搭建一个虚拟的。"
一个可自由环视的 3D 线稿游戏房：大部分黑白线稿，仅重点设备带颜色点缀（颜色 = 可交互暗示）。点击设备镜头飞入聚焦，展示设备故事、梦想配置与游戏收藏。

## 技术栈

| 技术 | 职责 |
|---|---|
| Vite + React + TypeScript | 工程基础 / 页面与信息 UI |
| three | 3D 底层 |
| @react-three/fiber | React ↔ Three.js |
| @react-three/drei | Edges / Line / OrbitControls 等 |
| zustand | focusedDevice / phase / hovered 全局状态机 |
| GSAP | 镜头动画 / 设备展开 / 进入动画 |

## 视觉风格

- **基底**：白面（`meshBasicMaterial` 白色 + polygonOffset）+ 黑线（drei `<Edges>` 提取硬边 + 手工 `Line` 曲线补细节），无光照无阴影，扁平矢量感
- **局部上色**：仅 4 个可聚焦设备带颜色点缀；海报是唯一的例外（用户供图）
- 其余所有家具/墙面/装饰保持纯黑白

## 房间布局（约 10×8×6）

| 区域 | 内容 |
|---|---|
| 电竞角 | 书桌、显示器、键盘、PC 主机、电竞椅 |
| 主机区 | 超大电视（挂墙，视觉中心）+ 置物架 + 游戏主机、地毯、懒人沙发 |
| 氛围区 | 海报墙（3-4 个画框位）、书架 + 游戏盒、窗户、盆栽（全黑白，不可聚焦） |

## 可聚焦设备（4 个，上色）

1. **PC 主机**：RGB 灯条点缀；聚焦时侧板滑开露内部线稿
2. **显示器**：屏幕微亮
3. **游戏主机 + 超大电视**：点击电视或主机都聚焦"主机游戏站"组；电视屏幕可作游戏收藏展示画布
4. **手柄**：按键上色；聚焦时悬浮旋转

## 交互状态机

```
进入动画 → 自由环视 ⇄ 设备聚焦 → 返回
```

- **进入**：GSAP 镜头从远处推入房间
- **自由环视**：OrbitControls（限制俯仰角/距离，不穿墙不出屋）
- **悬停设备**：描边高亮 + 光标 pointer
- **点击设备**：Zustand 写 `focusedDevice` → GSAP 镜头飞到该机位预设点（禁用 Controls）→ 设备展开动画 → React 信息面板右侧滑出
- **面板内容**：设备故事 + 梦想配置清单 + 游戏收藏（封面格子 + 链接）
- **关闭**：面板收回，镜头拉回自由视角，恢复 Controls

## 海报系统

- 墙上预留多个海报框位（黑白线稿画框）
- 图片放 `public/posters/`，在 `src/data/posters.ts` 配置路径即可张贴/更换
- 未供图前用占位灰框

## 代码结构

```
src/
├── scene/
│   ├── Room.tsx          # 墙/地板/窗/地毯等外壳
│   ├── furniture/        # 桌椅架等黑白家具
│   ├── devices/          # 4 个上色设备（PC / Monitor / ConsoleStation / Gamepad）
│   ├── linework.tsx      # 线稿渲染基础设施（描边组件封装）
│   └── Effects.tsx       # 悬停高亮等
├── store/index.ts        # Zustand：focusedDevice / phase / hovered
├── data/devices.ts       # 设备数据（故事/配置/游戏收藏）
├── data/posters.ts       # 海报配置
├── ui/                   # InfoPanel / Title / Hint
└── camera/CameraRig.tsx  # GSAP 镜头动画控制
```

## 范围外（后续迭代）

- 音效系统、昼夜反色、灯光裁剪等参考项目的进阶特性
- 更多房间/多房间切换

## 验收标准

- `npm run dev` 可运行，`npm run build` 通过，类型检查无错误
- 进入动画 → 自由环视 → 点击 4 个设备均可聚焦并弹出对应面板 → 可返回
- 整体黑白线稿，仅设备与海报有颜色
