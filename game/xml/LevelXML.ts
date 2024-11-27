import { LevelDef } from '../world/LevelDef.ts'
import { XMLParser } from './XMLParser.ts'

export class LevelXML extends XMLParser<LevelDef> {
	public override parse(): LevelDef {
		return {}
	}
}
