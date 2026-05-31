import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const src = `${root}/design/source-icon.svg`
const outDir = `${root}/public/icons`

await mkdir(outDir, { recursive: true })

const targets = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 512, name: 'icon-512-maskable.png' },
  { size: 180, name: 'apple-touch-icon.png' },
]

for (const t of targets) {
  const file = `${outDir}/${t.name}`
  await sharp(src)
    .resize(t.size, t.size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(file)
  console.log(`✓ ${t.name}  ${t.size}x${t.size}`)
}
