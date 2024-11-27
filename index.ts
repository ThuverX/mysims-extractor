/*
struct Header {
    char magic[4];
    u32 version_major;
    u32 version_minor;
    padding[24];
    u32 num_index_entries;
    padding[4];
    u32 index_size;
    padding[12];
    u32 index_version;
    u32 index_offset;
    padding[28];
};

Header header @ $;

enum Type: u32 {
    Model = 0x01661233,
    RevoModel = 0xf9e50586,
    WindowsModel = 0xb359c791,
    rig = 0x8eaf13de,
    clip = 0x6b20c4f3,
    KeyNameMap = 0x0166038c,
    Geometry = 0x015a1849,
    Material = 0x01d0e75d,
    MaterialSet = 0x02019972,
    OldSpeedTree = 0x00b552ea,
    SpeedTree = 0x021d7e8c,
    dds = 0x00b2d882,
    CompositeTexture = 0x8e342417,
    SimOutfit = 0x025ed6f4,
    LevelXml = 0x585ee310,
    LevelBin = 0x58969018,
    Physics = 0xd5988020,
    LuaScript = 0x474999b4,
    LightSetXml = 0x50182640,
    LightSetBin = 0x50002128,
    xml = 0xdc37e964,
    FootPrintSet = 0x2c81b60a,
    ObjectConstructionXml = 0xc876c85e,
    ObjectConstructionBin = 0xc08ec0ee,
    SlotXml = 0x4045d294,
    SlotBin = 0x487bf9e4,
    swm = 0xcf60795e,
    SwarmBin = 0x9752e396,
    XmlBin = 0xe0d83029,
    CABXml = 0xa6856948,
    CABBin = 0xc644f440,
    big = 0x5bca8c06,
    bnk = 0xb6b5c271,
    lua = 0x474999b4,
    luo = 0x2b8e2411,
    LightBoxXml = 0xb61215e9,
    LightBoxBin = 0xd6215201,
    xmb = 0x1e1e6516,
    ttf = 0xfd72d418,
    ttc = 0x35ebb959
};

struct Index4 {
    Type type;
    u32 group;
    u32 instance;
    u32 offset;
    u32 disk_size;
    u32 mem_size;
    u16 compressed;
    padding[2];
};

bitfield IndexType {
    resource_type   : 0;
    resource_group  : 1;
    instance_hi     : 2;
    instance_lo     : 3;
    offset          : 4;
    file_size       : 5;
    mem_size        : 6;
    flags           : 7;
};

IndexType index_type_bitfield @ header.index_offset;


u32 index_type @ header.index_offset;
if(index_type == 4) {
    Index4 indices[header.num_index_entries] @ header.index_offset + 8;
}

*/

import { Worker } from 'node:worker_threads'
import {
	ThreadedExtractorParameter,
	ThreadedExtractorResult,
} from './worker/threadedextractor.ts'
// import { assetspath, load } from './export/extract.ts'
// import { hash } from './util.ts'
// import { DBPF } from './format/dbpf.ts'
// import { Buffer } from 'node:buffer'
// import Long from 'https://deno.land/x/long@v1.0.0/mod.ts'
// import {
// 	getHashValue32,
// 	getHashValue64,
// 	HASHES_32,
// 	HASHES_64,
// 	loadHashesTable,
// } from './hashes.ts'
// import { GameModel } from './game/model/GameModel.ts'
// import { WorldDef } from './format/world/worldDef.ts'
// import { join } from 'node:path'
import { Game } from './game/Game.ts'
import 'jsr:@std/dotenv/load'
import { DBPF } from './format/dbpf.ts'
import { load } from './export/extract.ts'
import { compare_hash, create_hash, hash_tostring } from './util.ts'
import { loadHashesTable } from './hashes.ts'
import { FNV } from './format/fnv/fnv.ts'
import { WorldXML } from './game/xml/worldxml.ts'
import { hash } from 'node:crypto'
import { LevelXML } from './game/xml/LevelXML.ts'
import { writeFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
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

// for await (const file of Deno.readDir(assetspath)) {
// 	if (file.name === 'Face-baked.package') continue
// 	if (file.isFile) {
// 		StartWorker({
//             hashes: [HASHES_32, HASHES_64],
// 			filepath: file.name,
// 			clean: true,
// 			convert: true,
// 			keep_original: false,
// 		})
// 	}
// }

// StartWorker({
// 	hashes: [HASHES_32, HASHES_64],
// 	filepath: 'Objects.package',
// 	clean: true,
// 	convert: true,
// })

// const dbpf = new DBPF(await load('./assets/Fonts.package'))
// console.log(dbpf.getIndexAtHash(0x6240A2A57329C3AAn))

const game = new Game(Deno.env.get('GAME_PATH')!)
await game.load()

// console.log(
// 	new LevelXML(
// 		game.resources.findFile((f) =>
// 			compare_hash(f.hash, FNV.fromString32('townSquare')) &&
// 			f.type === 'LevelXml'
// 		)?.data.toString('utf8')!,
// 	),
// )

// Deno.writeTextFileSync(
// 	'file.json',
// 	JSON.stringify(
// 		new WorldXML(
// 			game.resources.getFile('townSquare.world')?.data.toString('utf8')!,
// 		).document,
// 		null,
// 		4,
// 	),
// )

// console.log(new WorldDef(await load('./assets/xml/townSquare.world.xml')))

// const data = await new GameModel(
// 	dbpf.getIndexByGroupAndHash(0x98DD2593, 1)!.getEntry(),
// 	dbpf,
// ).get()

// Deno.writeFileSync('./test.glb', data)
