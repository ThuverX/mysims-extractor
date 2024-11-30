import { HashLike } from '../util.ts'
import Long from 'https://deno.land/x/long@v1.0.0/mod.ts'
import { Buffer } from 'node:buffer'

export interface FileIndex {
	hash: Long
	group?: number
	type: string
	path?: string
	local_path?: string
}

export interface FileEntry {
	data: Buffer
	index: FileIndex
}

export abstract class GameFileSystem {
	abstract path: string
	abstract getFile(path: HashLike): FileEntry | undefined
	abstract findFile(
		predicate: (index: FileIndex) => boolean,
	): FileEntry | undefined
	abstract filterFile(
		predicate: (index: FileIndex) => boolean,
	): Array<FileEntry>
}
