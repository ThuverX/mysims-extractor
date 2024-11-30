import { BinReader } from 'jsr:@exts/binutils'
import { FNV } from './format/fnv/fnv.ts'
import { WindowsModel } from './format/windowsmodel/windowsmodel.ts'
import { XMB } from './format/xmb/xmb.ts'
import { G } from './game/Game.ts'
import { WorldXML } from './game/xml/worldxml.ts'
import { compare_hash, create_hash, hash_tostring } from './util.ts'
import Long from 'https://deno.land/x/long@v1.0.0/mod.ts'

// const world = new WorldXML(
// 	G.resources.getFile('townSquare.world')!,
// ).parse()

// console.log(world.audio_def.path)

// console.log(
// 	G.resources.findFile((x) =>
// 		x.group == 0xF6E0FAB5 && compare_hash(x.hash, 0x000000BC)
// 	),
// )

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

import { Worker } from 'node:worker_threads'
import 'jsr:@std/dotenv/load'
import { HASHES_32, HASHES_64, loadHashesTable } from './hashes.ts'
import {
	ThreadedExtractorParameter,
	ThreadedExtractorResult,
} from './worker/threadedextractor.ts'
await loadHashesTable('./strings.txt')

function StartWorker(
	params: ThreadedExtractorParameter,
) {
	const worker = new Worker(
		new URL('./worker/threadedextractor.ts', import.meta.url).href,
		{
			stdout: false,
			stderr: false,
		},
	)
	worker.postMessage(params)

	worker.on('message', (msg: ThreadedExtractorResult) => {
		console.log(`Extracted ${msg.num_files} files`)
		worker.terminate()
	})
}

StartWorker({
	hashes: [HASHES_32, HASHES_64],
	filepath: 'Objects.package',
	clean: true,
	convert: true,
})
