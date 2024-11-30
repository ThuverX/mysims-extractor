export interface Vec3 {
	x: number
	y: number
	z: number
}

export interface BoundingBox {
	min: Vec3
	max: Vec3
}

export type Resolver<T> = {
	path: string
	resolve: () => T
}

export interface Color {
	r: number
	g: number
	b: number
	a?: number
}
