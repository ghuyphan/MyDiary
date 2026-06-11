// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import "fake-indexeddb/auto";
import {
  clearDiaryStateForTests,
  deleteDiaryDraft,
  loadDiaryDraft,
  loadDiaryState,
  migrateLegacyState,
  readStoredStateForTests,
  saveDiaryDraft,
  saveDiaryState,
} from "./diaryStore";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
  clear: () => values.clear(),
};

const diary = {
  version: 6,
  theme: "taki",
  userName: "Test",
  locked: false,
  topics: [],
  entries: [],
  memos: [],
  contacts: [],
};

describe("IndexedDB diary storage", () => {
  beforeEach(async () => {
    values.clear();
    await clearDiaryStateForTests();
  });

  it("saves and loads the current diary state", async () => {
    await saveDiaryState(diary);
    await expect(loadDiaryState()).resolves.toEqual(diary);
  });

  it("migrates localStorage once and keeps a recovery copy", async () => {
    localStorage.setItem("mydiary-faithful", JSON.stringify(diary));
    await expect(migrateLegacyState()).resolves.toEqual(diary);

    expect(localStorage.getItem("mydiary-faithful")).toBeNull();
    expect(localStorage.getItem("mydiary-faithful-legacy-backup")).toBe(JSON.stringify(diary));
    await expect(loadDiaryState()).resolves.toEqual(diary);
  });

  it("stores photo bytes outside the main state and restores the existing data URL shape", async () => {
    const photo = "data:image/png;base64,aGVsbG8=";
    const withPhoto = {
      ...diary,
      entries: [{
        id: 1,
        title: "Photo",
        items: [{ id: "photo_1", type: "photo", value: photo }],
        photos: [photo],
      }],
    };

    await saveDiaryState(withPhoto);
    const stored = await readStoredStateForTests();

    expect(JSON.stringify(stored.data)).not.toContain("aGVsbG8=");
    expect(stored.data.entries[0].photos[0]).toMatch(/^attachment:/);
    await expect(loadDiaryState()).resolves.toEqual(withPhoto);
  });

  it("round-trips editor drafts independently from saved diary state", async () => {
    const value = {
      draft: { id: 99, title: "Recovered", photos: [] },
      items: [{ id: "text_1", type: "text", value: "Unsaved text" }],
    };
    await saveDiaryDraft("entry:99", value);
    const loaded = await loadDiaryDraft("entry:99");

    expect(loaded.draft).toEqual(value.draft);
    expect(loaded.items).toEqual(value.items);
    await deleteDiaryDraft("entry:99");
    await expect(loadDiaryDraft("entry:99")).resolves.toBeNull();
  });
});
