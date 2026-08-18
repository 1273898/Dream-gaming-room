# 用 React Three Fiber 搭一间"线稿游戏房"——Three.js 小白也能看懂的入门分享

> 前阵子做了一个有意思的小项目：一间可以用鼠标逛来逛去、能开灯关灯、还能撸猫的 3D 小房间。整个房间是"线稿"风格，就像一本立体漫画书。这篇文章想把这次折腾中我对 three.js 的理解，用大白话讲给你听。

---

## 1. 这间房间是怎么来的？

先看下这个项目用了哪些"积木"（`package.json`）：

```json
{
  "dependencies": {
    "@react-three/drei": "^10.7.8",
    "@react-three/fiber": "^9.7.0",
    "gsap": "^3.15.0",
    "react": "^19.2.8",
    "three": "^0.185.1",
    "zustand": "^5.0.15"
  }
}
```

看不懂没关系，简单说就是：

- **three.js**：真正干活的 3D 引擎，相当于"汽车发动机"。
- **React Three Fiber（R3F）**：让 three.js 能用 React 的方式来写，相当于"方向盘和仪表盘"——发动机还是那个发动机，但操作变舒服了。
- **drei**：R3F 的"官方配件商城"，里面有很多现成组件，比如后面会用到的轨道相机。
- **gsap**：做动画的，负责让东西"动起来有弹性"。
- **zustand**：管理全局状态的，比如"现在是白天还是黑夜"。

总之，这套组合拳让写 3D 网页像写普通 React 页面一样轻松。

---

## 2. 3D 世界的"铁三角"：场景、相机、渲染器

three.js 最核心的东西，其实就三句话：

> **搭一个舞台（场景），架一台摄影机（相机），让摄像机把画面拍下来显示到屏幕上（渲染器）。**

- **场景（Scene）**：一个装 3D 物体的"大盒子"，房间里所有东西都放这里面。
- **相机（Camera）**：决定"从哪个角度看"。我们用的是透视相机，模拟人眼，近大远小。
- **渲染器（Renderer）**：每帧把"镜头里看到的画面"画到网页上，就像拍照。

如果用原生 three.js，这些全要自己写：

```js
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
camera.position.set(13, 9, 15)
const renderer = new THREE.WebGLRenderer({ antialias: true })

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
animate()
```

而在 R3F 里，一个 `<Canvas>` 就把上面这些全包办了。项目里是这样的：

```tsx
<Canvas camera={{ fov: 40, position: [13, 9, 15], near: 0.1, far: 100 }}>
  <SceneBackground />
  <CameraRig />
  <Room />
  <Furniture />
  <Posters />
  <Devices />
  <Cat />
</Canvas>
```

你只需要像列清单一样，说"场景里有什么"就行，不用管引擎内部怎么运转。这就像点外卖：你不用自己买菜做饭，选好菜，厨房自然帮你做好端上来。

几个相机小参数也顺带说一下：

- **fov（40）**：视角大小。40° 比较接近人眼习惯，太大像广角镜头，太小像望远镜。
- **position（[13, 9, 15]）**：相机站的位置。这里是"斜上方俯视"，所以一进来就能看到房间全貌。
- **near / far**：相机能看到的"最近 / 最远"距离，超出这个范围的就不渲染了。

---

## 3. 搭积木：几何体 + 材质 = 一个物体

在 three.js 里，任何你能看到的东西，本质都是一块"几何体 + 材质"的组合：

- **几何体（Geometry）**：形状，比如方块、圆球、圆柱。决定"长什么样"。
- **材质（Material）**：皮肤，比如颜色、透明度。决定"用什么颜色画"。

你可以把 3D 建模想象成捏橡皮泥：几何体是泥的形状，材质是涂上去的颜色。

原生写法是这样：

```js
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: '#ffffff' })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
```

项目里 R3F 的写法（`linework.tsx`）就简洁多了：

```tsx
<mesh position={position} rotation={rotation}>
  <boxGeometry args={size} />
  <meshBasicMaterial color={fill ?? t.fill} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
  {children}
</mesh>
```

`args` 就是"构造参数"，`<boxGeometry args={[1, 2, 3]} />` 相当于 `new THREE.BoxGeometry(1, 2, 3)`——长、宽、高。

再举个例子，项目里的键盘（`furniture.tsx`），它其实是一块板 + 几条线 + 一条灯带拼起来的：

