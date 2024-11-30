import { Buffer } from 'node:buffer'
import { FileEntry } from '../GameFilesystem.ts'
import { Color, Resolver } from '../../types.ts'
import { BinReader } from 'jsr:@exts/binutils'
import {
	BooleanParamInfo,
	ColorParamInfo,
	MapParamInfo,
	MaterialData,
} from '../../format/materials/materialdata.ts'
import { G } from '../Game.ts'
import assert from 'node:assert'

export class GameMaterial {
	public textures: Record<string, Resolver<Buffer>> = {}
	public colors: Record<string, Color> = {}
	public flags: Record<string, boolean> = {}
	public get diffuseColor() {
		return this.colors['diffuseColor']
	}
	constructor(file: FileEntry) {
		assert(
			file.index.type === 'Material',
			`Expected file type to be "Material" but got "${file.index.type}"`,
		)

		const materialData = new MaterialData(
			new BinReader(file.data),
		)

		for (const param of materialData.paramaters) {
			const info = param.extraParamInfo
			if (info instanceof MapParamInfo) {
				this.textures[param.type] = {
					path: param.type,
					resolve: () =>
						G.resources.getFileByTypeAndHash(
							info.ref_type,
							info.ref_hash,
						)?.data!,
				}
			} else if (info instanceof ColorParamInfo) {
				this.colors[param.type] = {
					r: info.color.x,
					g: info.color.y,
					b: info.color.z,
					a: info.alpha ?? 1,
				}
			} else if (info instanceof BooleanParamInfo) {
				this.flags[param.type] = info.value
			}
		}
	}
}
