// import { Buffer } from 'node:buffer'
// import {
// 	DenoIO,
// 	Document,
// 	Node,
// } from 'https://esm.sh/@gltf-transform/core@4.1.0'
// import { GameModel } from '../game/model/GameModel.ts'

// import {
// 	ImageMagick,
// 	IMagickImage,
// 	initialize,
// 	MagickFormat,
// } from 'https://deno.land/x/imagemagick_deno@0.0.31/mod.ts'

// export function DDS2PNG(data: Buffer): Promise<Buffer> {
// 	return new Promise((res, rej) => {
// 		ImageMagick.read(data, (img: IMagickImage) => {
// 			img.write(
// 				MagickFormat.Png,
// 				(data: Uint8Array) => res(Buffer.from(data)),
// 			)
// 		})
// 	})
// }

// export class GLTFExporter {
// 	private document = new Document()
// 	constructor(private game_model: GameModel) {
// 	}

// 	public async convert() {
// 		await initialize()
// 		const buffer = this.document.createBuffer()

// 		const rootNode = this.document.createNode('node')

// 		for (const mesh of this.game_model.meshes) {
// 			const indicesArray = new Uint16Array(
// 				mesh.faces.map((f) => [f.a, f.b, f.c]).flat(),
// 			)

// 			const indices = this.document.createAccessor().setArray(
// 				indicesArray,
// 			).setType('SCALAR').setBuffer(buffer)

// 			const positionArray = new Float32Array(
// 				mesh.vertices.map(
// 					(v) => [v.position.x, v.position.y, v.position.z],
// 				).flat(),
// 			)

// 			const normalArray = new Float32Array(
// 				mesh.vertices.map(
// 					(v) => [v.normal.x, v.normal.y, v.normal.z],
// 				).flat(),
// 			)

// 			const normal = this.document
// 				.createAccessor()
// 				.setArray(new Float32Array(normalArray))
// 				.setType('VEC3')
// 				.setBuffer(buffer)

// 			const position = this.document
// 				.createAccessor()
// 				.setArray(new Float32Array(positionArray))
// 				.setType('VEC3')
// 				.setBuffer(buffer)

// 			const texcoordArray = new Float32Array(
// 				mesh.vertices.map(
// 					(v) => [v.uv.x, v.uv.y],
// 				).flat(),
// 			)

// 			const texcoord = this.document
// 				.createAccessor()
// 				.setArray(new Float32Array(texcoordArray))
// 				.setType('VEC2')
// 				.setBuffer(buffer)

// 			let material = this.document.createMaterial()

// 			if (mesh.materials[0]?.textures['diffuseMap']) {
// 				const texture = this.document.createTexture()
// 					.setImage(
// 						await DDS2PNG(mesh.materials[0].textures['diffuseMap']),
// 					)
// 					.setMimeType('image/png')

// 				material = this.document.createMaterial()
// 					.setBaseColorTexture(texture)
// 					.setBaseColorFactor([1, 1, 1, 1])
// 					.setRoughnessFactor(1)
// 					.setMetallicFactor(0)
// 			} else {
// 				material = material
// 					.setBaseColorFactor([1, 1, 1, 1])
// 					.setRoughnessFactor(1)
// 					.setMetallicFactor(0)
// 			}

// 			const prim = this.document
// 				.createPrimitive()
// 				.setMaterial(material)
// 				.setIndices(indices)
// 				.setAttribute('NORMAL', normal)
// 				.setAttribute('POSITION', position)
// 				.setAttribute('TEXCOORD_0', texcoord)
// 			const outMesh = this.document.createMesh('mesh')
// 				.addPrimitive(prim)

// 			rootNode.addChild(
// 				this.document.createNode('node')
// 					.setMesh(outMesh)
// 					.setTranslation([0, 0, 0]),
// 			)
// 		}

// 		this.document.createScene(this.game_model.id + '.scene')
// 			.addChild(rootNode)
// 	}

// 	public async export(filepath: string) {
// 		await this.convert()
// 		const io = new DenoIO(filepath)
// 		const data = await io.writeBinary(this.document)
// 		await Deno.writeFile(filepath, data)

// 		console.log(`Succesfully written to ${filepath}`)
// 	}

// 	public async get() {
// 		await this.convert()
// 		const io = new DenoIO(this.document)
// 		const data = await io.writeBinary(this.document)

// 		return Buffer.from(data)
// 	}
// }