```tsx
<group ref={groupRef} position={[-0.45, 0.81, 0.15]} {...bind}>
  <SketchBox size={[0.9, 0.03, 0.32]} />
  {[-0.1, -0.02, 0.06, 0.13].map((z) => (
    <SketchLine key={z} points={[[-0.4, 0.017, z], [0.4, 0.017, z]]} />
  ))}
  <RgbStrip size={[0.9, 0.028]} position={[0, 0, 0.163]} rotation={[0, 0, 0]} active={rgbOn} speed={0.5} />
</group>
```

这里有个很重要的概念叫 **Group（组）**：它就像一个"集装箱"，把一组物体打包起来。整个集装箱可以一起移动、旋转、缩放，里面的东西相对它来摆位置。

为什么这很妙？举个栗子：窗帘分左、右两片，把每片都放进自己的"集装箱"，开合动画只需要让集装箱左右移动，两片帘子就整体跟着走了。省事又不会乱。

---

## 4. 线稿风格的秘密：就两招

这间房间最有特色的就是"线稿"（素描）风，像漫画底稿。实现起来其实就两招：

1. **用不计算光照的材质**：普通 3D 要打光才有立体感，这里故意不用，颜色是啥就是啥，画面干净得像白纸上的线稿。
2. **给几何体描边**：把立方体、圆柱的"棱角边"用线画出来。立体感全靠这些边线撑着。

看代码（`linework.tsx` 里的 `SketchBox`）：

```tsx
export function SketchBox({ size, position, rotation, fill, edge, children }) {
  const t = useTheme()
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshBasicMaterial
        color={fill ?? t.fill}
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
      <Edges threshold={20} color={edge ?? t.line} />
      {children}
    </mesh>
  )
}
```

- **`<Edges>`**：就是"描边器"，自动找出几何体的棱边画上线。`threshold` 是"多尖的角才描边"的阈值。方块每个角都是 90°，全都会描；而圆柱的侧面很圆滑，夹角太小，就不会被描——所以你看到圆柱只有顶面、底面的圆圈轮廓，侧面干干净净。
- **`polygonOffset`**：这个技术名词你可能听过叫"深度冲突"（z-fighting）。简单说，如果描边和填充面几乎贴在同一平面上，显卡会纠结"谁在前面"，导致画面闪来闪去。`polygonOffset` 就是让填充面"稍微退后一丁点"，描边稳稳地盖在上面，就不打架了。

还有个小细节：**圆是怎么画出来的？** 其实不是真圆，是用很多小线段拼的：

```tsx
export function circlePoints(radius: number, segments = 48): V3[] {
  const pts: V3[] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push([Math.cos(a) * radius, Math.sin(a) * radius, 0])
  }
  return pts
}
```

`segments` 越大，圆越光滑。**所有 3D 里的"圆"，本质都是多边形**——只不过顶点够多，肉眼看不出来而已。

---

## 5. 贴图：让平面不再是平面

three.js 里给物体"贴画"靠的是**纹理（Texture）**。这个项目展示了两种玩法：

### 玩法一：用 Canvas 现画一张会动的"电视屏幕"

电视屏幕上那个跑酷小游戏，其实是拿 `Canvas`（网页画布）一帧一帧画出来，再贴到电视平面上的（`GameScreen.tsx`）：

```tsx
const { texture, ctx } = useMemo(() => {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  drawFrame(ctx, 0)
  const texture = new CanvasTexture(canvas)
  return { texture, ctx }
}, [])

useFrame((_, delta) => {
  acc.current += delta
  if (acc.current < 0.08) return // 约 12fps 就够
  time.current += acc.current
  acc.current = 0
  drawFrame(ctx, time.current)
  texture.needsUpdate = true
})
```

几个心得：

- 画完之后必须标记 `texture.needsUpdate = true`，不然画面更新不了——这是新手最容易踩的坑（反正我踩过）。
- 电视画面降到约 12fps 就够了，人眼看不出区别，但 CPU 省了一半力气。能省则省。
- **只要能在 Canvas 上画出来的东西，都能变成 3D 物体的贴图**，这是免费的"任意屏幕内容"方案。

### 玩法二：让贴图自己"流动"

键盘、机箱上的 RGB 灯带，是用一条彩虹渐变贴图，然后让它在平面上不停"滑动"实现的（`RgbStrip.tsx`）：

```tsx
const tex = new CanvasTexture(canvas)
tex.wrapS = RepeatWrapping   // 允许左右平铺

useFrame((_, delta) => {
  if (activeRef.current) texture.offset.x -= delta * speed
})
```

原理超简单：一条 128×8 的细长彩虹，设置成可以平铺，然后每帧把它的位置往左挪一点点——流光效果就出来了。**不用重新画，只改一个数字，成本几乎为零。**

### 玩法三：贴图片（海报）

海报就是用 three.js 自带的图片加载器（`Posters.tsx`）：

