import Long from 'https://deno.land/x/long@v1.0.0/mod.ts'
import { FNV } from './format/fnv/fnv.ts'
import { hash } from './util.ts'
import { Buffer } from 'node:buffer'

export const HASH32_CACHE_PATH = 'hashes_32.db'
export const HASH64_CACHE_PATH = 'hashes_64.db'
export const DELIMITER = '😁'
export let HASHES_32: Record<string, string> = {}
export let HASHES_64: Record<string, string> = {}

async function loadHashesFromCache(): Promise<void> {
	if (
		Object.keys(HASHES_32).length > 0 && Object.keys(HASHES_64).length > 0
	) return

	console.log(
		`Loading hashes from cache: ${HASH32_CACHE_PATH}, ${HASH64_CACHE_PATH}`,
	)

	const start = performance.now()

	const file_32 = await Deno.readTextFile(HASH32_CACHE_PATH)
	const lines_32 = file_32.split('\n').filter((x) => x.length > 0)

	HASHES_32 = {}

	for (const line of lines_32) {
		const [hash, value] = line.split(DELIMITER)
		HASHES_32[hash] = value
	}

	const file_64 = await Deno.readTextFile(HASH64_CACHE_PATH)
	const lines_64 = file_64.split('\n').filter((x) => x.length > 0)

	HASHES_64 = {}

	for (const line of lines_64) {
		const [hash, value] = line.split(DELIMITER)
		HASHES_64[hash] = value
	}

	console.log(
		`Loaded ${Object.keys(HASHES_32).length} hashes in ${
			performance.now() - start
		}ms`,
	)
}

async function writeHashesToCache(): Promise<void> {
	let str_32 = ''

	for (const [hash, value] of Object.entries(HASHES_32)) {
		str_32 += hash + DELIMITER + value + '\n'
	}

	let str_64 = ''
	for (const [hash, value] of Object.entries(HASHES_64)) {
		str_64 += hash + DELIMITER + value + '\n'
	}
	await Deno.writeFile(HASH32_CACHE_PATH, Buffer.from(str_32, 'utf8'))
	await Deno.writeFile(HASH64_CACHE_PATH, Buffer.from(str_64, 'utf8'))

	console.log(`Written hashes to ${HASH32_CACHE_PATH},${HASH64_CACHE_PATH}`)
}

async function hashesExist(): Promise<boolean> {
	try {
		return (await Deno.stat(HASH32_CACHE_PATH)).isFile &&
			(await Deno.stat(HASH64_CACHE_PATH)).isFile
	} catch (_e) {
		return false
	}
}

export function getHashValue32(hashv: string | Long | number) {
	const value = (hashv instanceof Long)
		? hash(hashv.toNumber())
		: typeof hashv == 'number'
		? hash(hashv)
		: hashv

	return HASHES_32[value.slice(0, 2 + 8)]
}

export function getHashValue64(hashv: string | Long) {
	const value = hashv instanceof Long ? hash(hashv) : hashv

	return HASHES_32[value.slice(0, 2 + 16)]
}

export function getHashValue(hashv: string | Long) {
	const value = hashv instanceof Long ? hash(hashv) : hashv

	return getHashValue32(value) || getHashValue64(value)
}

export function loadHashesFromTables(
	tables: [Record<string, string>, Record<string, string>],
) {
	HASHES_32 = tables[0]
	HASHES_64 = tables[1]
}

export async function loadHashesTable(
	filepath: string,
	bypass_cache: boolean = false,
) {
	if (await hashesExist() && !bypass_cache) {
		await loadHashesFromCache()
		return
	}

	console.log(`Creating hashes from ${filepath}`)

	const file = await Deno.readFile(filepath)
	const text = Buffer.from(file).toString('utf-16le')
	const lines = text.split('\n').filter((x) => x.length > 0).map((x) =>
		x.trim()
	)

	HASHES_32 = {}
	HASHES_64 = {}

	for (const line of lines) {
		HASHES_32[hash(FNV.fromString32(line))] = line
		HASHES_64[hash(FNV.fromString64(line))] = line
	}

	console.log(`Loaded ${Object.keys(HASHES_32).length} hashes`)

	await writeHashesToCache()
}
