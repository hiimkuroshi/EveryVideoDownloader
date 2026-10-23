import sharp from "sharp";
import { stat } from "node:fs/promises";

const images = {
  hero: [768, 1536],
  italy: [480, 1100],
  japan: [480, 1100],
  namibia: [480, 1100],
  story: [900, 1800],
  detail: [480, 900],
};
for (const [name, widths] of Object.entries(images)) {
  for (const width of widths) {
    const suffix = width === widths.at(-1) ? "" : `-${width}`;
    const output = `public/images/${name}${suffix}.webp`;
    await sharp(`public/images/${name}.jpg`)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(output);
    console.log(
      `${output}: ${Math.round((await stat(output)).size / 1024)} KiB`,
    );
  }
}
