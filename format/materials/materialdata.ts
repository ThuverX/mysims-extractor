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
	diffuseColor= 0x7FEE2D1A,
	useLights= 0x76F88689,
	highlightMultiplier= 0x2616B09A,
	diffuseMap= 0x6CC0FD85,
	ambientMap= 0x20CB22B7,
	specularMap= 0xAD528A60,
	alphaMap= 0x2A20E51B,
	shadowReceiver= 0xF46B90AE,
	blendmode= 0xB2649C2F,
	transparency= 0x05D22FD3,
	ambient= 0x04A5DAA3,
	diffuse= 0x637DAA05,
	greenChannelMultiplier= 0xD1F4CB96,
	blueChannelMultiplier= 0x7BB10C17,
	redChannelMultiplier= 0x99BF82F6,
	nightTint= 0x689AEFFE,
	dayTint= 0xFBBBB5C2,
	overbrightDay= 0x1D17D10F,
	negativeColorBiasNight= 0xDB88EC28,
	negativeColorBiasDay= 0x29214C0C,
	overbrightNight= 0xB779F79B,
	specularColor= 0xBF2AD9B3,
	specular= 0x2CE11842,
	transparent= 0x988403F9,
	vNormalWaveSpeed= 0xAB26E148,
	emissionMap= 0xF303D152,
	vReflectionWaveSpeed= 0xDB319586,
	normalMapScale= 0x3C45E334,
	jitterScale= 0xA2E40EAB,
	waveFrequency= 0x02937388,
	uReflectionWaveSpeed= 0x50E0193B,
	waterColorBlue= 0x2A93BAFB,
	baseAlpha= 0x5916ED3E,
	reflectionSharpness= 0xE460597B,
	intensity= 0x933E38F4,
	waveAmplitude= 0x11EFE2FD,
	noiseFrequency= 0x7FD42F11,
	ShinyPower= 0xBD237B0D,
	VspeedLayer2= 0x2E18B549,
	warpAmp= 0xDB5EBEE7,
	VspeedLayer0= 0x2E18B54B,
	VspeedLayer1= 0x2E18B54A,
	UspeedLayer1= 0x7EEA0C2B,
	UspeedLayer0= 0x7EEA0C2A,
	UspeedLayer2= 0x7EEA0C28,
	reflectionIntensity= 0xD552A779,
	reflectionAmount= 0xB32A1342,
	uNormalWaveSpeed= 0x9F63578D,
	diffuseAlpha= 0xF72FCA9B,
	contrastSubtractColor= 0x7490C750,
	contrastMultiplyColor= 0x6612378C,
	amBodyShakespeare= 0x9038F94B,
	amHeadHairLongSpikey= 0x1067900C,
	auHeadHairBigFro= 0x0923FB40,
	afBodyLayeredSkirt= 0x58B2F06D,
	afHeadHairFortune= 0x80C83701,
	amHeadHairSpikey= 0x75486BDE,
	afHeadHairTightBun= 0x6C8C62C9,
	afHeadHatPirateGinny= 0x61F36B5B,
	auHeadHatCap= 0xE17E380C,
	faceSkinTones= 0x0FDC6FDC,
	auHeadHairFlowerCrown= 0x9EDA8CF5,
	amHeadHatBellhop= 0xF0D0E420,
	amHeadHatMagician= 0xC1519BCF,
	auHeadHatPilotGoggles= 0x8F0C0492,
	afBodyLowPoofSkirt= 0xC5AE022B,
	afBodyMayor= 0x383B9128,
	auHeadHatCapback= 0xD89AD4D5,
	afHeadHairLibrarian= 0x7255E7BE,
	afBodyTurtleneckBaggy= 0xE2498117,
	auHeadHatBeenie= 0xBCB6F07C,
	afHeadHairSmallBraids= 0xFCDF8C6A,
	afHeadHairPuffyLayers= 0x359839D2,
	amHeadHairIvyLeague= 0xDE545F5E,
	afHeadHairMayor= 0x146CB6B6,
	amHeadHairNigel= 0xE97A9352,
	auHeadHatNinja= 0xB4DE4520,
	auHeadHairMidShaggy= 0x7C22B02C,
	afBodyShortApron= 0x556E4212,
	afHeadHairCurlsRibbons= 0x8CBF470E,
	auBodyPantsJacketBag= 0x3B2679D5,
	afBodyShortSkirtSweater= 0xD12B0C98,
	amHeadHairRay= 0xCF76A1C7,
	amHeadHairArcade= 0xE029E90D,
	afBodyHighPoofLongSkirt= 0xF434AA77,
	afHeadHatBandanaDreads= 0xEA080C69,
	auHeadHairFoxEars= 0xC9314483,
	afBodyCollarSkirt= 0x7D6FDC4C,
	afBodyCoatSkirt= 0xC51BB766,
	afHeadHairStylishPeacock= 0xE806C452,
	afBodyKimono= 0x5F00B265,
	auHeadHatTopHat= 0x16E4CA30,
	amHeadHatChef= 0xB7A93AA8,
	auBodyKnight= 0x6515EB2C,
	amHeadHairEthan= 0xE9CA3E0B,
	afHeadHairClara= 0x0A371797,
	afHeadHatWendalyn= 0x6E2B178D,
	amBodyHauntedHouseBoy= 0xA822B3E8,
	auHeadHatMohawk= 0xD59381FB,
	auHeadHairSuperShortLayered= 0xE72A5F1C,
	amHeadHairTim= 0xEB85D831,
	auBodyHoodiePants= 0x79A3B7FF,
	afBodyLongSleeveLongDress= 0xD01B0A09,
	afHeadHatCowgirl= 0x4A351BDC,
	auHeadHatBald= 0x9ED158AB,
	amBodyMartialArts= 0xD9DFB575,
	propBookClosed= 0xE2B571A9,
	amBodyFlipper= 0xE1A22A57,
	afBodyLongSkirtLargeCuff= 0x66BA9C80,
	auHeadHatPirate= 0xE4F0D787,
	auHeadHairShortFlatBangs= 0x26F07855,
	auBodyBellhop= 0x2836EA65,
	auBodyApronBear= 0xC800D94B,
	afBodyKneeLengthSkirt= 0xDD91B6B6,
	auHeadHatRasta= 0x8D58D24F,
	afBodyLongSkirt= 0x32E0CA0B,
	auBodySkinTight= 0x23C6D774,
	auBodyCalfLengthPants= 0x7BEBDD19,
	plumbobColor= 0xEDDCECE1,
	afHeadHairDoubleBuns= 0x455BEF77,
	auHeadHairHairspraySpikey= 0xC36D202B,
	afHeadHairRaveKimono= 0xAFC8F11B,
	auHeadHairBowlCut= 0x40A202A7,
	amHeadHairCruise= 0xAD6D2254,
	auBodyLongPantsBoots= 0x57059004,
	afHeadHatNewspaperCap= 0x791597CA,
	afHeadHatBandana= 0x5519CFB6,
	afHeadHairAlexa= 0x811F207F,
	afHeadHairStreakedLolita= 0x37C3B76C,
	afHeadHairPuffyLayersBunny= 0xF8404FFA,
	auBodyApronTshirtPants= 0xBE323F01,
	auBodyLongPantsShortSleeves= 0xC34A68D0,
	amBodyArcade= 0xBCF4239B,
	afBodyAlexa= 0xB3F9D3F1,
	afBodyAsymmetricalSkirt= 0xCB6A2C62,
	auHeadHatCadet= 0x88B04723,
	auBodyBear= 0x8157DC19,
	auHeadHairDisco= 0x4E053DBD,
	afBodyShortSleeveApron= 0xAF284852,
	auBodyRolledSleevesLongPants= 0x8804B9B4,
	afHeadHairPigTail= 0x4487E3D4,
	afHeadHairLooseCurlsLong= 0xEBBB243F,
	afHeadHairLong= 0xBBF23C58,
	afHeadHairPigTailFlowers= 0xB9642FF0,
	afHeadHairLongBraid= 0xAA3CD006,
	afHeadHairLongPigtail= 0x804AD79A,
	afHeadHatBeaniePigtails= 0x608CAA94,
	afBodyChineseDress= 0xC3DD71DA,
	amHeadHatCowboy= 0xD987C7AD,
	afBodyFloristYoungerSister= 0x667D4E9C,
	auHeadHatEarhat= 0x1688F273,
	afHeadHairHighSalon= 0x4038B561,
	afHeadHairSoftBobBangs= 0xB857A450,
	afHeadHairKarine= 0x16229F12,
	amBodyGothCoat= 0xE808F034,
	afHeadHairBangsHighPonyTail= 0xEBB1363D,
	amHeadHatMartialArts= 0x10B11928,
	auHeadHairShortFro= 0x31B41A58,
	afBodyWendalyn= 0x32FF6934,
	amHeadHatShakespeare= 0x172754F2,
	auBodyBackpack= 0x4CF48F41,
	auHeadHairLongLayered= 0x5E5E0BB5,
	afHeadHairBee= 0xDB272B16,
	amHeadHairSlickBack= 0x0562A36E,
	afHeadHatFedoraHeadset= 0xADF12CDC,
	auBodySuitBowTie= 0x206508D6,
	amHeadHatNewspaperCap= 0x21EAEAC7,
	auBodyNoSleevesLongPants= 0x0568E523,
	amHeadHairPompadour= 0x4C34687C,
	auBodyPirate= 0x1F8C55E8,
	auBodyShortPantsShortSleeves= 0x6293CA92,
	amBodyChef= 0x57CFFD77,
	afBodyShortSkirtBag= 0x9E77273B,
	afHeadHairPuffyLayersTiara= 0x407405F3,
	amHeadHairSidePart= 0x61AB1E17,
	amBodySamurai= 0x69E3E1A7,
	amHeadHairShort= 0xF67D2839,
	amHeadHatFlipper= 0x68592352,
	afBodyFortuneTeller= 0x1437614B,
	auBodyShortSleevApronPants= 0xA8EC7CF0,
	auHeadHatVisor= 0x7FD2FD6D,
	auHeadHairMuseum= 0x94F2A3F5,
	amHeadHatBuzzCut= 0xAB532E19,
	auBodyShortJacketClosed= 0xEAE93C5D,
	afBodyHighPoofSkirt= 0x115E90E5,
	auHeadHatHippieBandana= 0xA66E30F0,
	afBodySmallWings= 0xE042258B,
	afHeadHairStylish= 0x6C25C854,
	afHeadHairLayeredBangsMedium= 0x30872F06,
	afHeadHatCrumplebottom= 0x6A7C3EFC,
	amHeadHatFedora= 0x0A0BF0F7,
	auHeadHairDandelion= 0x5C211319,
	auBodyNinja= 0x1514F851,
	auHeadHairSushi= 0x018261BD,
	afHeadHairLongLayered= 0x2A45864C,
	afHeadHairLongPonytail= 0x22DF72CE,
	auHeadHairVeryShortSpiky= 0x5A0C9575,
	afHeadHairObservatory= 0x8D6F69F2,
	auBodyBulkySweaterLongPants= 0x8637DF43,
	auHeadHairShortCurly= 0x5FC9D348,
	auBodyLongPantsLongSleeve= 0x86769DAF,
	amHeadHairScientist= 0x2344A259,
	auHeadHatBear= 0x79DBAB9E,
	amHeadHatCombOver= 0x1F0050D9,
	afBodyMini= 0x04985945,
	afHeadHairUpdoRibbons= 0x37A80FC1,
	amHeadHatBaker= 0x3D88B8B3,
	auBodyLabCoat= 0xBCC02D91,
	envmapAlpha= 0x0A345310,
	door_archedTopBar= 0x4A1A7937,
	ukn= 0x0,
};

