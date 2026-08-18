import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('novel data exposes the three supplied WebP cover paths', () => {
  const novels = readFileSync(new URL('../src/data/novels.ts', import.meta.url), 'utf8')

  assert.match(novels, /\/novel\/05485d6d1dbe7693c1ed791b78ea917d\.webp/)
  assert.match(novels, /\/novel\/OIP\.webp/)
  assert.match(novels, /\/novel\/OIP \(1\)\.webp/)
  assert.match(novels, /export const NOVEL_COVERS/)
})

test('bookshelf loads and toggles one textured physical floating novel book', () => {
  const furniture = readFileSync(new URL('../src/scene/furniture.tsx', import.meta.url), 'utf8')

  assert.match(furniture, /useLoader\(TextureLoader, NOVEL_COVERS\)/)
  assert.match(furniture, /Math\.floor\(Math\.random\(\) \* NOVEL_COVERS\.length\)/)
  assert.match(furniture, /<boxGeometry args=\{\[0\.06, 0\.66, 0\.44\]\}/)
  assert.match(furniture, /<planeGeometry args=\{\[0\.44, 0\.66\]\}/)
  assert.match(furniture, /<meshBasicMaterial map=\{textures\[selectedCover\]\}/)
  assert.match(furniture, /<Edges[^>]*\/>/)
  assert.match(furniture, /selectedCover !== null/)
  assert.doesNotMatch(furniture, /被抽出的那本/)
})
