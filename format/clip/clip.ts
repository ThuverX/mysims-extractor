/*

struct SectionReference {
    u32 index;
    u32 offset;
};

struct SectionHeader {
	u32 compression;       // 0: no compression, 1: Oodle0, 2: Oodle1
	u32 data_offset;       // From the start of the file
	u32 data_size;         // In bytes
	u32 decompressed_size; // In bytes
	u32 alignment_size;    // Seems always 4
	u32 stop0;             // Stop0 for Oodle1
	u32 stop1;             // Stop1 for Oodle1
	u32 relocations_offset;
	u32 relocations_count;
	u32 marshallings_offset;
	u32 marshallings_count;
};

struct Section {
    SectionHeader header;
};

struct Header {
    u8 magic[16];
    u32 header_size;
    u32 compression_flag;
    padding[8];
    u32 file_version;
    u32 file_size;
    u32 crc_checksum;
    u32 section_offset;
    u32 section_count;
    SectionReference root_node_type;
    SectionReference root_node_object;
    u32 user_tag;
    u8 user_data[16];
    Section sections[section_count];
};



Header header @ $;
*/