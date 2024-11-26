import { BinReader } from 'jsr:@exts/binutils'
import { Entry } from './entry.ts'
import Long from 'https://deno.land/x/long@v1.0.0/mod.ts'
import { IndexHeader } from './indexheader.ts'
import { Serializer } from '../serializer.ts'
import { hash } from '../util.ts'
import { DBPF } from './dbpf.ts'
export const IndexType = {
	0x01661233: 'Model',
	0xf9e50586: 'RevoModel',
	0xb359c791: 'WindowsModel',
	0xd86f5e67: 'download',
	0x8eaf13de: 'rig',
	0x6b20c4f3: 'clip',
	0x0166038c: 'KeyNameMap',
	0x015a1849: 'Geometry',
	0x01d0e75d: 'Material',
	0x02019972: 'MaterialSet',
	0x00b552ea: 'OldSpeedTree',
	0x021d7e8c: 'SpeedTree',
	0x00b2d882: 'dds',
	0x8e342417: 'CompositeTexture',
	0x025ed6f4: 'SimOutfit',
	0x585ee310: 'LevelXml',
	0x58969018: 'LevelBin',
	0xd5988020: 'Physics',
	0x50182640: 'LightSetXml',
	0x50002128: 'LightSetBin',
	0xdc37e964: 'xml',
	0x2c81b60a: 'FootPrintSet',
	0xc876c85e: 'ObjectConstructionXml',
	0xc08ec0ee: 'ObjectConstructionBin',
	0x4045d294: 'SlotXml',
	0x487bf9e4: 'SlotBin',
	0xcf60795e: 'swm',
	0x9752e396: 'SwarmBin',
	0xe0d83029: 'XmlBin',
	0xa6856948: 'CABXml',
	0xc644f440: 'CABBin',
	0x5bca8c06: 'big',
	0xb6b5c271: 'bnk',
	0x474999b4: 'lua',
	0x2b8e2411: 'luo',
	0xb61215e9: 'LightBoxXml',
	0xd6215201: 'LightBoxBin',
	0x1e1e6516: 'xmb',
	0xfd72d418: 'ttf',
	0x35ebb959: 'ttc',
	0x6d3e3fb4: 'RuntimeSettingsXml',
	0x6b772503: 'fx',
	0x0: 'ukn',
	// 0xb2d882: 'TEXTURE',
	// 0xfd72d418: 'TTF_FONT',
	// 0xb61215e9: 'LIGHTBOX',
	// 0x50182640: 'LIGHTSET',
	// 0x4045d294: 'SLOTS',
	// 0x1d0e75d: 'MATERIAL',
	// 0xb359c791: 'WORLD_MODEL',
	// 0x585ee310: 'LEVEL',
	// 0xb6b5c271: 'BNKL', //unknown
	// 0x35ebb959: 'TTCF_FONT',
	// 0xa6856948: 'CABRESOURCE',
	// 0xd5988020: 'PHYS',
	// 0x6d3e3fb4: 'RUNTIME_SETTINGS',
	// 0x5bca8c06: 'BIG',
	// 0x2c81b60a: 'FPST', // unknown
	// 0x2019972: 'MTST', // unknown
	// 0x0: 'UKN'
} as const

export const TextTypes: Array<(typeof IndexType)[keyof typeof IndexType]> = [
	'SlotXml',
	'xml',
	'LevelXml',
	'LightBoxXml',
	'LightSetXml',
	'CABXml',
	'ObjectConstructionXml',
	'RuntimeSettingsXml',
]

/*

struct Index4 {
    Type type;
    u32 group;
    u32 instance;
    u32 offset;
    u32 disk_size;
    u32 mem_size;
    u16 compressed;
    padding[2];
};

*/

export class Index implements Serializer {
	public type: (typeof IndexType)[keyof typeof IndexType]
	public raw_type: number
	public offset: number
	public group: number
	public file_size: number
	public mem_size: number
	public compressed: boolean
	public hash: Long

