import assert from 'node:assert'
import {
	Face,
	Vertex,
	WindowsModel,
} from '../../format/windowsmodel/windowsmodel.ts'
import { FileEntry } from '../GameFilesystem.ts'
import { BinReader } from 'jsr:@exts/binutils'
import { Mesh } from '../../format/windowsmodel/windowsmodel.ts'
import { G } from '../Game.ts'
import { GameMaterial } from '../material/GameMaterial.ts'
import { MaterialSet } from '../../format/materials/materialset.ts'
import { GLTFExporter } from '../exporter/GLTFExporter.ts'
import Long from 'https://deno.land/x/long@v1.0.0/mod.ts'

export class GameMesh {
	public vertices: Array<Vertex> = []
	public faces: Array<Face> = []
	public materials: Array<GameMaterial> = []

	constructor(wMesh: Mesh) {
		this.faces = wMesh.faces
		this.vertices = wMesh.vertices

		const materialFile = G.resources.getFileByGroupAndHash(
			wMesh.group_hash,
			wMesh.material_hash,
		)

		if (materialFile) {
			if (materialFile.index.type === 'Material') {
				this.materials.push(new GameMaterial(materialFile))
			} else if (materialFile.index.type === 'MaterialSet') {
				const materialSet = new MaterialSet(
					new BinReader(materialFile.data),
				)
				for (const material of materialSet.materials) {
					const matFile = G.resources.getFileByGroupAndHash(
						material.ref_group,
						material.ref_hash,
					)
					if (matFile) {
						this.materials.push(new GameMaterial(matFile))
					}
				}
			} else {
				console.log(
					`Unexpected material type: ${materialFile.index.type}`,
				)
			}
		}
	}
}

export class GameModel {
	private wModel: WindowsModel
	public meshes: Array<GameMesh> = []
	public id: number
	constructor(file: FileEntry) {
		assert(
			file.index.type === 'WindowsModel',
			`Expected file type to be "WindowsModel" but got "${file.index.type}"`,
		)

		this.id = file.index.group!

		this.wModel = new WindowsModel(new BinReader(file.data))

		for (const mesh of this.wModel.meshes) {
			this.meshes.push(new GameMesh(mesh))
		}
	}

	public async export() {
		return await new GLTFExporter(this).export()
	}
}
