import { BinReader } from 'jsr:@exts/binutils'
import { Buffer } from 'node:buffer'
import { join } from 'node:path'

const libpath = join('lib', 'vgmstream-win', 'vgmstream-cli.exe')

export class Bnk {
	constructor(private bf: BinReader) {
	}

	public async get() {
		const path = await Deno.makeTempFile()
		await Deno.writeFile(path, this.bf.buffer)

		const command = new Deno.Command(libpath, {
			args: [
				'-i',
				'-P',
				path,
			],
		})

		const child = await command.output()

		return Buffer.from(child.stdout)
	}
}
