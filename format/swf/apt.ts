/*
struct Header {
    char magic[8];
};

Header header @ $;
*/

import assert from 'node:assert'
import { BinReader } from 'jsr:@exts/binutils'
import { SWFConst } from './const.ts'

export class SWFApt {
	public const: SWFConst
	constructor(private bf: BinReader, constbf: BinReader) {
		this.const = new SWFConst(constbf)
		const magic = this.bf.readBytes(8).toString('ascii')
		assert(
			magic == 'Apt Data',
			`Invalid magic, expected "Apt Data" got "${magic}"`,
		)

		this.bf.position = this.const.apt_offset

		console.log(this.const.apt_offset)
	}
}