enum ValueType: u32 {
    color = 1,
    map = 4,
    boolean = 2
};

struct MapExtraParamInfo {
    u64 ref_hash;
    FileType ref_type;
    padding[4];
};

struct BooleanExtraParamInfo {
    u32 val [[hidden]];
    bool isShadowReceiver = val == 0 [[export]];
};

struct ColorExtraParamInfo {
    float r;
    float g;
    float b;
    padding[4];
};

struct Param {
    ParamType type;
    ValueType value_type;
    u32 value_field_count;
    u32 offset;
    u32 jump = $;
    $ = offset + 64;
    if(value_type == ValueType::map) {
        MapExtraParamInfo extraParamInfo;
    } else if(value_type == ValueType::boolean) {
        BooleanExtraParamInfo extraParamInfo;
    } else if(value_type == ValueType::color) {
        ColorExtraParamInfo extraParamInfo;
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

export class MapParamInfo implements ExtraParamInfo {
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

export class BooleanParamInfo implements ExtraParamInfo {
	public value: boolean
	constructor(private bf: BinReader) {
		const val = this.bf.readUInt32()

		this.value = val === 0
	}

	public json() {
		return {
			value: this.value,
		}
	}
}

export class ColorParamInfo implements ExtraParamInfo {
	public color: Vector3 = Vector3.zero
	public alpha: number = 1
	constructor(private bf: BinReader, field_count: number) {
		if (field_count === 1) {
			const value = this.bf.readFloat32()
			this.color.x = value
			this.color.y = value
			this.color.z = value
		} else if (field_count === 2) {
			this.color.x = this.bf.readFloat32()
			this.color.y = this.bf.readFloat32()
			this.color.z = 0
		} else if (field_count === 3) {
			this.color = Vector3.read(this.bf)
		} else if (field_count === 4) {
			this.color = Vector3.read(this.bf)
			this.alpha = this.bf.readFloat32()
		}
	}

	public json() {
		return {
			color: this.color,
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

		const value_type = this.bf.readUInt32()
		const value_field_count = this.bf.readUInt32()
		this.offset = this.bf.readUInt32()

		const jump = this.bf.position

		this.bf.position = this.offset + 64

		switch (value_type) {
			case 1:
				this.extraParamInfo = new ColorParamInfo(
					this.bf,
					value_field_count,
				)
				break
			case 2:
				this.extraParamInfo = new BooleanParamInfo(this.bf)
				break
			case 4:
				this.extraParamInfo = new MapParamInfo(this.bf)
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
