import { BinReader } from 'jsr:@exts/binutils'
import type { DBPF } from './dbpf.ts'
import { Index, IndexType } from './index.ts'
import { bitFlags } from '../util.ts'

export const IndexTypeFlags = {
	resource_type: 0,
	resource_group: 1,
	instance_hi: 2,
	instance_lo: 3,
	offset: 4,
	file_size: 5,
	mem_size: 6,
	flags: 7,
} as const

export class IndexHeader {
	private bf: BinReader
	public flags: Array<keyof typeof IndexTypeFlags> = []
	public values: Array<Index> = []

	public entry_type_raw?: number
	public entry_type?: (typeof IndexType)[keyof typeof IndexType]
	public entry_group?: number
	public entry_instance_hi?: number
	public entry_instance_lo?: number

	constructor(private dbpf: DBPF) {
		this.bf = new BinReader(dbpf.getReader().buffer)

		this.bf.position = this.dbpf.index_offset
		this.flags = bitFlags(IndexTypeFlags, this.bf.readUInt32())

		if (this.flags.includes('resource_type')) {
			this.entry_type_raw = this.bf.readUInt32()
			this.entry_type =
				IndexType[this.entry_type_raw as keyof typeof IndexType] ||
				'ukn'
		}

		if (this.flags.includes('resource_group')) {
			this.entry_group = this.bf.readUInt32()
		}

		if (this.flags.includes('instance_hi')) {
			this.entry_instance_hi = this.bf.readUInt32()
		}

		for (let i = 0; i < this.dbpf.index_entry_count; i++) {
			this.values.push(new Index(this.bf, this, this.dbpf))
		}

		this.log_type()

		// switch (this.index_type) {
		// 	case 0: {
		// 		for (let i = 0; i < this.dbpf.index_entry_count; i++) {
		// 			this.values.push(new Index(0, this.bf))
		// 		}
		// 		break
		// 	}
		// 	case 2: {
		// 		this.bf.position += 4

		// 		for (let i = 0; i < this.dbpf.index_entry_count; i++) {
		// 			this.values.push(new Index(2, this.bf))
		// 		}

		// 		break
		// 	}
		// 	case 3: {
		// 		const raw_type = this.bf.readUInt32()

		// 		this.bf.position += 4

		// 		for (let i = 0; i < this.dbpf.index_entry_count; i++) {
		// 			this.values.push(new Index(3, this.bf, raw_type))
		// 		}

		// 		break
		// 	}
		// 	case 4: {
		// 		this.bf.position += 4

		// 		for (let i = 0; i < this.dbpf.index_entry_count; i++) {
		// 			this.values.push(new Index(4, this.bf))
		// 		}
		// 		break
		// 	}
		// 	case 7: {
		// 		for (let i = 0; i < this.dbpf.index_entry_count; i++) {
		// 			this.values.push(new Index(7, this.bf))
		// 		}
		// 		break
		// 	}
		// 	case 1:
		// 	default:
		// 		throw new Error(`Unknown index type ${this.index_type}`)
		// }
	}

	private log_type() {
		console.log(
			`Index flags: ${this.flags.join(',')}`,
		)
	}
}
