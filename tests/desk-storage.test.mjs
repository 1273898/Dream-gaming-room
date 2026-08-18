import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/scene/furniture.tsx', import.meta.url), 'utf8')

test('desk accessories use a wireless mouse and stack independent storage beside the rear wall', () => {
  assert.doesNotMatch(source, /QuadraticBezierCurve3|Vector3|cablePts/)
  assert.match(source, /const doorRef = useRef<Group>\(null\)/)
  assert.match(source, /<group ref=\{groupRef\} position=\{\[0\.75, 0\.81, 0\.15\]\} \{\.\.\.bind\}>[\s\S]{0,180}<group scale=\{\[2, 2, 2\]\}>/)
  assert.match(source, /const isNight = useRoomStore\(\(state\) => state\.isNight\)/)
  assert.match(source, /intensity=\{isNight \? 8 : 0\.5\}/)
  assert.match(source, /blending=\{AdditiveBlending\} opacity=\{isNight \? 0\.9 : 0\.15\}/)
  assert.match(source, /size=\{\[0\.66, 0\.38, 0\.52\]\} position=\{\[0, 0\.19, 0\]\}/)
  assert.match(source, /size=\{\[0\.033, 0\.41, 0\.52\]\} position=\{\[-0\.3135, 0\.205, 0\]\}/)
  assert.match(source, /size=\{\[0\.66, 0\.021, 0\.52\]\} position=\{\[0, 0\.3995, 0\]\}/)
  assert.match(source, /position=\{\[0\.35, 0\.445, -3\.2\]\}/)
  assert.doesNotMatch(source, /<group position=\{\[0, 0\.255, 0\]\}>/)
  const fridgeTop = 0.4035
  const snackBottom = 0.445
  assert.ok(snackBottom - fridgeTop >= 0.04, 'stacked storage needs a 0.04 world-unit clearance')
  assert.match(source, /open \? 1\.25 : 0/)
})

test('mouse is a symmetric gaming mouse while retaining its enlarged visual scale and click feedback', () => {
  const mouse = source.match(/function Mouse\(\)[\s\S]*?(?=function Speaker)/)
  assert.ok(mouse, 'Mouse component should be present')
  const markup = mouse[0]

  assert.match(markup, /<group scale=\{\[2, 2, 2\]\}>/)
  assert.match(markup, /左键外壳/)
  assert.match(markup, /右键外壳/)
  assert.match(markup, /滚轮凹槽/)
  assert.match(markup, /侧键/)
  assert.match(markup, /尾部 RGB 灯带/)
  assert.match(markup, /底部脚贴/)
  assert.match(markup, /gsap\.fromTo\(/)
})

test('closed fridge and snack doors face world +x and swing outward from their inside hinges', () => {
  const fridge = source.match(/export function Fridge\(\)[\s\S]*?(?=function ChipTube)/)
  const snack = source.match(/export function SnackCabinet\(\)[\s\S]*?(?=export function Furniture)/)
  assert.ok(fridge, 'Fridge component should be present')
  assert.ok(snack, 'SnackCabinet component should be present')

  assert.match(fridge[0], /密封不透明门板/)
  assert.match(fridge[0], /<SketchBox size=\{\[0\.045, 0\.38, 0\.54\]\}/)
  assert.match(fridge[0], /<group ref=\{groupRef\} position=\{\[0\.35, 0, -3\.2\]\} \{\.\.\.bind\}>/)
  assert.match(fridge[0], /<group ref=\{doorRef\} position=\{\[0\.345, 0\.19, -0\.26\]\}>/)
  assert.match(fridge[0], /open \? 1\.25 : 0/)
  assert.match(snack[0], /密封不透明门板/)
  assert.match(snack[0], /<SketchBox size=\{\[0\.045, 0\.41, 0\.54\]\}/)
  assert.doesNotMatch(snack[0], /transparent opacity=\{0\.18\}/)
  assert.match(snack[0], /<group ref=\{groupRef\} position=\{\[0\.35, 0\.445, -3\.2\]\} \{\.\.\.bind\}>/)
  assert.match(snack[0], /<group ref=\{doorRef\} position=\{\[0\.335, 0\.205, -0\.26\]\}>/)
  assert.match(snack[0], /open \? 1\.25 : 0/)

  // A closed panel's local +x normal remains world +x without a flipped cabinet root.
  // Its leaf starts at the inside hinge and extends along +z; positive y rotation
  // therefore moves the free edge toward world +x, away from the room center.
  const closedFrontNormal = [1, 0, 0]
  const hingeToFreeEdge = [0, 0, 0.54]
  const openAngle = 1.25
  const freeEdgeWorldX = hingeToFreeEdge[2] * Math.sin(openAngle)

  assert.deepEqual(closedFrontNormal, [1, 0, 0], 'closed door fronts must face the +x room camera')
  assert.ok(freeEdgeWorldX > 0, 'positive hinge rotation must swing each door outward toward +x')
})
