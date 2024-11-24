import { Buffer } from 'node:buffer'
import { BinReader } from 'jsr:@exts/binutils'
import { Index, TextTypes } from './index.ts'
import { WindowsModel } from './windowsmodel/windowsmodel.ts'
import { GLTFExporter } from '../exporters/gltf.ts'
import { Bnk } from './bnk/bnk.ts'
import { MaterialData } from './materials/materialdata.ts'
import { Serializer } from '../serializer.ts'

export class Entry implements Serializer {
	public data: Buffer

	constructor(
		private bf: BinReader,
		private index: Index,
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

	public async convert(): Promise<[string, Buffer] | null> {
		switch (this.index.type) {
			case 'WindowsModel': {
				const windowsModel = new WindowsModel(new BinReader(this.data))
				const gltf = new GLTFExporter(windowsModel)

				return [
					'glb',
					await gltf.get(),
				]
			}
			case 'CompositeTexture': {
				return [
					'dds',
					this.data,
				]
			}

			case 'bnk': {
				const bnk = new Bnk(new BinReader(this.data))

				return [
					'wav',
					await bnk.get(),
				]
			}

			case 'Material': {
				const materialdata = new MaterialData(new BinReader(this.data))

				return [
					'material.json',
					Buffer.from(
						JSON.stringify(materialdata.json(), undefined, 4),
						'utf8',
					),
				]
			}
		}

		return null
	}
}
