/*

enum FileType : u32 {
    Model = 0x01661233,
	RevoModel = 0xf9e50586,
	WindowsModel = 0xb359c791,
	download = 0xd86f5e67,
	rig = 0x8eaf13de,
	clip = 0x6b20c4f3,
	KeyNameMap = 0x0166038c,
	Geometry = 0x015a1849,
	Material = 0x01d0e75d,
	MaterialSet = 0x02019972,
	OldSpeedTree = 0x00b552ea,
	SpeedTree = 0x021d7e8c,
	dds = 0x00b2d882,
	CompositeTexture = 0x8e342417,
	SimOutfit = 0x025ed6f4,
	LevelXml = 0x585ee310,
	LevelBin = 0x58969018,
	Physics = 0xd5988020,
	LightSetXml = 0x50182640,
	LightSetBin = 0x50002128,
	xml = 0xdc37e964,
	FootPrintSet = 0x2c81b60a,
	ObjectConstructionXml = 0xc876c85e,
	ObjectConstructionBin = 0xc08ec0ee,
	SlotXml = 0x4045d294,
	SlotBin = 0x487bf9e4,
	swm = 0xcf60795e,
	SwarmBin = 0x9752e396,
	XmlBin = 0xe0d83029,
	CABXml = 0xa6856948,
	CABBin = 0xc644f440,
	big = 0x5bca8c06,
	bnk = 0xb6b5c271,
	lua = 0x474999b4,
	luo = 0x2b8e2411,
	LightBoxXml = 0xb61215e9,
	LightBoxBin = 0xd6215201,
	xmb = 0x1e1e6516,
	ttf = 0xfd72d418,
	ttc = 0x35ebb959,
	RuntimeSettingsXml = 0x6d3e3fb4,
	ukn = 0x0,
};

struct Ref {
    u32 ref_group;
    u32 ref_hash;
    padding[4];
    FileType ref_type;
};

struct Header {
    padding[12];
    u32 material_count;
    padding[16]; //self??
    Ref refs[material_count];
    padding[28];
    u32 other_count;
    u32 other_values[other_count];
};

Header header @ $;
*/

import { BinReader } from 'jsr:@exts/binutils'
import { IndexType } from '../index.ts'

export class MaterialReference {
	public ref_hash: number
	public ref_group: number
	public ref_type: (typeof IndexType)[keyof typeof IndexType]

	constructor(private bf: BinReader) {
		this.ref_group = this.bf.readUInt32()
		this.ref_hash = this.bf.readUInt32()

		this.bf.position += 4

		const raw_type = this.bf.readUInt32()
		this.ref_type = IndexType[
			raw_type as keyof typeof IndexType
		] ||
			'ukn'
	}
}

export class MaterialSet {
	public materials: Array<MaterialReference> = []
	constructor(private bf: BinReader) {
		this.bf.position += 12
		const material_count = this.bf.readUInt32()
		this.bf.position += 16

		for (let i = 0; i < material_count; i++) {
			this.materials.push(new MaterialReference(this.bf))
		}
	}
}
