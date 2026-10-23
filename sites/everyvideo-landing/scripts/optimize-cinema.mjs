import sharp from 'sharp'
import { stat } from 'node:fs/promises'

for (const [name, widths] of Object.entries({ 'cinema-hero': [768, 1536], 'cinema-audio': [768] })) {
  for (const width of widths) {
    const suffix = name === 'cinema-hero' && width === 768 ? '-768' : ''
    const output = `public/images/${name}${suffix}.webp`
    await sharp(`assets/${name}.png`).resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toFile(output)
    console.log(`${output}: ${Math.round((await stat(output)).size / 1024)} KiB`)
  }
}
