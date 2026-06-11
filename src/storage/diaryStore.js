import Dexie from "dexie";
import { z } from "zod";

const DATABASE_NAME = "mydiary-web";
const STATE_KEY = "current";
const LEGACY_KEY = "mydiary-faithful";
const LEGACY_BACKUP_KEY = "mydiary-faithful-legacy-backup";

const diaryStateSchema = z.object({
  version: z.number().optional(),
  theme: z.string(),
  userName: z.string(),
  locked: z.boolean(),
  language: z.string().optional(),
  topics: z.array(z.record(z.string(), z.unknown())),
  entries: z.array(z.record(z.string(), z.unknown())),
  memos: z.array(z.record(z.string(), z.unknown())),
  contacts: z.array(z.record(z.string(), z.unknown())),
}).passthrough();

const db = new Dexie(DATABASE_NAME);
db.version(1).stores({
  appState: "key,updatedAt",
});

db.version(2).stores({
  appState: "key,updatedAt",
  attachments: "id,updatedAt",
  drafts: "id,updatedAt",
});

const attachmentUrlCache = new Map();
const attachmentIdCache = new Map();

function isDataImage(value) {
  return typeof value === "string" && value.startsWith("data:image/");
}

function isAttachmentReference(value) {
  return typeof value === "string" && value.startsWith("attachment:");
}

function dataUrlToBlob(dataUrl) {
  const [metadata, payload] = dataUrl.split(",", 2);
  const mimeType = metadata.match(/^data:([^;]+)/)?.[1] || "application/octet-stream";
  const binary = atob(payload);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: mimeType });
}

function blobToDataUrl(blob) {
  return blob.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return `data:${blob.type || "application/octet-stream"};base64,${btoa(binary)}`;
  });
}

async function externalizePhoto(value, attachmentRows) {
  if (!isDataImage(value)) return value;
  const cachedId = attachmentIdCache.get(value);
  if (cachedId) return `attachment:${cachedId}`;
  const id = `photo_${crypto.randomUUID()}`;
  attachmentRows.push({
    id,
    blob: dataUrlToBlob(value),
    updatedAt: new Date().toISOString(),
  });
  attachmentUrlCache.set(id, value);
  attachmentIdCache.set(value, id);
  return `attachment:${id}`;
}

async function externalizeState(data) {
  const attachmentRows = [];
  const entries = await Promise.all((data.entries || []).map(async (entry) => {
    const items = await Promise.all((entry.items || []).map(async (item) => (
      item.type === "photo"
        ? { ...item, value: await externalizePhoto(item.value, attachmentRows) }
        : item
    )));
    const photos = await Promise.all((entry.photos || []).map((photo) => externalizePhoto(photo, attachmentRows)));
    return { ...entry, items, photos };
  }));
  return {
    data: { ...data, entries },
    attachmentRows,
  };
}

async function resolvePhoto(value) {
  if (!isAttachmentReference(value)) return value;
  const id = value.slice("attachment:".length);
  if (attachmentUrlCache.has(id)) return attachmentUrlCache.get(id);
  const row = await db.attachments.get(id);
  if (!row?.blob) return "";
  const dataUrl = await blobToDataUrl(row.blob);
  attachmentUrlCache.set(id, dataUrl);
  attachmentIdCache.set(dataUrl, id);
  return dataUrl;
}

async function hydrateState(data) {
  if (!data) return data;
  const entries = await Promise.all((data.entries || []).map(async (entry) => ({
    ...entry,
    items: await Promise.all((entry.items || []).map(async (item) => (
      item.type === "photo" ? { ...item, value: await resolvePhoto(item.value) } : item
    ))),
    photos: await Promise.all((entry.photos || []).map(resolvePhoto)),
  })));
  return { ...data, entries };
}

function collectAttachmentIds(data) {
  const ids = new Set();
  for (const entry of data.entries || []) {
    for (const item of entry.items || []) {
      if (isAttachmentReference(item.value)) ids.add(item.value.slice("attachment:".length));
    }
    for (const photo of entry.photos || []) {
      if (isAttachmentReference(photo)) ids.add(photo.slice("attachment:".length));
    }
  }
  return ids;
}

