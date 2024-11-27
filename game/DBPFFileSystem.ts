import { DBPF } from '../format/dbpf.ts'
import { FileEntry, FileIndex, GameFileSystem } from './GameFileSystem.ts'
import { HashLike } from '../util.ts'
import { Index } from '../format/index.ts'

export class DBPFFileSystem extends GameFileSystem {
	constructor(private dbpf: DBPF) {
		super()
	}

	public override getFile(path: HashLike): FileEntry | undefined {
		return this.dbpf.getIndexAtHash(path)?.getEntry()
	}

	public override findFile(
		predicate: (index: FileIndex) => boolean,
	): FileEntry | undefined {
		return this.dbpf.findIndex((i) => {
			const fileIndex: FileIndex = {
				hash: i.hash,
				group: i.group,
				type: i.type,
			}
			return predicate(fileIndex)
		})?.getEntry()
	}

	public override filterFile(
		predicate: (index: FileIndex) => boolean,
	): Array<FileEntry> {
		return this.dbpf.filterIndex((i) => {
			const fileIndex: FileIndex = {
				hash: i.hash,
				group: i.group,
				type: i.type,
			}
			return predicate(fileIndex)
		}).map((x) => x.getEntry())
	}

	private getEntry(index?: Index): FileEntry | undefined {
		if (!index) return
		return {
			data: index.getEntry().data,
			index: {
				hash: index.hash,
				type: index.type,
				group: index.group,
			},
		}
	}
}
