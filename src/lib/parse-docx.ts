import mammoth from "mammoth";

export async function textFromDocx(bytes: Uint8Array | Buffer): Promise<string> {
  const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}