function collectDraftAttachmentIds(rows) {
  const ids = new Set();
  for (const row of rows) {
    for (const item of row.value?.items || []) {
      if (isAttachmentReference(item.value)) ids.add(item.value.slice("attachment:".length));
    }
    for (const photo of row.value?.draft?.photos || []) {
      if (isAttachmentReference(photo)) ids.add(photo.slice("attachment:".length));
    }
  }
  return ids;
}

function parseState(value) {
  const result = diaryStateSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function validateDiaryState(value) {
  return diaryStateSchema.parse(value);
}

export function readLegacyState() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    return { raw, data: parseState(JSON.parse(raw)) };
  } catch {
    return null;
  }
}

export async function loadDiaryState() {
  const row = await db.appState.get(STATE_KEY);
  return row ? hydrateState(parseState(row.data)) : null;
}

export async function saveDiaryState(data) {
  const parsed = diaryStateSchema.parse(data);
  const externalized = await externalizeState(parsed);
  await db.transaction("rw", db.appState, db.attachments, db.drafts, async () => {
    if (externalized.attachmentRows.length) {
      await db.attachments.bulkPut(externalized.attachmentRows);
    }
    await db.appState.put({
      key: STATE_KEY,
      updatedAt: new Date().toISOString(),
      data: externalized.data,
    });
    const referencedIds = collectAttachmentIds(externalized.data);
    const draftIds = collectDraftAttachmentIds(await db.drafts.toArray());
    draftIds.forEach((id) => referencedIds.add(id));
    const storedIds = await db.attachments.toCollection().primaryKeys();
    const orphanIds = storedIds.filter((id) => !referencedIds.has(id));
    if (orphanIds.length) {
      await db.attachments.bulkDelete(orphanIds);
      orphanIds.forEach((id) => attachmentUrlCache.delete(id));
    }
  });
}

export async function migrateLegacyState() {
  const existing = await loadDiaryState();
  if (existing) return existing;
  const legacy = readLegacyState();
  if (!legacy?.data) return null;

  await saveDiaryState(legacy.data);
  localStorage.setItem(LEGACY_BACKUP_KEY, legacy.raw);
  localStorage.removeItem(LEGACY_KEY);
  return legacy.data;
}

export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false;
  return navigator.storage.persist().catch(() => false);
}

export async function saveDiaryDraft(id, value) {
  const externalized = await externalizeState({
    theme: "taki",
    userName: "draft",
    locked: false,
    topics: [],
    entries: [{
      id: value.draft.id,
      ...value.draft,
      items: value.items,
      photos: value.items.filter((item) => item.type === "photo").map((item) => item.value),
    }],
    memos: [],
    contacts: [],
  });
  const storedEntry = externalized.data.entries[0];
  await db.transaction("rw", db.drafts, db.attachments, async () => {
    if (externalized.attachmentRows.length) await db.attachments.bulkPut(externalized.attachmentRows);
    await db.drafts.put({
      id,
      updatedAt: new Date().toISOString(),
      value: {
        draft: { ...value.draft, photos: storedEntry.photos },
        items: storedEntry.items,
      },
    });
  });
}

export async function loadDiaryDraft(id) {
  const row = await db.drafts.get(id);
  if (!row) return null;
  const hydrated = await hydrateState({
    entries: [{
      ...row.value.draft,
      items: row.value.items,
      photos: row.value.draft.photos || [],
    }],
  });
  return {
    updatedAt: row.updatedAt,
    draft: { ...row.value.draft, photos: hydrated.entries[0].photos },
    items: hydrated.entries[0].items,
  };
}

export async function deleteDiaryDraft(id) {
  await db.drafts.delete(id);
}

export async function replaceDiaryState(data) {
  const parsed = diaryStateSchema.parse(data);
  await saveDiaryState(parsed);
  return hydrateState((await db.appState.get(STATE_KEY)).data);
}

export async function clearDiaryStateForTests() {
  await db.transaction("rw", db.appState, db.attachments, db.drafts, async () => {
    await db.appState.clear();
    await db.attachments.clear();
    await db.drafts.clear();
  });
  attachmentUrlCache.clear();
  attachmentIdCache.clear();
}

export async function readStoredStateForTests() {
  return db.appState.get(STATE_KEY);
}
