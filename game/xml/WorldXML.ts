import { WorldDef } from '../world/WorldDef.ts'
import { XMLParser } from './XMLParser.ts'

export class WorldXML extends XMLParser<WorldDef> {
	public override parse(): WorldDef {
		return {}
	}
}
