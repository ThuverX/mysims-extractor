import { XMLParser } from './XMLParser.ts'
import { AudioDef } from '../audio/AudioDef.ts'

export class AudioXML extends XMLParser<AudioDef> {
	override parse(): AudioDef {
		throw new Error('Method not implemented.')
	}
}
