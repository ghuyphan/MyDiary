const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ITERATIONS = 310000;

export function bytesToBase64(bytes) {
  let binary = "";
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let index = 0; index < view.length; index += 1) {
    binary += String.fromCharCode(view[index]);
  }
  return btoa(binary);
}

export function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function randomBase64(length = 16) {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(length)));
}

export async function deriveKey(pin, saltBase64) {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBytes(saltBase64),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptBytes(bytes, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    bytes,
  );
  return {
    iv: bytesToBase64(iv),
    data: bytesToBase64(encrypted),
  };
}

export async function decryptBytes(payload, key) {
  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(payload.iv) },
    key,
    base64ToBytes(payload.data),
  );
}

export async function encryptJson(value, key) {
  return encryptBytes(encoder.encode(JSON.stringify(value)), key);
}

export async function decryptJson(payload, key) {
  const decrypted = await decryptBytes(payload, key);
  return JSON.parse(decoder.decode(decrypted));
}

export async function createSecurityConfig(pin, idleMinutes = 5) {
  const salt = randomBase64(16);
  const key = await deriveKey(pin, salt);
  const verifier = await encryptJson({ marker: "luma-journal-unlocked" }, key);
  return {
    key,
    config: {
      enabled: true,
      salt,
      verifier: JSON.stringify(verifier),
      idleMinutes,
    },
  };
}

export async function unlockWithPin(pin, config) {
  if (!config?.enabled || !config.salt || !config.verifier) {
    throw new Error("Security is not configured.");
  }
  const key = await deriveKey(pin, config.salt);
  const value = await decryptJson(JSON.parse(config.verifier), key);
  if (value.marker !== "luma-journal-unlocked") {
    throw new Error("Invalid PIN.");
  }
  return key;
}
