import Long from 'https://deno.land/x/long@v1.0.0/mod.ts'
import { BinReader } from 'jsr:@exts/binutils'
import { IndexType } from '../index.ts'
import { hash, hex } from '../../util.ts'
import { Vector3 } from '../windowsmodel/windowsmodel.ts'

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

enum ParamType : u32 {
    diffuseColor = 0x7FEE2D1A,
    useLights = 0x76F88689,
    highlightMultiplier = 0x2616B09A,
    diffuseMap = 0x6CC0FD85,
    ambientMap = 0x20CB22B7,
    specularMap = 0xAD528A60,
    alphaMap = 0x2A20E51B,
    shadowReceiver = 0xF46B90AE,
    blendmode = 0xB2649C2F,
    unk = 0x988403F9
};

struct Param {
    ParamType type;
    u32 ukn;
    u32 ref_size [[hidden]];
    u32 size = ref_size * 4 [[export]];
    u32 offset;
    u32 jump = $;
    $ = offset + 64;
    if(type == ParamType::diffuseMap
    || type == ParamType::ambientMap
    || type == ParamType::specularMap
    || type == ParamType::alphaMap) {
        u64 ref_hash;
        FileType ref_type;
        padding[4];
    } else if(type == ParamType::shadowReceiver) {
        u32 val [[hidden]];
        bool isShadowReceiver = val == 0 [[export]];
    } else if(type == ParamType::useLights) {
        u32 val [[hidden]];
        bool usesLights = val == 0 [[export]];
    } else if(type == ParamType::blendmode) {
        u32 blendMode;
    } else if(type == ParamType::diffuseColor) {
        float r;
        float g;
        float b;
        float a;
    }

    $ = jump;
};

struct Header {
    $ = 64;
    $ += 8;
    $ += 4;
    u32 num_params;
    Param params[num_params];
};

Header header @ $;
*/

const MaterialParameterType = {
	0x7FEE2D1A: 'diffuseColor',
	0x76F88689: 'useLights',
	0x2616B09A: 'highlightMultiplier',
	0x6CC0FD85: 'diffuseMap',
	0x20CB22B7: 'ambientMap',
	0xAD528A60: 'specularMap',
	0x2A20E51B: 'alphaMap',
	0xF46B90AE: 'shadowReceiver',
	0xB2649C2F: 'blendmode',
	0x988403F9: 'ukn',
} as const

interface ExtraParamInfo {
	json(): any
}

export class TextureParamInfo implements ExtraParamInfo {
	public ref_hash: Long
	public ref_type: (typeof IndexType)[keyof typeof IndexType]

	constructor(private bf: BinReader) {
		const hash_hi = this.bf.readUInt32()
		const hash_lo = this.bf.readUInt32()
		this.ref_hash = new Long(hash_hi, hash_lo, true)

		const raw_type = this.bf.readUInt32()
		this.ref_type = IndexType[
			raw_type as keyof typeof IndexType
		] ||
			'ukn'

		this.bf.position += 4
	}

	public json() {
		return {
			ref_hash: hash(this.ref_hash),
			ref_type: this.ref_type,
		}
	}
}

export class ShadowReceiverParamInfo implements ExtraParamInfo {
	public isShadowReceiver: boolean
	constructor(private bf: BinReader) {
		const val = this.bf.readUInt32()

		this.isShadowReceiver = val === 0
	}

	public json() {
		return {
			isShadowReceiver: this.isShadowReceiver,
		}
	}
}

export class UseLightsParamInfo implements ExtraParamInfo {
	public isUseLights: boolean
	constructor(private bf: BinReader) {
		const val = this.bf.readUInt32()

		this.isUseLights = val === 0
	}

	public json() {
		return {
			isUseLights: this.isUseLights,
		}
	}
}

export class DiffuseColorParamInfo implements ExtraParamInfo {
	public diffuseColor: Vector3
	constructor(private bf: BinReader) {
		this.diffuseColor = Vector3.read(this.bf)
	}

	public json() {
		return {
			diffuseColor: this.diffuseColor,
		}
	}
}

class MaterialParameter {
	public raw_type: number
	public type:
		(typeof MaterialParameterType)[keyof typeof MaterialParameterType]

	public offset: number
	public extraParamInfo?: ExtraParamInfo

	constructor(private bf: BinReader) {
		this.raw_type = bf.readUInt32()
		this.type = MaterialParameterType[
			this.raw_type as keyof typeof MaterialParameterType
		] ||
			'ukn'

		this.bf.position += 8
		this.offset = this.bf.readUInt32()

		const jump = this.bf.position

		/*
		$ = offset + 64;
    if(type == ParamType::diffuseMap
    || type == ParamType::ambientMap
    || type == ParamType::specularMap
    || type == ParamType::alphaMap) {
        u64 ref_hash;
        FileType ref_type;
        padding[4];
    } else if(type == ParamType::shadowReceiver) {
        u32 val [[hidden]];
        bool isShadowReceiver = val == 0 [[export]];
    } else if(type == ParamType::useLights) {
        u32 val [[hidden]];
        bool usesLights = val == 0 [[export]];
    } else if(type == ParamType::blendmode) {
        u32 blendMode;
    } else if(type == ParamType::diffuseColor) {
        float r;
        float g;
        float b;
        float a;
    }*/

		this.bf.position = this.offset + 64

		switch (this.type) {
			case 'diffuseMap':
			case 'alphaMap':
			case 'ambientMap':
			case 'specularMap':
				this.extraParamInfo = new TextureParamInfo(this.bf)
				break

			case 'shadowReceiver':
				this.extraParamInfo = new ShadowReceiverParamInfo(this.bf)
				break

			case 'useLights':
				this.extraParamInfo = new UseLightsParamInfo(this.bf)
				break

			case 'diffuseColor':
				this.extraParamInfo = new DiffuseColorParamInfo(this.bf)
				break
			case 'highlightMultiplier':
			case 'blendmode':
			case 'ukn':
			default:
				// console.log(`Unknown param type: ${hex(this.raw_type)}`)
				break
		}

		this.bf.position = jump
	}

	public json() {
		const json: any = {}
		json.type = this.type
		json.offset = this.offset
		json.extra = this.extraParamInfo?.json()

		return json
	}
}

export class MaterialData {
	public paramaters: Array<MaterialParameter> = []
	constructor(private bf: BinReader) {
		this.bf.position = 64
		this.bf.position += 8

		this.bf.position += 4 // data size

		const num_params = this.bf.readUInt32()

		for (let i = 0; i < num_params; i++) {
			this.paramaters.push(new MaterialParameter(this.bf))
		}
	}

	public json() {
		return {
			parameters: this.paramaters.map((p) => p.json()),
		}
	}
}