```tsx
const texture = useLoader(TextureLoader, src)
return (
  <mesh position={[0, 0, 0.012]}>
    <planeGeometry args={size} />
    <meshBasicMaterial map={texture} />
  </mesh>
)
```

`useLoader` 帮你处理"加载中 / 加载完"，`map` 就是"贴哪张图"。一句话：**图片或 Canvas → 变成纹理 → 贴到材质上 → 出现在画面里。**

---

## 6. 让房间"活"起来：两种动画思路

一个死气沉沉的房间没意思。项目里用了两种互补的动画方式：

### 思路一：useFrame——每帧都在执行的"心跳"

`useFrame` 里的代码，每一帧（每秒约 60 次）都会执行。适合"一直在动"的东西，比如灯带流动。

```tsx
useFrame((_, delta) => {
  if (activeRef.current) texture.offset.x -= delta * speed
})
```

注意那个 `delta`：它是"上一帧到现在过了多少秒"。为什么要用它？因为不同电脑帧率不同，如果你写"每帧移动 0.01"，那 120Hz 的电脑会比 60Hz 的快一倍。用 `delta` 才能保证"每秒动多少"一样——**动画快慢不该被帧率绑架**。

### 思路二：GSAP——"把 A 变成 B"的补间动画

`useFrame` 适合持续运动，但"从 A 移到 B、带弹性、带节奏"这类动画，用 GSAP 一句话就搞定：

```tsx
gsap.to(leftRef.current.position, { x: -target, duration: 1, ease: 'power3.inOut' })
```

翻译成人话：**"把左边窗帘的位置 x，在 1 秒内平滑移到 -target，速度是慢-快-慢。"**

GSAP 特别适合配 three.js，因为 3D 物体的位置、旋转、缩放都是普通对象属性，GSAP 直接就能操控。

举几个项目里好玩的例子：

**开合窗帘**——改父 group 的 `position.x` 和 `scale.x`：

```tsx
useEffect(() => {
  const target = open ? 0.92 : 0.24
  const scale = open ? 0.3 : 1
  if (leftRef.current) {
    gsap.to(leftRef.current.position, { x: -target, duration: 1, ease: 'power3.inOut' })
    gsap.to(leftRef.current.scale, { x: scale, duration: 1, ease: 'power3.inOut' })
  }
}, [open])
```

**闪电**——把闪电形状来回快速放大缩小几次，就"闪"起来了：

```tsx
const tl = gsap.timeline()
for (let i = 0; i < 3; i++) {
  tl.to(boltRef.current.scale, { x: 1.5, y: 1.5, duration: 0.06 })
    .to(boltRef.current.scale, { x: 1, y: 1, duration: 0.06 })
    .to(boltRef.current.scale, { x: 1.3, y: 1.3, duration: 0.05 })
    .to(boltRef.current.scale, { x: 1, y: 1, duration: 0.12 })
}
```

**小猫散步**——每次随机挑个位置，先转身（用 `Math.atan2` 算出朝哪个方向），再匀速走过去，走完停一会儿继续走，无限循环：

```tsx
const walk = () => {
  if (!alive || !groupRef.current) return
  const { x, z } = randomSpot()
  const dx = x - g.position.x
  const dz = z - g.position.z
  const dist = Math.hypot(dx, dz)
  gsap.to(g.rotation, { y: Math.atan2(dx, dz), duration: 0.3, ease: 'power2.out' })
  gsap.to(g.position, {
    x, z,
    duration: dist / 0.7,  // 路程 / 速度 = 时长，保证匀速
    ease: 'none',
    delay: 0.25,
    onComplete: () => {
      gsap.delayedCall(0.8 + Math.random() * 2.5, walk)  // 走完歇会儿再走
    },
  })
}
gsap.delayedCall(1.5, walk)
```

**猫的身体呼吸 + 尾巴摇**，靠的是 `yoyo`（往返）+ `repeat: -1`（无限循环）：

```tsx
const bob = gsap.to(g.scale, { y: 0.96, duration: 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' })
const wag = gsap.to(tailRef.current.rotation, { x: 0.5, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' })
```

---

## 7. 鼠标点得中它：3D 里的"点击"是怎么回事

网页里点按钮，浏览器告诉你"你点了这个按钮"。3D 世界里呢？背后的原理叫**射线拾取（Raycaster）**：

> 想象从相机镜头射出一根看不见的"激光笔"，穿过鼠标所在的位置一直往前，碰到哪个物体，就算点到谁。

R3F 把这事封装成了熟悉的 `onClick`、`onPointerOver`，用起来和普通 React 差不多。项目里写了个通用钩子（`useInteractive.ts`）：

