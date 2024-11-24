import Long from 'https://deno.land/x/long@v1.0.0/mod.ts'
import { Buffer } from 'node:buffer'

export class FNV {
	public static PRIME_32 = Long.fromString('01000193', true, 16)
	public static PRIME_64 = Long.fromString('00000100000001B3', true, 16)

	public static OFFSET_32 = Long.fromString('811C9DC5', true, 16)
	public static OFFSET_64 = Long.fromString('CBF29CE484222325', true, 16)
	public static create32(data: Buffer): number {
		let hash = FNV.OFFSET_32

		for (let i = 0; i < data.length; i++) {
			hash = hash.mul(FNV.PRIME_32)
			hash = hash.xor(data[i])
		}

		return hash.getLowBitsUnsigned()
	}

	public static create64(data: Buffer): Long {
		let hash = FNV.OFFSET_64

		for (let i = 0; i < data.length; i++) {
			hash = hash.mul(FNV.PRIME_64)
			hash = hash.xor(data[i])
		}

		return hash
	}

	public static fromString32(data: string): number {
		return FNV.create32(Buffer.from(data.toLowerCase(), 'utf8'))
	}

	public static fromString64(data: string): Long {
		return FNV.create64(Buffer.from(data.toLowerCase(), 'utf8'))
	}
}
