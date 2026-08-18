import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('left poster loop includes the supplied image', () => {
  const posters = readFileSync(new URL('../src/data/posters.ts', import.meta.url), 'utf8')
  assert.match(posters, /P\('微信图片_20260817152952_51_9\.jpg'\)/)
})

test('pc glass and internals are mirrored to the negative x side', () => {
  const pc = readFileSync(new URL('../src/scene/devices/Pc.tsx', import.meta.url), 'utf8')
  assert.match(pc, /position=\{\[0\.19, 0\.45, 0\]\}/)
  assert.match(pc, /position=\{\[-0\.211, 0\.45, 0\]\}/)
  assert.match(pc, /position=\{\[0\.13, 0\.46, 0\]\}/)
})
