import { GameObject } from '../object/GameObject.ts'

export interface BuildingObject extends GameObject {
	lot_id: string
	save_name: string
}
