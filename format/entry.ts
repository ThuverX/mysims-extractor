import { Buffer } from 'node:buffer'
import { BinReader } from 'jsr:@exts/binutils'
import { Index, TextTypes } from './index.ts'
import { Bnk } from './bnk/bnk.ts'
import { MaterialData } from './materials/materialdata.ts'
import { Serializer } from '../serializer.ts'
import { GameModel } from '../game/model/GameModel.ts'
import { DBPF } from './dbpf.ts'

export class Entry implements Serializer {
	public data: Buffer

	constructor(
		private bf: BinReader,
		public index: Index,
		private dbpf: DBPF,
	) {
		this.bf.position = index.offset
		const data = this.bf.readBytes(index.mem_size)
		let output_data = data

		if (TextTypes.includes(index.type)) {
			const nullByteIndex = output_data.findIndex((v) => v === 0)
			if (nullByteIndex !== -1) {
				output_data = output_data.subarray(0, nullByteIndex)
			}
		}

		this.data = output_data
	}
	public serialize() {
		return {
			index: this.index.serialize(),
		}
	}
}