```tsx
export function useInteractive(key: keyof typeof INFOS, onActivate?: () => void) {
  const groupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const showInfo = useRoomStore((s) => s.showInfo)

  useCursor(hovered)

  useEffect(() => {
    if (!groupRef.current) return
    gsap.to(groupRef.current.scale, {
      x: hovered ? 1.04 : 1,
      y: hovered ? 1.04 : 1,
      z: hovered ? 1.04 : 1,
      duration: 0.35,
      ease: 'power2.out',
    })
  }, [hovered])

  const bind = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      setHovered(true)
    },
    onPointerOut: () => setHovered(false),
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      const info = INFOS[key]
      showInfo({ key, title: info.title, text: info.text })
      onActivate?.()
    },
  }

  return { groupRef, hovered, bind }
}
```

这套钩子帮我们解决了三个小问题：

1. **鼠标移上去时**：物体轻微放大一点（1.04 倍），鼠标变成小手，给人"这能点"的暗示。
2. **点击时**：弹出介绍文字，还能顺便触发动画。
3. **`stopPropagation()`**：防止点击事件"传错人"（和 DOM 冒泡一个道理，比如点猫别把身后的墙也点着了）。

还有个很实用的技巧叫**隐形命中盒**：有些东西太小太难点中，比如墙上的电灯开关。解决办法是——在它前面放一个透明的、更大的"替身"来接住点击：

```tsx
{/* 隐形代理点击盒（开关太小，扩大可点区域） */}
<mesh position={[0, 0, 0.15]}>
  <boxGeometry args={[0.7, 0.9, 0.3]} />
  <meshBasicMaterial colorWrite={false} depthWrite={false} />
</mesh>
```

`colorWrite={false}` 就是"不画它"，`depthWrite={false}` 是"别挡住后面的东西"。射线照样能碰到它，但你完全看不见——点击面积悄悄变大了好几倍。

---

## 8. 逛房间：相机的"云台"与入场镜头

进了房间总不能呆呆地看一个方向吧。three.js 里有个现成的 **OrbitControls（轨道控制器）**，实现了 3D 场景最经典的"逛法"：

- **左键拖拽**：环绕房间旋转视角
- **滚轮**：拉近拉远
- **右键拖拽**：平移

项目里给它加了一堆限制（`CameraRig.tsx`）：

```tsx
<OrbitControls
  ref={controlsRef}
  makeDefault
  enabled={entered}
  enableDamping
  dampingFactor={0.08}
  enablePan={false}
  minDistance={2.5}
  maxDistance={11}
  minPolarAngle={0.35}
  maxPolarAngle={Math.PI * 0.49}
/>
```

几个参数直白翻译：

- **enableDamping**：开启"惯性"，松手后视角还会缓缓滑一下，手感丝滑不僵硬。
- **min/maxDistance**：相机和房间的最小/最大距离，防止怼进墙里或退到房间外面。
- **maxPolarAngle**：仰角上限，等于"永远不钻到地板下面去"。

最有仪式感的是**入场镜头**：一进来，相机从高空缓缓俯冲到房间门口，像无人机降落：

```tsx
const HOME_POSITION: [number, number, number] = [6.2, 4.0, 7.8]
const HOME_TARGET: [number, number, number] = [0, 1.0, -1]

useEffect(() => {
  const controls = controlsRef.current
  if (!controls) return
  camera.position.set(13, 9, 15)          // 先从很高的位置开始
  controls.target.set(...HOME_TARGET)
  const tween = gsap.to(camera.position, {
    x: HOME_POSITION[0],
    y: HOME_POSITION[1],
    z: HOME_POSITION[2],
    duration: 2.6,
    ease: 'power3.inOut',
    onUpdate: () => controls.update(),     // 每帧同步控制器
    onComplete: () => setEntered(true),    // 飞完才解锁鼠标操作
  })
  return () => tween.kill()
}, [])
```

两个细节很关键：

- 动画过程中每帧都要调 `controls.update()`，不然动画结束后视角会"啪"地跳回原样。
- 用一个 `entered` 状态锁住操作权限，入场动画播完之前鼠标拖不动视角——保证观影体验不被手滑打断。

**相机本身就是讲故事的镜头。** 从俯瞰到近身，这个"推镜"瞬间就把玩家拉进了场景里。

---

## 9. 白天黑夜一键切换：状态管理的妙用

这间房间有个核心玩法：**点墙上的开关，整个房间从白天变成黑夜**，所有配色跟着换。

这个"现在几点"的状态存在 zustand 里（`store/index.ts`）：

