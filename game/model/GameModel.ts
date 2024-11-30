import { BinReader } from 'jsr:@exts/binutils'
import { DBPF } from '../../format/dbpf.ts'
import { Entry } from '../../format/entry.ts'
import {
	Face,
	Mesh,
	Vertex,
	WindowsModel,
} from '../../format/windowsmodel/windowsmodel.ts'
import { Buffer } from 'node:buffer'
import { MaterialData } from '../../format/materials/materialdata.ts'
import { TextureParamInfo } from '../../format/materials/materialdata.ts'
import { GLTFExporter } from '../../export/gltf.ts'
import { MaterialSet } from '../../format/materials/materialset.ts'

class GameModelMaterial {
	private mat: MaterialData
	public textures: Record<string, Buffer> = {}
	constructor(mat_entry: Entry, private dbpf: DBPF) {
		this.mat = new MaterialData(new BinReader(mat_entry.data))

		for (const param of this.mat.paramaters) {
			if (param.extraParamInfo instanceof TextureParamInfo) {
				this.textures[param.type] = dbpf.getIndexByTypeAndHash(
					param.extraParamInfo.ref_type,
					param.extraParamInfo.ref_hash,
				)?.getEntry().data!
			}
		}
	}
}

class GameModelMesh {
	public materials: Array<GameModelMaterial> = []
	public vertices: Array<Vertex> = []
	public faces: Array<Face> = []
	constructor(private mesh: Mesh, private dbpf: DBPF) {
		const materialEntry = dbpf.getIndexByGroupAndHash(
			mesh.group_hash,
			mesh.material_hash,
		)
			?.getEntry()!

		if (materialEntry.index.type === 'Material') {
			this.materials.push(
				new GameModelMaterial(
					materialEntry,
					this.dbpf,
				),
			)
		} else {
			const set = new MaterialSet(new BinReader(materialEntry.data))
			for (const material of set.materials) {
				const matEntry = dbpf.getIndexByGroupAndHash(
					material.ref_group,
					material.ref_hash,
				)
					?.getEntry()!

				if (matEntry) {
					this.materials.push(
						new GameModelMaterial(
							matEntry,
							this.dbpf,
						),
					)
				}
			}
		}

		this.vertices = mesh.vertices
		this.faces = mesh.faces
	}
}

export class GameModel {
	private wmdl: WindowsModel
	public meshes: Array<GameModelMesh> = []
	public id: string
	constructor(wmdl_entry: Entry, private dbpf: DBPF) {
		this.wmdl = new WindowsModel(new BinReader(wmdl_entry.data))
		this.id = (Math.random() * 1000).toString(16)

		for (const mesh of this.wmdl.meshes) {
			this.meshes.push(new GameModelMesh(mesh, this.dbpf))
		}
	}

	public async get(): Promise<Buffer> {
		return await new GLTFExporter(this).get()
	}
}
