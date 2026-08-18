import { chromium } from 'playwright'

const URL = 'http://localhost:5175'

// 触发左音响播放，等待歌词出现后截图，便于观察立体厚度。
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

// 点击左音响（世界坐标 (1, 0.92, -3.55)）
const clicked = await page.evaluate(() => {
  const scene = window.__r3f?.scene
  if (!scene) return false
  let target = null
  scene.traverse((o) => {
    if (!target && o.__r3f?.handlers?.onClick && o.type === 'Group' && Math.abs(o.position.x - 1) < 0.01 && Math.abs(o.position.y - 0.92) < 0.01 && Math.abs(o.position.z + 3.55) < 0.01) {
      target = o
    }
  })
  if (!target) return false
  target.__r3f.handlers.onClick({ stopPropagation() {}, nativeEvent: { clientX: 0, clientY: 0 }, pointer: { x: 0, y: 0 } })
  return true
})
console.log('clicked speaker:', clicked)
await page.waitForTimeout(2500)
await page.screenshot({ path: 'output/lyric-thickness-check.png' })

const info = await page.evaluate(() => ({
  isPlaying: window.__r3f?.scene?.userData?.isPlaying,
}))
console.log('isPlaying:', info)

await browser.close()
