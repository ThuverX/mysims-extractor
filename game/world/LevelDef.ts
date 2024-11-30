import { Resolver } from '../../types.ts'
import { GameModel } from '../model/GameModel.ts'

export interface GridInfo {
	cell_size_x: number
	cell_size_z: number
	start_pos_x: number
	start_pos_z: number
	num_cells_x: number
	num_cells_z: number
	model_name: string
}

export type GridValue = {
	type: 'Model'
	value: Resolver<GameModel>
}

export interface LevelDef {
	gridInfo: GridInfo
	gridCells: Array<GridValue>
	character_light_right: Resolver<any> // i have no idea what a light-rig is yet
}
