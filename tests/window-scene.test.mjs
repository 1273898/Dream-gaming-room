import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const root = new URL('..', import.meta.url)
const projectPath = (path) => new URL(path, root)

test('window scene uses paired coast images and no cloud lamp', () => {
  assert.equal(existsSync(projectPath('public/window-view/coast-day.png')), true)
  assert.equal(existsSync(projectPath('public/window-view/coast-night.png')), true)

  const room = readFileSync(projectPath('src/scene/Room.tsx'), 'utf8')
  assert.match(room, /\/window-view\/coast-day\.png/)
  assert.match(room, /\/window-view\/coast-night\.png/)
  assert.doesNotMatch(room, /function CloudLamp/)
})
