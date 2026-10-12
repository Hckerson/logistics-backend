const SIGNATURES: Record<string, readonly number[]> = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46],
    'image/jpeg': [0xff, 0xd8, 0xff],
    'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
};

export const SIGNATURE_BYTES = Math.max(
    ...Object.values(SIGNATURES).map((signature) => signature.length),
);

export const signatureMatches = (
    contentType: string,
    leading: Uint8Array,
): boolean => {
    const signature = SIGNATURES[contentType];

    return (
        signature !== undefined &&
        signature.every((byte, index) => leading[index] === byte)
    );
};
