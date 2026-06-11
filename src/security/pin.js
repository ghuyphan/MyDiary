import { base64ToBytes, bytesToBase64, deriveKey, encryptBytes, decryptBytes, randomBase64 } from "./crypto";

const verifierText = new TextEncoder().encode("mydiary-pin-verifier-v1");

export async function createPinSecurity(pin) {
  const salt = randomBase64(16);
  const key = await deriveKey(pin, salt);
  const verifier = await encryptBytes(verifierText, key);
  return {
    version: 1,
    salt,
    iv: verifier.iv,
    verifier: verifier.data,
    idleMinutes: 5,
  };
}

export async function verifyPin(pin, security) {
  if (!security?.salt || !security?.iv || !security?.verifier) return false;
  try {
    const key = await deriveKey(pin, security.salt);
    const value = new Uint8Array(await decryptBytes({
      iv: security.iv,
      data: security.verifier,
    }, key));
    if (value.length !== verifierText.length) return false;
    return value.every((byte, index) => byte === verifierText[index]);
  } catch {
    return false;
  }
}

export async function sha256Base64(value) {
  return bytesToBase64(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

export function isBase64(value) {
  try {
    return bytesToBase64(base64ToBytes(value)) === value;
  } catch {
    return false;
  }
}
