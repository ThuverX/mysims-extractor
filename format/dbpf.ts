import type { BinReader } from 'jsr:@exts/binutils'
import assert from 'node:assert'
import { hash, hex } from '../util.ts'
import { IndexHeader } from './indexheader.ts'
import Long from 'https://deno.land/x/long@v1.0.0/mod.ts'
import { Index } from './index.ts'
import { IndexType } from './index.ts'

/*

struct Header {
    char magic[4];
    u32 version_major;
    u32 version_minor;
    padding[24];
    u32 num_index_entries;
    padding[4];
    u32 index_size;
    padding[12];
    u32 index_version;
    u32 index_offset;
    padding[28];
};

*/
export class DBPF {
	public magic: string
	public major_version: number
	public minor_version: number
	public date_created: number
	public date_modified: number
	public index_major_version: number
	public index_entry_count: number
	public first_index_offset: number
	public index_size: number
	public hole_entry_count: number
	public hole_offset: number
	public hole_size: number
	public index_minor_version: number
	public index_offset: number

	public indexheader: IndexHeader

	constructor(private bf: BinReader) {
		this.magic = this.bf.readBytes(4).toString('ascii')
		assert(this.magic == 'DBPF')

		this.major_version = this.bf.readUInt32()
		this.minor_version = this.bf.readUInt32()

		this.bf.position += 12

		this.date_created = this.bf.readUInt32()
		this.date_modified = this.bf.readUInt32()

		this.index_major_version = this.bf.readUInt32()
		this.index_entry_count = this.bf.readUInt32()
		this.first_index_offset = this.bf.readUInt32()
		this.index_size = this.bf.readUInt32()

		this.hole_entry_count = this.bf.readUInt32()
		this.hole_offset = this.bf.readUInt32()
		this.hole_size = this.bf.readUInt32()

		this.index_minor_version = this.bf.readUInt32()
		this.index_offset = this.bf.readUInt32()

		this.bf.position += 4
		this.bf.position += 24

		assert(this.bf.position == 96)

		this.log_versions()
		this.log_stats()

		this.indexheader = new IndexHeader(this)
	}

	public getReader() {
		return this.bf
	}

	public getIndices(): Array<Index> {
		return this.indexheader.values
	}

	public findIndex(
		hash: Long,
		type: (typeof IndexType)[keyof typeof IndexType],
	): Index | undefined {
		return this.indexheader.values.find((x) =>
			x.hash.equals(hash) && x.type === type
		)
	}

	public getIndex(idx: number): Index {
		return this.indexheader.values[idx]
	}

	public getIndexAtHash(hashv: string | Long): Index | undefined {
		return this.indexheader.values.find((x) =>
			hash(x.hash) === (hashv instanceof Long ? hash(hashv) : hashv)
		)
	}

	public getIndicesOfType(
		type: (typeof IndexType)[keyof typeof IndexType],
	): Array<Index> {
		return this.indexheader.values.filter((x) => x.type === type)
	}

	public getIndicesByGroup(group: number) {
		return this.indexheader.values.filter((x) => x.group == group)
	}

	private log_stats() {
		console.log(
			`Index count ${this.index_entry_count} @ ${hex(this.index_offset)}`,
		)
		console.log(
			`Hole index count ${this.hole_entry_count} @ ${
				hex(this.hole_offset)
			}`,
		)
	}

	private log_versions() {
		console.log(`Version ${this.major_version}.${this.minor_version}`)
		console.log(
			`Index Version ${this.index_major_version}.${this.index_minor_version}`,
		)
	}
}
