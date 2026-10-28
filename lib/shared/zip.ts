// Zero-dependency standard ZIP archive builder (Store mode, UTF-8 filenames)

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
	let c = n;
	for (let k = 0; k < 8; k++) {
		c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	}
	crcTable[n] = c;
}

function crc32(buf: Uint8Array): number {
	let crc = 0xffffffff;
	for (let i = 0; i < buf.length; i++) {
		crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipFileInput {
	name: string;
	data: Uint8Array;
}

export async function toUint8Array(content: unknown): Promise<Uint8Array> {
	if (content instanceof Blob) {
		return new Uint8Array(await content.arrayBuffer());
	}
	if (typeof content === "string") {
		return new TextEncoder().encode(content);
	}
	return new TextEncoder().encode(JSON.stringify(content, null, 2));
}

export function buildZipBlob(files: ZipFileInput[]): Blob {
	const now = new Date();
	const dosTime =
		(now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
	const dosDate =
		((now.getFullYear() - 1980) << 9) |
		((now.getMonth() + 1) << 5) |
		now.getDate();

	const localChunks: Uint8Array[] = [];
	const cdChunks: Uint8Array[] = [];
	let offset = 0;

	for (const f of files) {
		const nameBytes = new TextEncoder().encode(f.name);
		const data = f.data;
		const crc = crc32(data);
		const size = data.length;

		const loc = new Uint8Array(30 + nameBytes.length);
		const view = new DataView(loc.buffer);
		view.setUint32(0, 0x04034b50, true);
		view.setUint16(4, 20, true);
		view.setUint16(6, 0x0800, true);
		view.setUint16(8, 0, true);
		view.setUint16(10, dosTime, true);
		view.setUint16(12, dosDate, true);
		view.setUint32(14, crc, true);
		view.setUint32(18, size, true);
		view.setUint32(22, size, true);
		view.setUint16(26, nameBytes.length, true);
		view.setUint16(28, 0, true);
		loc.set(nameBytes, 30);

		localChunks.push(loc, data);

		const cd = new Uint8Array(46 + nameBytes.length);
		const cdView = new DataView(cd.buffer);
		cdView.setUint32(0, 0x02014b50, true);
		cdView.setUint16(4, 20, true);
		cdView.setUint16(6, 20, true);
		cdView.setUint16(8, 0x0800, true);
		cdView.setUint16(10, 0, true);
		cdView.setUint16(12, dosTime, true);
		cdView.setUint16(14, dosDate, true);
		cdView.setUint32(16, crc, true);
		cdView.setUint32(20, size, true);
		cdView.setUint32(24, size, true);
		cdView.setUint16(28, nameBytes.length, true);
		cdView.setUint16(30, 0, true);
		cdView.setUint16(32, 0, true);
		cdView.setUint16(34, 0, true);
		cdView.setUint16(36, 0, true);
		cdView.setUint32(38, 0, true);
		cdView.setUint32(42, offset, true);
		cd.set(nameBytes, 46);
		cdChunks.push(cd);

		offset += loc.length + data.length;
	}

	const cdOffset = offset;
	let cdSize = 0;
	for (const c of cdChunks) cdSize += c.length;

	const eocd = new Uint8Array(22);
	const eocdView = new DataView(eocd.buffer);
	eocdView.setUint32(0, 0x06054b50, true);
	eocdView.setUint16(4, 0, true);
	eocdView.setUint16(6, 0, true);
	eocdView.setUint16(8, files.length, true);
	eocdView.setUint16(10, files.length, true);
	eocdView.setUint32(12, cdSize, true);
	eocdView.setUint32(16, cdOffset, true);
	eocdView.setUint16(20, 0, true);

	return new Blob(
		[...localChunks, ...cdChunks, eocd] as unknown as BlobPart[],
		{
			type: "application/zip",
		},
	);
}
