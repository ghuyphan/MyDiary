// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createDiaryBackup, parseDiaryBackup } from "./diaryBackup";

globalThis.btoa = (value) => Buffer.from(value, "binary").toString("base64");
globalThis.atob = (value) => Buffer.from(value, "base64").toString("binary");

const diary = {
  version: 6,
  theme: "taki",
  userName: "Test",
  locked: false,
  topics: [{ id: "diary", type: "diary", title: "Diary" }],
  entries: [{ id: 1, title: "Private entry", content: "Secret text" }],
  memos: [],
  contacts: [],
};

describe("diary backups", () => {
  it("round-trips encrypted data without exposing diary text", async () => {
    const backup = await createDiaryBackup(diary, "1357");
    const serialized = JSON.stringify(backup);

    expect(serialized).not.toContain("Secret text");
    await expect(parseDiaryBackup(serialized, async () => "1357")).resolves.toEqual(diary);
    await expect(parseDiaryBackup(serialized, async () => "0000")).rejects.toThrow();
  });

  it("continues to import legacy plain JSON exports", async () => {
    await expect(parseDiaryBackup(JSON.stringify(diary), async () => "")).resolves.toEqual(diary);
  });

  it("rejects a modified payload", async () => {
    const backup = await createDiaryBackup(diary, "1357");
    backup.payload = `${backup.payload.slice(0, -2)}aa`;
    await expect(parseDiaryBackup(JSON.stringify(backup), async () => "1357")).rejects.toThrow("checksum");
  });
});
