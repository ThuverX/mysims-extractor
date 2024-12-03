import type { BinReader } from 'jsr:@exts/binutils'
import { read_cstring } from '../../util.ts'

// I think i figured out how Vertex Types work, vert_type is a count of 7 bit values:
/*
import std.mem;

enum ValueType: u8 {
    Vector4 = 4,
    Vector3 = 2,
    Vector2 = 1,
};

struct ValueEntry {
    u8 offset;
    padding[3];
    ValueType type;
    u8 index; // probably which value to attach this to
    u8 sub_index; // is one only in vert_type = 4, maybe an index, so if 0 for uv it would be uv[0] and 1 would be uv[1]
};

struct File {
    ValueEntry values[while(!std::mem::eof())];
};

File file @ $;
*/

/*
import std.string;

struct Vector3 {
    float x;
    float y;
    float z;
};

struct Vector2 {
    float x;
    float y;
};

struct Weight {
    u32 a;
    u32 b;
    u32 c;
    float d;
};

struct Vertex3 {
    Vector3 position;
    Vector3 normal;
    Vector2 uv;
};

struct Vertex4 {
    Vector3 position;
    Vector3 normal;
    Vector2 uv;
    Vector2 uv2;
};

struct Vertex5 {
    Vector3 position;
    Weight weight;
    Vector3 normal;
    Vector2 uv;
};

struct Vertex6 {
    Vector3 position;
    Weight weight;
    Vector3 normal;
    Vector2 uv;
    Vector2 uv2;
};

struct Face {
    u16 a;
    u16 b;
    u16 c;
};

struct Bone {
    float; // also always same?
    float ukn[11];
    float x;
    float y;
    float z;
    float; // same for every bone
};

struct Rig {
    u32 num_bones;
    u32 bone_hashes[num_bones];
    Bone bones[num_bones];
};

struct Mesh {
    u32 material_hash;
    padding[8];
    u32 group_hash;
    u8 same_as_header[24];
    padding[52-24];
    u32 num_verts;
    u32 num_faces;
    u32 vert_type;

    u8 vertkeys[vert_type * 7];

    if(vert_type == 3) {
        u32 verts_size;
        Vertex3 vertices[num_verts];
    } else if(vert_type == 4) {
        u32 verts_size;
        Vertex4 vertices[num_verts];
    } else if(vert_type == 5) {
        u32 verts_size;
        Vertex5 vertices[num_verts];
    } else if(vert_type == 6) {
        u32 verts_size;
        Vertex6 vertices[num_verts];
    }

    u32 faces_size;
    Face faces[num_faces];
    s32 rig;
};

struct Header {
    u8 version;
    char magic[6];
    u16 blank;
    padding[24];

    u32 num_extra_params;
    u32 param_ids[num_extra_params];
    if(num_extra_params != 0) {
        u32 extra_params_size;
        std::string::NullString params[num_extra_params];
    } else {
        padding[1];
    }

    u32 num_rigs;
    Rig rigs[num_rigs];
    u32 num_meshes;
    Mesh meshes[num_meshes];
};

Header header @ 0;
*/

// hexpattern and link below are outdated, will write document better later
// use code below as example for now

// based on https://github.com/Olivercomet/MorcuTool/blob/master/MorcuTool/src/FileTypes/Model/WindowsModel.cs
export class WindowsModel {
	public param_ids: Array<number> = []
	public params: Array<string> = []
	public rigs: Array<Rig> = []
	public meshes: Array<Mesh> = []
	constructor(private bf: BinReader) {
		this.bf.position = 33

		const num_extra_params = this.bf.readUInt32()
		for (let i = 0; i < num_extra_params; i++) {
			this.param_ids.push(this.bf.readUInt32())
		}

		if (num_extra_params != 0) {
			this.bf.position += 4 // extra_params_size
			for (let i = 0; i < num_extra_params; i++) {
				this.params.push(read_cstring(this.bf))
			}
		} else {
			this.bf.position++
		}

		const num_rigs = this.bf.readUInt32()
		for (let i = 0; i < num_rigs; i++) {
			this.rigs.push(new Rig(this.bf))
		}

		const num_meshes = this.bf.readUInt32()
		for (let i = 0; i < num_meshes; i++) {
			this.meshes.push(new Mesh(this, this.bf))
		}
	}
}

export class Rig {
	public bonehashes: Array<number> = []
	public bones: Array<Bone> = []

	constructor(private bf: BinReader) {
		const num_bones = this.bf.readUInt32()
		for (let i = 0; i < num_bones; i++) {
			this.bonehashes.push(this.bf.readUInt32())
		}
		console.log(this.bonehashes)
		for (let i = 0; i < num_bones; i++) {
			this.bones.push(new Bone(this.bf))
		}
	}
}