	constructor(
		private bf: BinReader,
		private header: IndexHeader,
		private dbpf: DBPF,
	) {
		if (!this.header.flags.includes('resource_type')) {
			this.raw_type = this.bf.readUInt32()
			this.type = IndexType[this.raw_type as keyof typeof IndexType] ||
				'ukn'
		} else {
			this.raw_type = this.header.entry_type_raw!
			this.type = this.header.entry_type!
		}

		if (!this.header.flags.includes('resource_group')) {
			this.group = this.bf.readUInt32()
		} else {
			this.group = this.header.entry_group!
		}

		let instance_hi = 0
		let instance_lo = 0

		if (!this.header.flags.includes('instance_hi')) {
			instance_hi = this.bf.readUInt32()
		} else {
			instance_hi = this.header.entry_instance_hi!
		}

		instance_lo = this.bf.readUInt32()

		this.hash = new Long(instance_lo, instance_hi, true)
		this.offset = this.bf.readUInt32()
		this.file_size = this.bf.readUInt32() & 0x7FFFFFFF
		this.mem_size = this.bf.readUInt32()

		const compressed_u32 = this.bf.readUInt16()

		this.compressed = compressed_u32 == 0xffff

		bf.position += 2
		// if (index_type === 0) {
		// 	this.group = this.bf.readUInt32()

		// 	this.bf.position += 8

		// 	this.offset = this.bf.readUInt32()
		// } else if (index_type === 2) {
		// 	this.raw_type = this.bf.readUInt32()
		// 	this.type = IndexType[this.raw_type as keyof typeof IndexType] ||
		// 		'ukn'

		// 	this.hash = Long.fromBytes([...this.bf.readBytes(8)], true, false)

		// 	this.offset = this.bf.readUInt32()
		// 	this.file_size = this.bf.readUInt32() & 0x7FFFFFFF
		// 	this.mem_size = this.bf.readUInt32()

		// 	const compressed_u32 = this.bf.readUInt16()

		// 	this.compressed = compressed_u32 == 0xffff

		// 	bf.position += 2
		// } else if (index_type === 3) {
		// 	this.raw_type = in_type!
		// 	this.type = IndexType[this.raw_type as keyof typeof IndexType] ||
		// 		'ukn'

		// 	this.hash = Long.fromBytes([...this.bf.readBytes(8)], true, false)

		// 	this.offset = this.bf.readUInt32()
		// 	this.file_size = this.bf.readUInt32() & 0x7FFFFFFF
		// 	this.mem_size = this.bf.readUInt32()

		// 	const compressed_u32 = this.bf.readUInt16()

		// 	this.compressed = compressed_u32 == 0xffff

		// 	bf.position += 2
		// } else if (index_type === 4) {
		// 	this.raw_type = this.bf.readUInt32()
		// 	this.type = IndexType[this.raw_type as keyof typeof IndexType] ||
		// 		'ukn'

		// 	this.hash = Long.fromBytes([...this.bf.readBytes(8)], true, false)

		// 	this.offset = this.bf.readUInt32()
		// 	this.file_size = this.bf.readUInt32() & 0x7FFFFFFF
		// 	this.mem_size = this.bf.readUInt32()

		// 	const compressed_u32 = this.bf.readUInt16()

		// 	this.compressed = compressed_u32 == 0xffff

		// 	bf.position += 2
		// } else if (index_type === 7) {
		// 	this.raw_type = this.bf.readUInt32()
		// 	this.type = IndexType[this.raw_type as keyof typeof IndexType] ||
		// 		'ukn'
		// 	this.group = this.bf.readUInt32()

		// 	this.hash = Long.fromBytes([...this.bf.readBytes(8)], true, false)

		// 	this.offset = this.bf.readUInt32()
		// 	this.file_size = this.bf.readUInt32() & 0x7FFFFFFF
		// 	this.mem_size = this.bf.readUInt32()

		// 	const compressed_u32 = this.bf.readUInt16()

		// 	this.compressed = compressed_u32 == 0xffff

		// 	bf.position += 2
		// } else {
		// 	throw new Error(`Invalid index type: ${index_type}`)
		// }
	}
	public serialize() {
		return {
			type: this.type,
			offset: this.offset,
			group: this.group,
			file_size: this.file_size,
			mem_size: this.file_size,
			compressed: this.compressed,
			hash: hash(this.hash),
		}
	}

	public getEntry(): Entry {
		return new Entry(
			this.bf,
			this,
			this.dbpf,
		)
	}
}

// export class Index4 implements Index {
// 	public static Type = 4
// 	public type: (typeof IndexType)[keyof typeof IndexType]
// 	public raw_type: number
// 	public group: number
// 	public instance: number
// 	public offset: number
// 	public disk_size: number
// 	public mem_size: number
// 	public compressed: boolean

