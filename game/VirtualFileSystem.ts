import { FileEntry, FileIndex, GameFileSystem } from './GameFileSystem.ts'
import { create_hash, HashLike } from '../util.ts'
import { extname } from 'node:path'
import { FNV } from '../format/fnv/fnv.ts'
import { Buffer } from 'node:buffer'

export class VirtualFileSystem extends GameFileSystem {
	public paths: Map<bigint, FileIndex> = new Map()
	constructor(paths: Array<[string, string]>, public path: string) {
		super()

		for (const [real_path, local_path] of paths) {
			const type = extname(local_path).slice(1)
			const hash = FNV.fromString64(local_path)
			const id = BigInt(hash.toString())

			this.paths.set(id, {
				hash,
				type,
				path: real_path,
				local_path,
			})
		}
	}
	public async load() {
	}

	public override getFile(path: HashLike): FileEntry | undefined {
		return this.getEntry(this.paths.get(create_hash(path)))
	}

	public override findFile(
		predicate: (index: FileIndex) => boolean,
	): FileEntry | undefined {
		return this.getEntry(this.paths.values().find(predicate))
	}

	public override filterFile(
		predicate: (index: FileIndex) => boolean,
	): Array<FileEntry> {
		return this.paths.values().filter(predicate).map(this.getEntry)
	}

	private getEntry(index?: FileIndex): FileEntry | undefined {
		if (!index) return undefined

		return {
			data: Buffer.from(Deno.readFileSync(index.path!)),
			index,
		}
	}
}
