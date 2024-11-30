import { GridValue, LevelDef } from '../world/LevelDef.ts'
import { XMLParser } from './XMLParser.ts'

export class LevelXML extends XMLParser<LevelDef> {
	public override parse(): LevelDef {
		const doc: any = this.document

		const cells: Array<GridValue> = []

		for (const child of doc.Level?.GridCells['~children']) {
			if (child['~name'] === 'Model') {
				cells.push({
					type: 'Model',
					value: {
						path: child['#text'],
						resolve: () => null as any,
					},
				})
			}
		}

		return {
			gridInfo: {
				cell_size_x: parseFloat(doc.Level?.GridInfo?.CellSizeX),
				cell_size_z: parseFloat(doc.Level?.GridInfo?.CellSizeZ),
				start_pos_x: parseFloat(doc.Level?.GridInfo?.StartPosX),
				start_pos_z: parseFloat(doc.Level?.GridInfo?.StartPosZ),
				num_cells_x: parseFloat(doc.Level?.GridInfo?.NumCellsX),
				num_cells_z: parseFloat(doc.Level?.GridInfo?.NumCellsZ),
				model_name: doc.Level?.GridInfo?.ModelName,
			},
			gridCells: cells,
			character_light_right: {
				path: doc.Level?.CharacterLightRig,
				resolve: () => null,
			},
		}
	}
}
