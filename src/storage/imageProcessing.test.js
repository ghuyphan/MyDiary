import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES, processDiaryImage } from "./imageProcessing";

describe("processDiaryImage", () => {
  it("rejects non-image files before reading them", async () => {
    await expect(
      processDiaryImage({ type: "text/plain", size: 12 }),
    ).rejects.toThrow("Please choose an image file.");
  });

  it("rejects images larger than the storage limit before decoding them", async () => {
    await expect(
      processDiaryImage({ type: "image/jpeg", size: MAX_IMAGE_BYTES + 1 }),
    ).rejects.toThrow("larger than 10 MB");
  });
});
