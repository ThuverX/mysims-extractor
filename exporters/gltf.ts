import { Buffer } from 'node:buffer'
import type { WindowsModel } from '../format/windowsmodel/windowsmodel.ts'
import {
	DenoIO,
	Document,
	Node,
} from 'https://esm.sh/@gltf-transform/core@4.1.0'

export class GLTFExporter {
	private document = new Document()
	constructor(private wmodel: WindowsModel) {
		const buffer = this.document.createBuffer()

		const nodes: Array<Node> = []

		for (const mesh of this.wmodel.meshes) {
			const indicesArray = new Uint16Array(
				mesh.faces.map((f) => [f.a, f.b, f.c]).flat(),
			)

			const indices = this.document.createAccessor().setArray(
				indicesArray,
			).setType('SCALAR').setBuffer(buffer)

			const positionArray = new Float32Array(
				mesh.vertices.map(
					(v) => [v.position.x, v.position.y, v.position.z],
				).flat(),
			)

			const position = this.document
				.createAccessor()
				.setArray(new Float32Array(positionArray))
				.setType('VEC3')
				.setBuffer(buffer)

			const texcoordArray = new Float32Array(
				mesh.vertices.map(
					(v) => [v.uv.x, v.uv.y],
				).flat(),
			)

			const texcoord = this.document
				.createAccessor()
				.setArray(new Float32Array(texcoordArray))
				.setType('VEC2')
				.setBuffer(buffer)

			const material = this.document.createMaterial()
				.setBaseColorFactor([1, 1, 1, 1])
				.setRoughnessFactor(1)
				.setMetallicFactor(0)

			const prim = this.document
				.createPrimitive()
				.setMaterial(material)
				.setIndices(indices)
				.setAttribute('POSITION', position)
				.setAttribute('TEXCOORD_0', texcoord)
			const outMesh = this.document.createMesh('mesh')
				.addPrimitive(prim)

			nodes.push(
				this.document.createNode('node')
					.setMesh(outMesh)
					.setTranslation([0, 0, 0]),
			)
		}

		const scene = this.document.createScene('scene')

		for (const node of nodes) {
			scene.addChild(node)
		}
	}

	public async export(filepath: string) {
		const io = new DenoIO(filepath)
		const data = await io.writeBinary(this.document)
		await Deno.writeFile(filepath, data)

		console.log(`Succesfully written to ${filepath}`)
	}

	public async get() {
		const io = new DenoIO(this.document)
		const data = await io.writeBinary(this.document)

		return Buffer.from(data)
	}
}
