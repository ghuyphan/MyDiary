import { z } from "zod";
import {
  decryptBytes,
  deriveKey,
  encryptBytes,
  randomBase64,
} from "../security/crypto";
import { sha256Base64 } from "../security/pin";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const FORMAT = "mydiary-web-backup";
const VERSION = 1;

const envelopeSchema = z.object({
  format: z.literal(FORMAT),
  version: z.literal(VERSION),
  createdAt: z.string(),
  encrypted: z.boolean(),
  checksum: z.string(),
  payload: z.string(),
  crypto: z.object({
    salt: z.string(),
    iv: z.string(),
  }).optional(),
});

export async function createDiaryBackup(data, pin) {
  const plaintext = JSON.stringify(data);
  const createdAt = new Date().toISOString();
  if (!pin) {
    const payload = btoa(unescape(encodeURIComponent(plaintext)));
    return envelopeSchema.parse({
      format: FORMAT,
      version: VERSION,
      createdAt,
      encrypted: false,
      checksum: await sha256Base64(payload),
      payload,
    });
  }

  const salt = randomBase64(16);
  const key = await deriveKey(pin, salt);
  const encrypted = await encryptBytes(encoder.encode(plaintext), key);
  return envelopeSchema.parse({
    format: FORMAT,
    version: VERSION,
    createdAt,
    encrypted: true,
    checksum: await sha256Base64(encrypted.data),
    payload: encrypted.data,
    crypto: { salt, iv: encrypted.iv },
  });
}

export async function parseDiaryBackup(raw, getPin) {
  if (raw.length > 80 * 1024 * 1024) throw new Error("Backup is too large.");
  const parsedJson = JSON.parse(raw);

  // Backward compatibility for the original plain JSON export.
  if (parsedJson?.format !== FORMAT) return parsedJson;

  const envelope = envelopeSchema.parse(parsedJson);
  if (await sha256Base64(envelope.payload) !== envelope.checksum) {
    throw new Error("Backup checksum failed.");
  }

  let plaintext;
  if (envelope.encrypted) {
    const pin = await getPin();
    if (!pin) throw new Error("Import cancelled.");
    const key = await deriveKey(pin, envelope.crypto.salt);
    plaintext = decoder.decode(await decryptBytes({
      iv: envelope.crypto.iv,
      data: envelope.payload,
    }, key));
  } else {
    plaintext = decodeURIComponent(escape(atob(envelope.payload)));
  }
  return JSON.parse(plaintext);
}
