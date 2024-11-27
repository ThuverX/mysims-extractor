import { BinReader } from 'jsr:@exts/binutils'
import { Buffer } from 'node:buffer'
import { DBPF } from '../format/dbpf.ts'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { hash_tostring } from '../util.ts'

export const assetspath = './assets/'
export const outpath = './output'

export async function load(filepath: string): Promise<BinReader> {
	using file = await Deno.open(filepath)
	const stat = await file.stat()
	const buffer = new Uint8Array(stat.size)
	await file.read(buffer)

	return new BinReader(Buffer.from(buffer))
}
export async function extract(
	filename: string,
	clean: boolean = false,
	convert: boolean = false,
	keep_original: boolean = false,
): Promise<number> {
	const assetpath = join(assetspath, filename)
	const outpath_file = join(outpath, filename, '/')

	const fileBuffer = await load(assetpath)

	const dbpfFile = new DBPF(fileBuffer)

	let num_files_extracted = 0

	try {
		if (clean && existsSync(outpath_file)) {
			await Deno.remove(outpath_file, { recursive: true })
		}
	} catch (e) {
		console.log(e)
	}

	if (!existsSync(outpath)) await Deno.mkdir(outpath)
	if (!existsSync(outpath_file)) await Deno.mkdir(outpath_file)

	for (const index of dbpfFile.getIndices()) {
		let file_type: string = index.type

		const entry = index.getEntry()
		let data = entry.data
		const og_data = Buffer.from(entry.data)

		if (convert) {
			try {
				const convert_result = await entry.convert()
				if (convert_result !== null) {
					data = convert_result[1]
					file_type = convert_result[0]
				}
			} catch (e) {
				console.log(
					`ERROR: ${hash_tostring(index.group)}.${
						hash_tostring(index.hash)
					} couldn't be converted ${e}`,
				)
			}
		}

		const outfilename = `${hash_tostring(index.group)}.${
			hash_tostring(index.hash)
		}.${file_type}`
		const fulloutpath = join(outpath_file, outfilename)

		const outfilename_og = `${hash_tostring(index.group)}.${
			hash_tostring(index.hash)
		}._og.${index.type}`
		const fulloutpath_og = join(outpath_file, outfilename_og)

		if (!existsSync(fulloutpath)) {
			await Deno.writeFile(fulloutpath, data)
			if (keep_original) {
				await Deno.writeFile(fulloutpath_og, og_data)
			}

			num_files_extracted++
		}
	}

	return num_files_extracted
}
