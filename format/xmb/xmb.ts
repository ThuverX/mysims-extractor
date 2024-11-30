/*
import std.string;

char magic[4] @ $;
u32 name_table_size @ $;
u32 data_size @ $;
u32 root_offset @ $;

struct Node {
    s32 name_offset;
    s32 text_offset;
    s32 child_offset_a;
    s32 child_offset_b;
    padding[4];

    if(name_offset >= 0) {
        std::string::NullString name @ name_offset + 16;
    }

    if(text_offset >= 0) {
        std::string::NullString text @ text_offset + 16;
    }

    if(child_offset_a >= 0) {
        Node child_a @ child_offset_a + 16 + name_table_size;
    }

    if(child_offset_b >= 0) {
        Node child_b @ child_offset_b + 16 + name_table_size;
    }
};

Node root @ root_offset + 16 + name_table_size;
*/

import { BinReader } from 'jsr:@exts/binutils'
import assert from 'node:assert'
import { read_cstring } from '../../util.ts'
import { Serializer } from '../../serializer.ts'

export class XMBNode implements Serializer {
	public name: string = ''
	public text?: string
	public left_child?: XMBNode
	public right_child?: XMBNode

	constructor(
		offset: number,
		private name_table: BinReader,
		private data: BinReader,
	) {
		this.data.position = offset
		const name_offset = this.data.readInt32()
		const text_offset = this.data.readInt32()
		const left_child_offset = this.data.readInt32()
		const right_child_offset = this.data.readInt32()

		if (name_offset >= 0) {
			this.name_table.position = name_offset
			this.name = read_cstring(this.name_table)
		}

		if (text_offset >= 0) {
			this.name_table.position = text_offset
			this.text = read_cstring(this.name_table)
		}

		if (right_child_offset >= 0) {
			this.right_child = new XMBNode(
				right_child_offset,
				this.name_table,
				this.data,
			)
		}

		if (left_child_offset >= 0) {
			this.left_child = new XMBNode(
				left_child_offset,
				this.name_table,
				this.data,
			)
		}
	}

	public serialize(): any {
		return {
			name: this.name,
			text: this.text,
			left: this.left_child?.serialize(),
			right: this.right_child?.serialize(),
		}
	}
}

export class XMB implements Serializer {
	public root_node: XMBNode
	private name_table: BinReader
	private data: BinReader
	constructor(private bf: BinReader) {
		const magic = this.bf.readBytes(4).toString('ascii')
		assert(
			magic == 'XMB_',
			`Invalid magic, expected XMB_ got "${magic}"`,
		)

		const name_table_size = this.bf.readUInt32()
		const data_size = this.bf.readUInt32()
		const root_offset = this.bf.readUInt32()

		this.name_table = new BinReader(this.bf.readBytes(name_table_size))
		this.data = new BinReader(this.bf.readBytes(data_size))

		this.root_node = new XMBNode(root_offset, this.name_table, this.data)
	}
	public serialize() {
		return {
			root_node: this.root_node.serialize(),
		}
	}
}
