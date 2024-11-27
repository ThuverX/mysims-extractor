import { Resolver, Vec3 } from '../../types.ts'
import { ObjectDef } from '../object/ObjectDef.ts'

export interface Portal {
	name: string
	translation: Vec3
	rotation: Vec3
	object_def: Resolver<ObjectDef>
	script: string
	destination_world: string
	teleport_player_on_collision: boolean
	teleport_npc_on_collision: boolean
	locked: boolean
}
