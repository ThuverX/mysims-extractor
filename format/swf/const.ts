/*
import std.string;

enum EntryType: u32 {
    string = 1,
    number = 4,
};

struct ConstEntry {
    EntryType type;
    u32 value;
    if(type == EntryType::string) {
        std::string::NullString stringvalue @ value;
    }
};

struct Header {
    char magic[17];
    padding[3];
    u32 apt_offset;
    u32 item_count;
    padding[4];
    ConstEntry entries[item_count];
};

Header header @ $;
*/

import { BinReader } from 'jsr:@exts/binutils'
import assert from 'node:assert'
import { read_cstring } from '../../util.ts'

export const EntryType = {
	0: 'ukn',
	1: 'string',
	4: 'number',
} as const

export class SWFConstEntry {
	public type: (typeof EntryType)[keyof typeof EntryType]
	public value: number
	public string_value?: string
	constructor(private bf: BinReader) {
		const raw_type = this.bf.readUInt32()
		this.type = EntryType[raw_type as keyof typeof EntryType] ||
			'ukn'
		this.value = this.bf.readUInt32()

		const start = this.bf.position

		if (this.type === 'string') {
			this.bf.position = this.value
			this.string_value = read_cstring(this.bf)
		}

		this.bf.position = start
	}
}

export class SWFConst {
	public apt_offset: number
	public entries: Array<SWFConstEntry> = []
	constructor(private bf: BinReader) {
		const magic = this.bf.readBytes(17).toString('ascii')
		assert(
			magic == 'Apt constant file',
			`Invalid magic, expected "Apt constant file" got "${magic}"`,
		)

		this.bf.position += 3

		this.apt_offset = this.bf.readUInt32()
		const item_count = this.bf.readUInt32()

		this.bf.position += 4

		for (let i = 0; i < item_count; i++) {
			this.entries.push(new SWFConstEntry(this.bf))
		}
	}
}
