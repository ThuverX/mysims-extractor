import Long from 'https://deno.land/x/long@v1.0.0/mod.ts'
import { BinReader } from 'jsr:@exts/binutils'
import { IndexType } from '../index.ts'
import { hash_tostring } from '../../util.ts'
import { Vector3 } from '../windowsmodel/windowsmodel.ts'
import { getHashValue32 } from '../../hashes.ts'
import { appendFileSync } from 'node:fs'

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
	0x05D22FD3: 'transparency',
	0x04A5DAA3: 'ambient',
	0x637DAA05: 'diffuse',
	0xD1F4CB96: 'greenChannelMultiplier',
	0x7BB10C17: 'blueChannelMultiplier',
	0x99BF82F6: 'redChannelMultiplier',
	0x689AEFFE: 'nightTint',
	0xFBBBB5C2: 'dayTint',
	0x1D17D10F: 'overbrightDay',
	0xDB88EC28: 'negativeColorBiasNight',
	0x29214C0C: 'negativeColorBiasDay',
	0xB779F79B: 'overbrightNight',
	0xBF2AD9B3: 'specularColor',
	0x2CE11842: 'specular',
	0x988403F9: 'transparent',
	0xAB26E148: 'vNormalWaveSpeed',
	0xF303D152: 'emissionMap',
	0xDB319586: 'vReflectionWaveSpeed',
	0x3C45E334: 'normalMapScale',
	0xA2E40EAB: 'jitterScale',
	0x02937388: 'waveFrequency',
	0x50E0193B: 'uReflectionWaveSpeed',
	0x2A93BAFB: 'waterColorBlue',
	0x5916ED3E: 'baseAlpha',
	0xE460597B: 'reflectionSharpness',
	0x933E38F4: 'intensity',
	0x11EFE2FD: 'waveAmplitude',
	0x7FD42F11: 'noiseFrequency',
	0xBD237B0D: 'ShinyPower',
	0x2E18B549: 'VspeedLayer2',
	0xDB5EBEE7: 'warpAmp',
	0x2E18B54B: 'VspeedLayer0',
	0x2E18B54A: 'VspeedLayer1',
	0x7EEA0C2B: 'UspeedLayer1',
	0x7EEA0C2A: 'UspeedLayer0',
	0x7EEA0C28: 'UspeedLayer2',
	0xD552A779: 'reflectionIntensity',
	0xB32A1342: 'reflectionAmount',
	0x9F63578D: 'uNormalWaveSpeed',
	0xF72FCA9B: 'diffuseAlpha',
	0x7490C750: 'contrastSubtractColor',
	0x6612378C: 'contrastMultiplyColor',
	0x9038F94B: 'amBodyShakespeare',
	0x1067900C: 'amHeadHairLongSpikey',
	0x0923FB40: 'auHeadHairBigFro',
	0x58B2F06D: 'afBodyLayeredSkirt',
	0x80C83701: 'afHeadHairFortune',
	0x75486BDE: 'amHeadHairSpikey',
	0x6C8C62C9: 'afHeadHairTightBun',
	0x61F36B5B: 'afHeadHatPirateGinny',
	0xE17E380C: 'auHeadHatCap',
	0x0FDC6FDC: 'faceSkinTones',
	0x9EDA8CF5: 'auHeadHairFlowerCrown',
	0xF0D0E420: 'amHeadHatBellhop',
	0xC1519BCF: 'amHeadHatMagician',
	0x8F0C0492: 'auHeadHatPilotGoggles',
	0xC5AE022B: 'afBodyLowPoofSkirt',
	0x383B9128: 'afBodyMayor',
	0xD89AD4D5: 'auHeadHatCapback',
	0x7255E7BE: 'afHeadHairLibrarian',
	0xE2498117: 'afBodyTurtleneckBaggy',
	0xBCB6F07C: 'auHeadHatBeenie',
	0xFCDF8C6A: 'afHeadHairSmallBraids',
	0x359839D2: 'afHeadHairPuffyLayers',
	0xDE545F5E: 'amHeadHairIvyLeague',
	0x146CB6B6: 'afHeadHairMayor',
	0xE97A9352: 'amHeadHairNigel',
	0xB4DE4520: 'auHeadHatNinja',
	0x7C22B02C: 'auHeadHairMidShaggy',
	0x556E4212: 'afBodyShortApron',
	0x8CBF470E: 'afHeadHairCurlsRibbons',
	0x3B2679D5: 'auBodyPantsJacketBag',
	0xD12B0C98: 'afBodyShortSkirtSweater',
	0xCF76A1C7: 'amHeadHairRay',
	0xE029E90D: 'amHeadHairArcade',
	0xF434AA77: 'afBodyHighPoofLongSkirt',
	0xEA080C69: 'afHeadHatBandanaDreads',
	0xC9314483: 'auHeadHairFoxEars',
	0x7D6FDC4C: 'afBodyCollarSkirt',
	0xC51BB766: 'afBodyCoatSkirt',
	0xE806C452: 'afHeadHairStylishPeacock',
	0x5F00B265: 'afBodyKimono',
	0x16E4CA30: 'auHeadHatTopHat',
	0xB7A93AA8: 'amHeadHatChef',
	0x6515EB2C: 'auBodyKnight',
	0xE9CA3E0B: 'amHeadHairEthan',
	0x0A371797: 'afHeadHairClara',
	0x6E2B178D: 'afHeadHatWendalyn',
	0xA822B3E8: 'amBodyHauntedHouseBoy',
	0xD59381FB: 'auHeadHatMohawk',
	0xE72A5F1C: 'auHeadHairSuperShortLayered',
	0xEB85D831: 'amHeadHairTim',
	0x79A3B7FF: 'auBodyHoodiePants',
	0xD01B0A09: 'afBodyLongSleeveLongDress',
	0x4A351BDC: 'afHeadHatCowgirl',
	0x9ED158AB: 'auHeadHatBald',
	0xD9DFB575: 'amBodyMartialArts',
	0xE2B571A9: 'propBookClosed',
	0xE1A22A57: 'amBodyFlipper',
	0x66BA9C80: 'afBodyLongSkirtLargeCuff',
	0xE4F0D787: 'auHeadHatPirate',
	0x26F07855: 'auHeadHairShortFlatBangs',
	0x2836EA65: 'auBodyBellhop',
	0xC800D94B: 'auBodyApronBear',
	0xDD91B6B6: 'afBodyKneeLengthSkirt',
	0x8D58D24F: 'auHeadHatRasta',
	0x32E0CA0B: 'afBodyLongSkirt',
	0x23C6D774: 'auBodySkinTight',
	0x7BEBDD19: 'auBodyCalfLengthPants',
	0xEDDCECE1: 'plumbobColor',
	0x455BEF77: 'afHeadHairDoubleBuns',
	0xC36D202B: 'auHeadHairHairspraySpikey',
	0xAFC8F11B: 'afHeadHairRaveKimono',
	0x40A202A7: 'auHeadHairBowlCut',
	0xAD6D2254: 'amHeadHairCruise',
	0x57059004: 'auBodyLongPantsBoots',
	0x791597CA: 'afHeadHatNewspaperCap',
	0x5519CFB6: 'afHeadHatBandana',
	0x811F207F: 'afHeadHairAlexa',
	0x37C3B76C: 'afHeadHairStreakedLolita',
	0xF8404FFA: 'afHeadHairPuffyLayersBunny',
	0xBE323F01: 'auBodyApronTshirtPants',
	0xC34A68D0: 'auBodyLongPantsShortSleeves',
	0xBCF4239B: 'amBodyArcade',
	0xB3F9D3F1: 'afBodyAlexa',
	0xCB6A2C62: 'afBodyAsymmetricalSkirt',
	0x88B04723: 'auHeadHatCadet',
	0x8157DC19: 'auBodyBear',
	0x4E053DBD: 'auHeadHairDisco',
	0xAF284852: 'afBodyShortSleeveApron',
	0x8804B9B4: 'auBodyRolledSleevesLongPants',
	0x4487E3D4: 'afHeadHairPigTail',
	0xEBBB243F: 'afHeadHairLooseCurlsLong',
	0xBBF23C58: 'afHeadHairLong',
	0xB9642FF0: 'afHeadHairPigTailFlowers',
	0xAA3CD006: 'afHeadHairLongBraid',
	0x804AD79A: 'afHeadHairLongPigtail',
	0x608CAA94: 'afHeadHatBeaniePigtails',
	0xC3DD71DA: 'afBodyChineseDress',
	0xD987C7AD: 'amHeadHatCowboy',
	0x667D4E9C: 'afBodyFloristYoungerSister',
	0x1688F273: 'auHeadHatEarhat',
	0x4038B561: 'afHeadHairHighSalon',
	0xB857A450: 'afHeadHairSoftBobBangs',
	0x16229F12: 'afHeadHairKarine',
	0xE808F034: 'amBodyGothCoat',
	0xEBB1363D: 'afHeadHairBangsHighPonyTail',
	0x10B11928: 'amHeadHatMartialArts',
	0x31B41A58: 'auHeadHairShortFro',
	0x32FF6934: 'afBodyWendalyn',
	0x172754F2: 'amHeadHatShakespeare',
	0x4CF48F41: 'auBodyBackpack',
	0x5E5E0BB5: 'auHeadHairLongLayered',
	0xDB272B16: 'afHeadHairBee',
	0x0562A36E: 'amHeadHairSlickBack',
	0xADF12CDC: 'afHeadHatFedoraHeadset',
	0x206508D6: 'auBodySuitBowTie',
	0x21EAEAC7: 'amHeadHatNewspaperCap',
	0x0568E523: 'auBodyNoSleevesLongPants',
	0x4C34687C: 'amHeadHairPompadour',
	0x1F8C55E8: 'auBodyPirate',
	0x6293CA92: 'auBodyShortPantsShortSleeves',
	0x57CFFD77: 'amBodyChef',
	0x9E77273B: 'afBodyShortSkirtBag',
	0x407405F3: 'afHeadHairPuffyLayersTiara',
	0x61AB1E17: 'amHeadHairSidePart',
	0x69E3E1A7: 'amBodySamurai',
	0xF67D2839: 'amHeadHairShort',
	0x68592352: 'amHeadHatFlipper',
	0x1437614B: 'afBodyFortuneTeller',
	0xA8EC7CF0: 'auBodyShortSleevApronPants',
	0x7FD2FD6D: 'auHeadHatVisor',
	0x94F2A3F5: 'auHeadHairMuseum',
	0xAB532E19: 'amHeadHatBuzzCut',
	0xEAE93C5D: 'auBodyShortJacketClosed',
	0x115E90E5: 'afBodyHighPoofSkirt',
	0xA66E30F0: 'auHeadHatHippieBandana',
	0xE042258B: 'afBodySmallWings',
	0x6C25C854: 'afHeadHairStylish',
	0x30872F06: 'afHeadHairLayeredBangsMedium',
	0x6A7C3EFC: 'afHeadHatCrumplebottom',
	0x0A0BF0F7: 'amHeadHatFedora',
	0x5C211319: 'auHeadHairDandelion',
	0x1514F851: 'auBodyNinja',
	0x018261BD: 'auHeadHairSushi',
	0x2A45864C: 'afHeadHairLongLayered',
	0x22DF72CE: 'afHeadHairLongPonytail',
	0x5A0C9575: 'auHeadHairVeryShortSpiky',
	0x8D6F69F2: 'afHeadHairObservatory',
	0x8637DF43: 'auBodyBulkySweaterLongPants',
	0x5FC9D348: 'auHeadHairShortCurly',
	0x86769DAF: 'auBodyLongPantsLongSleeve',
	0x2344A259: 'amHeadHairScientist',
	0x79DBAB9E: 'auHeadHatBear',
	0x1F0050D9: 'amHeadHatCombOver',
	0x04985945: 'afBodyMini',
	0x37A80FC1: 'afHeadHairUpdoRibbons',
	0x3D88B8B3: 'amHeadHatBaker',
	0xBCC02D91: 'auBodyLabCoat',
	0x0A345310: 'envmapAlpha',
	0x4A1A7937: 'door_archedTopBar',
	0x0: 'ukn',
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
			ref_hash: hash_tostring(this.ref_hash),
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

		if (this.type == 'ukn') {
			const name_value = getHashValue32(this.raw_type)
			if (name_value != undefined) {
				console.log(
					`Found name value for material data param: ${
						hash_tostring(this.raw_type)
					} "${name_value}"`,
				)

				appendFileSync(
					'mats.txt',
					`${hash_tostring(this.raw_type)}:'${name_value}'\n`,
				)
			}
		}

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
			case 'transparency':
			case 'ambient':
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
