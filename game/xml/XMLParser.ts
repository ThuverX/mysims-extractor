import * as XML from 'jsr:@libs/xml'
export abstract class XMLParser<T> {
	protected document: XML.xml_document
	constructor(xml: string) {
		this.document = XML.parse(xml)
	}

	abstract parse(): T
}
