import { LevelDef } from './LevelDef.ts'
import { BoundingBox, Resolver, Vec3 } from '../../types.ts'
import { AudioDef } from '../audio/AudioDef.ts'
import { GameObject } from '../object/GameObject.ts'
import { EffectObject } from '../effect/EffectObject.ts'
import { Portal } from './Portal.ts'
import { CharacterObject } from '../character/CharacterObject.ts'
import { BuildingObject } from './BuildingObject.ts'
import { Camera } from '../camera/Camera.ts'

export interface WorldDef {
	level: {
		name: Resolver<LevelDef>
		bounding_box: BoundingBox
		fill_light_color: Vec3
		rim_light_color: Vec3
		rim_light_angle: number
	}
	camera: Camera
	influences: Record<string, string>
	buildings: Array<BuildingObject>
	gameobjects: Array<GameObject>
	effectobjects: Array<EffectObject>
	characters: Array<CharacterObject>
	portals: Array<Portal>
	slots: null
	audio_def: Resolver<AudioDef>
}
