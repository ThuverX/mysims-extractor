import { Buffer } from 'node:buffer'
import {
	ImageMagick,
	IMagickImage,
	initialize,
	MagickFormat,
} from 'https://deno.land/x/imagemagick_deno@0.0.31/mod.ts'
await initialize()
export class PNGExporter {
	constructor(private data: Buffer) {
	}

	public export(): Promise<Buffer> {
		return new Promise((res) => {
			ImageMagick.read(this.data, (img: IMagickImage) => {
				img.write(
					MagickFormat.Png,
					(data: Uint8Array) => res(Buffer.from(data)),
				)
			})
		})
	}
}
