import type { BinReader } from 'jsr:@exts/binutils'
import { read_cstring } from '../../util.ts'
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

struct Vertex3 {
    Vector3 position;
    Vector3 normal;
    Vector2 uv;
};

struct Vertex4 {
    Vector3 position;
    padding[16];
    Vector3 normal;
};

struct Vertex6 {
    Vector3 position;
    padding[16];
    Vector3 normal;
    Vector2 uv;
    Vector2 uv2;
};

struct Vertex5 {
    Vector3 position;
    padding[16];
    Vector3 normal;
    Vector2 uv;
};

struct Face {
    u16 a;
    u16 b;
    u16 c;
};

struct Bone {
    float ukn[12];
    float x;
    float y;
    float z;
    float ukn2;
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
    padding[52];
    u32 num_verts;
    u32 num_faces;
    u32 vert_type;

    if(vert_type == 3) {
        padding[21];
        u32 verts_size;
        Vertex3 vertices[num_verts];
    } else if(vert_type == 4) {
        padding[28];
        u32 verts_size;
        Vertex4 vertices[num_verts];
    } else if(vert_type == 5) {
        padding[35];
        u32 verts_size;
        Vertex5 vertices[num_verts];
    } else if(vert_type == 6) {
        padding[42];
        u32 verts_size;
        Vertex6 vertices[num_verts];
    }

    u32 faces_size;
    Face faces[num_faces];
    u32 FFFFFFFF;
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
		}

		this.bf.position++

		const num_rigs = this.bf.readUInt32()
		for (let i = 0; i < num_rigs; i++) {
			this.rigs.push(new Rig(this.bf))
		}

		const num_meshes = this.bf.readUInt32()
		for (let i = 0; i < num_meshes; i++) {
			this.meshes.push(new Mesh(this.bf))
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
		for (let i = 0; i < num_bones; i++) {
			this.bones.push(new Bone(this.bf))
		}
	}
}

export class Mesh {
	public vertices: Array<Vertex> = []
	public faces: Array<Face> = []
	public material_hash: number
	public group_hash: number
	constructor(private bf: BinReader) {
		this.material_hash = this.bf.readUInt32()
		this.bf.position += 8
		this.group_hash = this.bf.readUInt32()
		this.bf.position += 52
		const num_verts = this.bf.readUInt32()
		const num_faces = this.bf.readUInt32()
		const vertex_type = this.bf.readUInt32()

		this.bf.position += vertex_type * 7

		this.bf.position += 4 // verts_size
		for (let i = 0; i < num_verts; i++) {
			this.vertices.push(new Vertex(vertex_type, this.bf))
		}

		this.bf.position += 4 // faces_size
		for (let i = 0; i < num_faces; i++) {
			this.faces.push(new Face(this.bf))
		}

		this.bf.position += 4 // 0xFFFF padding
	}
}

export class Vertex {
	public position: Vector3 = Vector3.zero
	public normal: Vector3 = Vector3.zero
	public uv: Vector2 = Vector2.zero
	public uv2: Vector2 = Vector2.zero
	public weight: Vector4 = Vector4.zero

	constructor(type: number, private bf: BinReader) {
		this.position = Vector3.read(this.bf)

		if (type === 4 || type === 5 || type === 6) {
			this.weight = Vector4.read(this.bf)
		}

		this.normal = Vector3.read(this.bf)

		if (type === 3 || type === 5 || type === 6) {
			this.uv = Vector2.read(this.bf)
		}

		if (type === 6) {
			this.uv2 = Vector2.read(this.bf)
		}
	}
}

export class Bone {
	public position: Vector3
	constructor(private bf: BinReader) {
		this.bf.position += 48

		this.position = Vector3.read(this.bf)

		this.bf.position += 4
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
