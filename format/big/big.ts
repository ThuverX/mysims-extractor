import assert from 'node:assert'
import type { BinReader } from 'jsr:@exts/binutils'
import { read_cstring, swap32 } from '../../util.ts'
import { Buffer } from 'node:buffer'

/*

import std.string;

struct Header {
    char magic[4];
    u32 archive_size;
    be u32 entry_count;
    be u32 first_entry;
};

struct Entry {
    be s32 offset;
    be s32 file_size;
    std::string::NullString filename;
    if(file_size > 0)
        char data[file_size] @ offset;
};

Header header @ $;
Entry entries[header.entry_count] @ $;
*/

class BigEntry {
	public offset: number // be
	public file_size: number // be
	public file_name: string
	public data: Buffer = Buffer.alloc(0)

	constructor(private bf: BinReader) {
		this.offset = swap32(this.bf.readInt32())
		this.file_size = swap32(this.bf.readInt32())
		this.file_name = read_cstring(this.bf)

		if (this.file_size > 0) {
			this.data = this.bf.buffer.subarray(
				this.offset,
				this.offset + this.file_size,
			)
		}
	}
}

class Big {
	public magic: string
	public archive_size: number
	public entry_count: number // be
	public first_entry: number // be
	public entries: Array<BigEntry> = []
	constructor(private bf: BinReader) {
		this.magic = this.bf.readBytes(4).toString('ascii')
		assert(this.magic == 'DBPF')

		this.archive_size = this.bf.readUInt32()
		this.entry_count = swap32(this.bf.readUInt32())
		this.first_entry = swap32(this.bf.readUInt32())

		for (let i = 0; i < 0; i++) {
			this.entries.push(new BigEntry(this.bf))
		}
	}
}