// 	constructor(private bf: BinReader) {
// 		this.raw_type = this.bf.readUInt32()
// 		this.type = IndexType[this.raw_type as keyof typeof IndexType] || 'ukn'

// 		this.group = this.bf.readUInt32()
// 		this.instance = this.bf.readUInt32()
// 		this.offset = this.bf.readUInt32()
// 		this.disk_size = this.bf.readUInt32()
// 		this.mem_size = this.bf.readUInt32()

// 		const compressed_u32 = this.bf.readUInt16()

// 		this.compressed = compressed_u32 == 0xffff

// 		bf.position += 2
// 	}

// 	public getEntry() {
// 		return new Entry(
// 			this.bf,
// 			this.offset,
// 			this.mem_size,
// 			this.type,
// 			this.compressed,
// 		)
// 	}
// }

// export class Index2 implements Index {
// 	public static Type = 2
// 	public type: (typeof IndexType)[keyof typeof IndexType]
// 	public raw_type: number
// 	public group: number
// 	public instance: number
// 	public offset: number
// 	public disk_size: number
// 	public mem_size: number
// 	public compressed: boolean

// 	constructor(private bf: BinReader) {
// 		this.raw_type = this.bf.readUInt32()
// 		this.type = IndexType[this.raw_type as keyof typeof IndexType] || 'ukn'

// 		this.group = this.bf.readUInt32()
// 		this.instance = this.bf.readUInt32()
// 		this.offset = this.bf.readUInt32()
// 		this.disk_size = this.bf.readUInt32()
// 		this.mem_size = this.bf.readUInt32()

// 		const compressed_u32 = this.bf.readUInt16()

// 		this.compressed = compressed_u32 == 0xffff

// 		bf.position += 2
// 	}

// 	public getEntry() {
// 		return new Entry(
// 			this.bf,
// 			this.offset,
// 			this.mem_size,
// 			this.type,
// 			this.compressed,
// 		)
// 	}
// }

// export class Index0 implements Index {
// 	public static Type = 0
// 	public type: (typeof IndexType)[keyof typeof IndexType]
// 	public raw_type: number
// 	public group: number
// 	public instance_hi: number
// 	public instance_lo: number
// 	public offset: number
// 	public disk_size: number
// 	public mem_size: number
// 	public compressed: boolean

// 	constructor(private bf: BinReader) {
// 		this.raw_type = this.bf.readUInt32()
// 		this.type = IndexType[this.raw_type as keyof typeof IndexType] || 'ukn'

// 		this.group = this.bf.readUInt32()
// 		this.instance_hi = this.bf.readUInt32()
// 		this.instance_lo = this.bf.readUInt32()
// 		this.offset = this.bf.readUInt32()
// 		this.disk_size = this.bf.readUInt32()
// 		this.mem_size = this.bf.readUInt32()

// 		const compressed_u32 = this.bf.readUInt16()

// 		this.compressed = compressed_u32 == 0xffff

// 		bf.position += 2
// 	}

// 	public getEntry() {
// 		return new Entry(
// 			this.bf,
// 			this.offset,
// 			this.mem_size,
// 			this.type,
// 			this.compressed,
// 		)
// 	}
// }

// export class Index3 implements Index {
// 	public static Type = 3
// 	public type: (typeof IndexType)[keyof typeof IndexType]
// 	public raw_type: number
// 	public group: number
// 	public instance: number
// 	public offset: number
// 	public disk_size: number
// 	public mem_size: number
// 	public compressed: boolean

// 	constructor(private bf: BinReader) {
// 		this.raw_type = this.bf.readUInt32()
// 		this.type = IndexType[this.raw_type as keyof typeof IndexType] || 'ukn'

// 		this.group = this.bf.readUInt32()
// 		this.instance = this.bf.readUInt32()
// 		this.offset = this.bf.readUInt32()
// 		this.disk_size = this.bf.readUInt32()
// 		this.mem_size = this.bf.readUInt32()

// 		const compressed_u32 = this.bf.readUInt16()

// 		this.compressed = compressed_u32 == 0xffff

// 		bf.position += 2
// 	}

// 	public getEntry() {
// 		return new Entry(
// 			this.bf,
// 			this.offset,
// 			this.mem_size,
// 			this.type,
// 			this.compressed,
// 		)
// 	}
// }
