import { extname, relative } from 'node:path'
import { Game } from './Game.ts'
import { DBPF } from '../format/dbpf.ts'
import { BinReader } from 'jsr:@exts/binutils'
import { Buffer } from 'node:buffer'
import { FileIndex, GameFileSystem } from './GameFilesystem.ts'
import { DBPFFileSystem } from './DBPFFileSystem.ts'
import { walk } from 'jsr:@std/fs'
import { VirtualFileSystem } from './VirtualFileSystem.ts'
import { compare_hash, HashLike } from '../util.ts'
import { FileEntry } from './GameFileSystem.ts'
export class GameResources extends GameFileSystem {
	public FS_LIST: Array<GameFileSystem> = []

	constructor(private game: Game) {
		super()
	}

	public async load() {
		await this.loadFolder(this.game.GAME_DATA_PATH)
		await this.loadFolder(this.game.GAME_DATA32_PATH)
		await this.loadFolder(this.game.SAVE_DATA_PATH)
	}

	private async loadFolder(path: string) {
		const system_files: Array<[string, string]> = []

		for await (
			const file of walk(path, {
				includeSymlinks: false,
			})
		) {
			try {
				if (extname(file.path) === '.package') {
					this.FS_LIST.push(
						new DBPFFileSystem(
							new DBPF(
								new BinReader(
									Buffer.from(await Deno.readFile(file.path)),
								),
								false,
							),
							file.path,
						),
					)
					console.log(
						`[Resources] (DBPF) Loaded ${
							relative(this.game.GAME_PATH, file.path)
						} `,
					)
				} else {
					if (file.path.trim().length > 0) {
						system_files.push([
							file.path,
							relative(
								path,
								file.path,
							).replace('\\', '/'),
						])
					}
				}
			} catch (e) {
				console.log(
					`[Resources] (DBPF) Failed to load ${
						relative(this.game.GAME_PATH, file.path)
					}: ${(e as Error).message}`,
				)
			}
		}

		this.FS_LIST.push(new VirtualFileSystem(system_files, path))

		console.log(
			`[Resources]  (VFS) Loaded ${relative(this.game.GAME_PATH, path)}`,
		)
	}

	public override getFile(path: HashLike): FileEntry | undefined {
		for (const fs of this.FS_LIST) {
			const file = fs.getFile(path)
			if (file) return file
		}
	}

	public override findFile(
		predicate: (index: FileIndex) => boolean,
	): FileEntry | undefined {
		for (const fs of this.FS_LIST) {
			const file = fs.findFile(predicate)
			if (file) return file
		}
	}

	public getFileByGroupAndHash(group: number, hash: HashLike) {
		return this.findFile((f) =>
			f.group === group &&
			compare_hash(f.hash, hash)
		)
	}

	public getFileByTypeAndHash(type: string, hash: HashLike) {
		return this.findFile((f) =>
			f.type === type &&
			compare_hash(f.hash, hash)
		)
	}

	public override filterFile(
		predicate: (index: FileIndex) => boolean,
	): Array<FileEntry> {
		const files: Array<FileEntry> = []

		for (const fs of this.FS_LIST) {
			files.push(...fs.filterFile(predicate))
		}

		return files
	}
}