```tsx
export const useRoomStore = create<RoomState>((set) => ({
  isNight: false,
  toggleNight: () => set((s) => ({ isNight: !s.isNight })),
  info: null,
  showInfo: (info) => set({ info }),
  clearInfo: () => set({ info: null }),
}))
```

然后定义一个"白天配色"和"黑夜配色"（`linework.tsx`）：

```tsx
export const DAY: Theme = {
  line: '#1a1a1a',   // 描边（黑色）
  fill: '#ffffff',   // 填充（白色）
  dim: '#c8c8c8',
  dimmer: '#dcdcdc',
  bg: '#fafafa',
}

export const NIGHT: Theme = {
  line: '#e8e8ee',   // 描边（浅灰白）
  fill: '#26262e',   // 填充（深蓝灰）
  dim: '#565660',
  dimmer: '#3c3c46',
  bg: '#121218',
}

export function useTheme(): Theme {
  const isNight = useRoomStore((s) => s.isNight)
  return isNight ? NIGHT : DAY
}
```

妙就妙在：**所有"线稿组件"都通过 `useTheme()` 拿当前配色**。所以当 `isNight` 一变，全屋子的墙壁、家具、描边颜色自动全部跟着换，不需要任何一处手动改颜色。一个状态，驱动整个视觉体系。

开关的拨杆也跟着动，用 zustand 的 `subscribe` 监听状态变化：

```tsx
useEffect(() => {
  const unsub = useRoomStore.subscribe((s) => {
    if (leverRef.current) {
      gsap.to(leverRef.current.rotation, { z: s.isNight ? -0.5 : 0.5, duration: 0.25, ease: 'power2.out' })
    }
  })
  return unsub
}, [])
```

点开关 → 状态变 → 通知 → 拨杆拨过去。闭环完成。

连窗外的景色也是"状态驱动"的：白天是蓝天、小山、太阳；晚上是深蓝、月亮、星星——同一面墙，根据时间渲染不同的景色。**3D 场景和普通 React 页面一样，可以"根据状态换内容"。**

---

## 10. 一些让项目更舒服的小习惯

最后分享几个这次的实践心得，不算高深，但挺实用：

1. **动画能省帧就省帧**：电视画面 12fps 就够，CPU 省一半。
2. **昂贵资源只建一次**：画布、纹理这些放进 `useMemo`，别在每次渲染时重建。
3. **不用外部模型，全用积木拼**：整间屋子没有下载任何 3D 模型文件，全部是方块、圆柱、平面、线条拼出来的。好处是：代码即模型，随时能改；渲染负担小，弱电脑也跑得动。
4. **代码分工清晰**：

```
src/
  App.tsx            # 组装整个 Canvas 场景
  camera/CameraRig   # 相机与镜头动画
  scene/             # 场景内容：房间、家具、设备、猫、线稿组件
  ui/                # 界面层（文字气泡、操作提示），盖在 3D 画面上面
  data/              # 物品介绍、海报配置等数据
  store/             # 全局状态（白天黑夜等）
```

特别提一下 `scene` 和 `ui` 的分工：**3D 画面归 Canvas，界面文字归普通 DOM**，两者通过 zustand 沟通。各干各的，互不打扰。

---

## 11. 写在最后

把整个项目过一遍，你会发现 three.js 并没有想象中那么神秘，核心其实就是这几个词：

| 项目里的东西 | 背后其实是 |
|------------|-----------|
| `<Canvas>` | 场景 + 相机 + 渲染器 |
| `<mesh>` + `<boxGeometry>` | 几何体 + 材质 |
| `<group>` | 打包物体的"集装箱" |
| `<Edges>` | 给棱角描边 |
| CanvasTexture / 图片贴图 | 给平面贴"画" |
| `useFrame` + GSAP | 动画的两种玩法 |
| `onClick` | 从相机射出去的"激光笔" |
| OrbitControls | 逛 3D 场景的标准操作 |
| zustand 的 `isNight` | 一套状态，全屋换装 |

最陡的学习曲线其实不在 API 本身，而在**"三维思维"**——怎么把坐标摆对、父子关系怎么组织、动画怎么才自然。这些光看文档是学不会的，得真的动手做一个小项目，把坑都踩一遍。

这间"线稿游戏房"就是个特别好的练手项目：它不大，但几乎涵盖了 3D 网页会遇到的所有核心问题。如果你也想学 three.js，强烈建议找个这样的小目标，边做边学。

理解了它，你就已经拿到了 3D 世界的地图。剩下的，就是去探险了。

---

*本文基于 `line-game-room` 项目源码整理。技术栈：Three.js r0.185 / React Three Fiber v9 / drei v10 / GSAP 3 / zustand 5。*
