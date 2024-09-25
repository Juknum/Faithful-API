// from https://github.com/sindresorhus/file-type/blob/0e91f7be09fbe7f1ac3928d96b7a23b611532d52/core.js#L323
export const MIME_TYPES = [
	{ name: "image/jpeg", header: [0xff, 0xd8, 0xff] },
	{ name: "image/png", header: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

export function getMediaType(buffer: Buffer) {
	const found = MIME_TYPES.find(
		// all bytes must match
		({ header }) => header.length <= buffer.length && header.every((b, i) => b === buffer[i]),
	);
	if (!found) return null;
	return found.name;
}
