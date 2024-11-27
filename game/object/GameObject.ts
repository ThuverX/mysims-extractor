import { Resolver, Vec3 } from '../../types.ts'
import { LuaTable } from '../lua/LuaTable.ts'
import { ObjectDef } from './ObjectDef.ts'

export interface GameObject {
	name: string
	guid: string
	translation: Vec3
	rotation: Vec3
	object_def: Resolver<ObjectDef>
	script?: string
	children: Array<GameObject>
	lua_table: Record<string, LuaTable>
}
