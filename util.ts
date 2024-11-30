import Long from 'https://deno.land/x/long@v1.0.0/mod.ts'
import type { BinReader } from 'jsr:@exts/binutils'
import { readdir } from 'node:fs'
import { join } from 'node:path'
import { FNV } from './format/fnv/fnv.ts'

export function hex(num: number) {
	const hexNum = num.toString(16)
	let len = hexNum.length
	if (len < 6) len = 6
	return '0x' + hexNum.toUpperCase().padStart(len, '0')
}

export function bitFlags<T extends Record<string, number>>(
	obj: T,
	num: number,
): Array<keyof T> {
	const turnedOn: Array<keyof T> = []

	for (const [key, bitPosition] of Object.entries(obj)) {
		if ((num & (1 << bitPosition)) !== 0) {
			turnedOn.push(key)
		}
	}

	return turnedOn
}

export function hash_tostring(
	num: number | bigint | Long,
	pad?: number,
): string {
	if (num instanceof Long) {
		return `0x` +
			num.toString(16).padStart(pad ?? 16, '0').toUpperCase()
	} else {
		return `0x` +
			num.toString(16).padStart(pad ?? 8, '0').toUpperCase()
	}
}

export function read_cstring(bf: BinReader): string {
	let str = ''
	let offset = bf.position
	while (bf.buffer[offset] != 0) {
		str += String.fromCharCode(bf.buffer[offset])
		offset++
	}
	bf.position = offset
	return str
}

export function swap32(val: number) {
	return ((val & 0xff) << 24) | ((val & 0xff00) << 8) |
		((val >> 8) & 0xff00) |
		((val >> 24) & 0xff)
}

export function swap16(val: number) {
	return ((val & 0xff) << 8) | ((val >> 8) & 0xff)
}

export type HashLike = string | bigint | number | Long

export function create_hash(value: HashLike): bigint {
	if (value instanceof Long) return BigInt(value.toString())
	else if (typeof value === 'number') {
		return BigInt(value)
	} else if (typeof value === 'bigint') {
		return value
	} else {
		return BigInt(FNV.fromString64(value).toString())
	}
}

export function compare_hash(
	a: HashLike,
	b: HashLike,
): boolean {
	return create_hash(a) === create_hash(b)
}
