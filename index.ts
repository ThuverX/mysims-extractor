import { join } from 'jsr:@std/path@^1.0.8/join'
import { G } from './game/Game.ts'
import { GameModel } from './game/model/GameModel.ts'
import { bitFlags, compare_hash, hash_tostring } from './util.ts'

import { ensureDir, ensureDirSync } from 'jsr:@std/fs'
import { FNV } from './format/fnv/fnv.ts'
import { LevelXML } from './game/xml/LevelXML.ts'
import { GLTFExporter } from './game/exporter/GLTFExporter.ts'
import { loadHashesTable } from './hashes.ts'
import { getHashValue32 } from './hashes.ts'
import { getHashValue64 } from './hashes.ts'
import { WorldXML } from './game/xml/WorldXML.ts'
import { Big } from './format/big/big.ts'
import { BinReader } from 'jsr:@exts/binutils'
import { SWFConst } from './format/swf/const.ts'
import { SWFApt } from './format/swf/apt.ts'

// const world = new WorldXML(
// 	G.resources.getFile('townSquare.world')!,
// ).parse()

// for (
// 	const levelEntry of G.resources.filterFile((x) => x.type === 'LevelXml')!
// ) {
// 	const level = new LevelXML(
// 		levelEntry,
// 	).parse()

// 	for (const cell of level.gridCells) {
// 		if (cell.type === 'Model') {
// 			const value = cell.value.resolve()
// 			const gltf = await new GLTFExporter(value).export()

// 			const path = `output/levels/${level.gridInfo.model_name}/`
// 			ensureDirSync(path)

// 			Deno.writeFileSync(
// 				path + hash_tostring(value.id) + '.glb',
// 				gltf,
// 			)
// 		}
// 	}
// }

// const id = FNV.fromString32('afBodyShortSkirtSweater')
// const id= FNV.fromString32('amHeadHairSpikey')
// const id = 0xE1F3D237

const big = new Big(
	new BinReader(G.resources.findFile((x) => x.type === 'big')?.data!),
)
let constfile: BinReader | undefined
let aptfile: BinReader | undefined

for (const file of big.entries) {
	if (file.file_name.endsWith('.const')) {
		constfile = new BinReader(file.data)
	} else if (file.file_name.endsWith('.apt')) {
		aptfile = new BinReader(file.data)
	}
}
new SWFApt(aptfile!, constfile!)

// const model = new GameModel(
// 	G.resources.findFile((x) => x.type === 'WindowsModel' && x.group === id)!,
// )

// Deno.writeFileSync(
// 	'afBodyShortSkirtSweater.WindowsModel',
// 	G.resources.findFile((x) => x.type === 'WindowsModel' && x.group === id)!
// 		.data!,
// )

// Deno.writeFileSync('skirt.glb', await model.export())

// const models = G.resources.FS_LIST.find((x) =>
// 	x.path.endsWith('Objects.package')
// )?.filterFile((x) => x.type === 'WindowsModel')

// const path = 'output/gamemodel/Objects/'

// await Deno.remove(path, {
// 	recursive: true,
// })
// await ensureDir(path)

// for (const model of models) {
// 	try {
// 		const gModel = new GameModel(model)

// 		Deno.writeFile(
// 			join(
// 				path,
// 				`${hash_tostring(model.index.group ?? 0)}.${
// 					hash_tostring(model.index.hash)
// 				}.glb`,
// 			),
// 			await gModel.export(),
// 		)
// 	} catch (e) {
// 		console.log(
// 			`Failed to load model ${hash_tostring(model.index.group ?? 0)}.${
// 				hash_tostring(model.index.hash)
// 			} ${e}`,
// 		)
// 	}
// }

// console.log(world.audio_def.path)
// console.log(hash_tostring(FNV.fromString32('_white')))

// new WindowsModel(
// 	new BinReader(
// 		G.resources.findFile((x) =>
// 			x.group == 0x80C83701 && x.type === 'WindowsModel'
// 			// x.group == 0xC5AE022B && x.type === 'WindowsModel'
// 		)?.data!,
// 	),
// )

// console.log(
// 	hash_tostring(create_hash('AudioDefs/Classic_Level_AudioDef.xml')),
// )
// console.log(
// 	JSON.stringify(
// 		new XMB(
// 			await load(
// 				'X:/dbpfsims/output/AudioDefs.package/0x00000000.0x90C956410D6F2CAE.xmb',
// 			),
// 		).serialize(),
// 		null,
// 		4,
// 	),
// )

// import { Worker } from 'node:worker_threads'
// import 'jsr:@std/dotenv/load'
// import { HASHES_32, HASHES_64, loadHashesTable } from './hashes.ts'
// import {
// 	ThreadedExtractorParameter,
// 	ThreadedExtractorResult,
// } from './worker/threadedextractor.ts'
// import { LevelXML } from './game/xml/LevelXML.ts'
// await loadHashesTable('./strings.txt')
//0xb359c791
// console.log(hash_tostring(0xb359c791))
// console.log(hash_tostring(FNV.fromString32('worldmodel')))

// function StartWorker(
// 	params: ThreadedExtractorParameter,
// ) {
// 	const worker = new Worker(
// 		new URL('./worker/threadedextractor.ts', import.meta.url).href,
// 		{
// 			stdout: false,
// 			stderr: false,
// 		},
// 	)
// 	worker.postMessage(params)

// 	worker.on('message', (msg: ThreadedExtractorResult) => {
// 		console.log(`Extracted ${msg.num_files} files`)
// 		worker.terminate()
// 	})
// }

// StartWorker({
// 	hashes: [HASHES_32, HASHES_64],
// 	filepath: 'Characters.package',
// 	clean: true,
// 	convert: true,
// })

// console.log(hash_tostring(FNV.fromString64('a-idle-lookAround')))
// console.log(hash_tostring(1082423216n))
