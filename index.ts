import { join } from 'jsr:@std/path@^1.0.8/join'
import { G } from './game/Game.ts'
import { GameModel } from './game/model/GameModel.ts'
import { hash_tostring } from './util.ts'

import { ensureDir } from 'jsr:@std/fs'

// const world = new WorldXML(
// 	G.resources.getFile('townSquare.world')!,
// ).parse()

// const level = new LevelXML(
// 	G.resources.findFile((x) =>
// 		compare_hash(x.hash, 0x0000000048416CF2n) && x.group === 0x9CD0AAD9
// 	)!,
// ).parse()

// console.log(level)

// const model = new GameModel(
// 	G.resources.findFile((x) =>
// 		x.type === 'WindowsModel' && x.group === 0xE1F3D237
// 	)!,
// )

// Deno.writeFileSync('test.glb', await model.export())

const models = G.resources.FS_LIST.find((x) =>
	x.path.endsWith('Characters.package')
)?.filterFile((x) => x.type === 'WindowsModel')

const path = 'output/gamemodel/Characters/'

await Deno.remove(path, {
	recursive: true,
})
await ensureDir(path)

for (const model of models) {
	try {
		const gModel = new GameModel(model)

		Deno.writeFile(
			join(
				path,
				`${hash_tostring(model.index.group ?? 0)}.${
					hash_tostring(model.index.hash)
				}.glb`,
			),
			await gModel.export(),
		)
	} catch (e) {
		console.log(
			`Failed to load model ${hash_tostring(model.index.group ?? 0)}.${
				hash_tostring(model.index.hash)
			} ${e}`,
		)
	}
}

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
