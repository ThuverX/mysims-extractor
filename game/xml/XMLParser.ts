import * as XML from 'jsr:@libs/xml'
import { FileEntry } from '../GameFilesystem.ts'
export abstract class XMLParser<T> {
	protected document: XML.xml_document
	constructor(file: FileEntry) {
		this.document = XML.parse(file.data.toString('utf8'))
	}

	abstract parse(): T
}
