// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createPinSecurity, verifyPin } from "./pin";

globalThis.btoa = (value) => Buffer.from(value, "binary").toString("base64");
globalThis.atob = (value) => Buffer.from(value, "base64").toString("binary");

describe("PIN security", () => {
  it("verifies the correct PIN without storing it", async () => {
    const security = await createPinSecurity("2580");

    expect(JSON.stringify(security)).not.toContain("2580");
    await expect(verifyPin("2580", security)).resolves.toBe(true);
    await expect(verifyPin("0000", security)).resolves.toBe(false);
  });
});