const VertexType = {
	1: 'Vector2',
	2: 'Vector3',
	4: 'float',
	0: 'ukn',
} as const

export interface VertexValue {
	offset: number
	type: (typeof VertexType)[keyof typeof VertexType]
	index: number
	sub_type: number
}

export class Mesh {
	public vertices: Array<Vertex> = []
	public faces: Array<Face> = []
	public rig?: Rig
	public material_hash: number
	public group_hash: number
	constructor(private wModel: WindowsModel, private bf: BinReader) {
		this.material_hash = this.bf.readUInt32()
		this.bf.position += 8
		this.group_hash = this.bf.readUInt32()
		this.bf.position += 52
		const num_verts = this.bf.readUInt32()
		const num_faces = this.bf.readUInt32()
		const vertex_value_count = this.bf.readUInt32()

		const vertex_keys: Array<VertexValue> = []

		for (let i = 0; i < vertex_value_count; i++) {
			vertex_keys.push(this.readVertexType())
		}

		const vertex_array_size = this.bf.readUInt32()
		const single_vertex_size = vertex_array_size / num_verts

		for (let i = 0; i < vertex_array_size; i += single_vertex_size) {
			const start = this.bf.position
			const vert = new Vertex()

			for (const vertex_key of vertex_keys) {
				this.bf.position = start + vertex_key.offset
				let value: any = null
				switch (vertex_key.type) {
					case 'Vector2':
						value = Vector2.read(this.bf)
						break
					case 'Vector3':
						value = Vector3.read(this.bf)
						break
					case 'float':
						value = this.bf.readFloat32()
						break
					case 'ukn':
					default:
						throw new Error(
							`Unknown vertex_key.type: ${vertex_key.type} not yet implemented`,
						)
				}

				if (value) {
					vert.set_by_index(
						vertex_key.index,
						value,
						vertex_key.sub_type,
					)
				}
			}

			this.vertices.push(vert)
		}

		this.bf.position += 4 // faces_size
		for (let i = 0; i < num_faces; i++) {
			this.faces.push(new Face(this.bf))
		}

		const rig_index = this.bf.readInt32()
		if (rig_index !== -1) {
			this.rig = this.wModel.rigs[rig_index]
		}
	}

	readVertexType(): VertexValue {
		const offset = this.bf.readUInt32()
		const raw_type = this.bf.readUInt8()

		const type = VertexType[
			raw_type as keyof typeof VertexType
		] ||
			'ukn'

		const index = this.bf.readUInt8()
		const sub_type = this.bf.readUInt8()

		return {
			offset,
			type,
			index,
			sub_type,
		}
	}
}

export class Vertex {
	public position: Vector3 = Vector3.zero
	public normal: Vector3 = Vector3.zero
	public uvs: Array<Vector2> = []
	public weight: number = 0

	public set_by_index(index: number, value: any, sub_index: number) {
		switch (index) {
			case 0:
				this.position = value
				break
			case 1:
				this.normal = value
				break
			case 2:
				this.uvs[sub_index] = value
				break
			case 3:
				this.weight = value
				break
		}
	}
}

export class Bone {
	public position: Vector3
	constructor(private bf: BinReader) {
		this.bf.position += 48 + 4

		this.position = Vector3.read(this.bf)
	}
}

export class Face {
	public a: number
	public b: number
	public c: number
	constructor(private bf: BinReader) {
		this.a = this.bf.readUInt16()
		this.b = this.bf.readUInt16()
		this.c = this.bf.readUInt16()
	}
}

export class Vector2 {
	public static zero = new Vector2(0, 0)
	constructor(public x: number, public y: number) {}
	public static read(bf: BinReader): Vector2 {
		const a = bf.readFloat32()
		const b = bf.readFloat32()
		return new Vector2(a, b)
	}
}

export class Vector3 {
	public static zero = new Vector3(0, 0, 0)
	constructor(public x: number, public y: number, public z: number) {}
	public static read(bf: BinReader): Vector3 {
		const a = bf.readFloat32()
		const b = bf.readFloat32()
		const c = bf.readFloat32()
		return new Vector3(a, b, c)
	}
}

export class Vector4 {
	public static zero = new Vector4(0, 0, 0, 0)
	constructor(
		public x: number,
		public y: number,
		public z: number,
		public w: number,
	) {}
	public static read(bf: BinReader): Vector4 {
		const a = bf.readFloat32()
		const b = bf.readFloat32()
		const c = bf.readFloat32()
		const d = bf.readFloat32()
		return new Vector4(a, b, c, d)
	}
}
