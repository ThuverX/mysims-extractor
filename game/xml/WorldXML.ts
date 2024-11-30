import { compare_hash } from '../../util.ts'
import { G } from '../Game.ts'
import { WorldDef } from '../world/WorldDef.ts'
import { AudioXML } from './AudioXML.ts'
import { XMLParser } from './XMLParser.ts'

export class WorldXML extends XMLParser<WorldDef> {
	public override parse(): WorldDef {
		const world: any = this.document['~children'][0]

		const audioDef = world['AudioDef']

		// console.log(audioDef)

		return {
			audio_def: {
				path: audioDef,
				resolve: () =>
					new AudioXML(
						G.resources.findFile((f) =>
							compare_hash(f.hash, audioDef)
						)!,
					).parse(),
			},
		}
	}
}
