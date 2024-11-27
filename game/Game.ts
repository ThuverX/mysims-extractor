import { join } from 'node:path'
import { GameResources } from './GameResources.ts?='

export class Game {
	public RESOURCE_PATH: string
	public GAME_DATA_PATH: string
	public GAME_DATA32_PATH: string
	public SAVE_DATA_PATH: string

	public resources: GameResources

	constructor(public GAME_PATH: string) {
		this.RESOURCE_PATH = join(this.GAME_PATH, 'SimsRevData')
		this.GAME_DATA_PATH = join(this.RESOURCE_PATH, 'GameData')
		this.GAME_DATA32_PATH = join(this.RESOURCE_PATH, 'GameData_Win32')
		this.SAVE_DATA_PATH = join(this.RESOURCE_PATH, 'SaveData')

		this.resources = new GameResources(this)
	}

	public async load() {
		await this.resources.load()
	}
}
