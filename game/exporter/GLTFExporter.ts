import { GameModel } from '../model/GameModel.ts'
import {
	DenoIO,
	Document,
	Material,
} from 'https://esm.sh/@gltf-transform/core@4.1.0'

import { GameMesh } from '../model/GameModel.ts'
import { PNGExporter } from './PNGExporter.ts'
import { Buffer } from 'node:buffer'

export class GLTFExporter {
	private document = new Document()
	private buffer = this.document.createBuffer()
	private rootNode = this.document.createNode('node')

	constructor(private model: GameModel) {
	}

	public async export() {
		this.document = new Document()
		this.buffer = this.document.createBuffer()
		this.rootNode = this.document.createNode(
			`${this.model.id}.WindowsModel`,
		)

		for (const mesh of this.model.meshes) {
			const indices = this.getIndices(mesh)
			const positions = this.getPositions(mesh)
			const normals = this.getNormals(mesh)
			const uvs = this.getUvs(mesh)
			const materials = await this.getMaterials(mesh)

			let prim = this.document
				.createPrimitive()
				.setIndices(indices)
				.setAttribute('NORMAL', normals)
				.setAttribute('POSITION', positions)
				.setAttribute('TEXCOORD_0', uvs)

			if (materials.length > 0) {
				prim = prim.setMaterial(materials[0])
			}

			const outMesh = this.document.createMesh('mesh')
				.addPrimitive(prim)

			this.rootNode.addChild(
				this.document.createNode('node')
					.setMesh(outMesh)
					.setTranslation([0, 0, 0]),
			)
		}

		this.document.createScene('scene')
			.addChild(this.rootNode)

		const io = new DenoIO(Math.random().toString())
		const data = await io.writeBinary(this.document)

		return Buffer.from(data)
	}

	private async getMaterials(mesh: GameMesh) {
		const materials: Array<Material> = []
		for (const mat of mesh.materials) {
			let material = this.document.createMaterial()

			material = material
				.setRoughnessFactor(1)
				.setMetallicFactor(0)
				.setAlphaMode('MASK')
				.setAlphaCutoff(mat.colors?.['transparency'].r ?? 0.5) //not sure if this is right
			if (mat.diffuseColor) {
				material = material.setBaseColorFactor([
					mat.diffuseColor.r,
					mat.diffuseColor.g,
					mat.diffuseColor.b,
					mat.diffuseColor.a ?? 0,
				])
			}

			if (mat.textures['diffuseMap']) {
				const exporter = new PNGExporter(
					mat.textures['diffuseMap'].resolve(),
				)
				const texture = this.document.createTexture()
					.setImage(
						await exporter.export(),
					)
					.setMimeType('image/png')
				material = material.setBaseColorTexture(texture)
			}

			materials.push(material)
		}
		return materials
	}

	private getIndices(mesh: GameMesh) {
		const indicesArray = new Uint16Array(
			mesh.faces.map((f) => [f.a, f.b, f.c]).flat(),
		)

		return this.document.createAccessor().setArray(
			indicesArray,
		).setType('SCALAR').setBuffer(this.buffer)
	}

	private getPositions(mesh: GameMesh) {
		const positionArray = new Float32Array(
			mesh.vertices.map(
				(v) => [v.position.x, v.position.y, v.position.z],
			).flat(),
		)

		return this.document
			.createAccessor()
			.setArray(new Float32Array(positionArray))
			.setType('VEC3')
			.setBuffer(this.buffer)
	}

	private getNormals(mesh: GameMesh) {
		const normalArray = new Float32Array(
			mesh.vertices.map(
				(v) => [v.normal.x, v.normal.y, v.normal.z],
			).flat(),
		)

		return this.document
			.createAccessor()
			.setArray(new Float32Array(normalArray))
			.setType('VEC3')
			.setBuffer(this.buffer)
	}

	private getUvs(mesh: GameMesh) {
		const texcoordArray = new Float32Array(
			mesh.vertices.map(
				(v) => [v.uv.x, v.uv.y],
			).flat(),
		)

		return this.document
			.createAccessor()
			.setArray(new Float32Array(texcoordArray))
			.setType('VEC2')
			.setBuffer(this.buffer)
	}
}
