import { describe, expect, it } from "vitest";

import { detectLogoImageType, logoMetadataSchema } from "./schema";

describe("logo evaluation input", () => {
  it("accepts the supported metadata and file signatures", () => {
    expect(logoMetadataSchema.safeParse({
      aiGenerated: true,
      aiGenerator: "GPT Image",
      brandKeywords: ["measured", "clear"],
      brandName: "Aurelis",
      industry: "Quality assurance",
      language: "en",
      originalPrompt: "A precise identity",
      targetLabel: "Primary mark",
    }).success).toBe(true);
    expect(detectLogoImageType(Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe("image/png");
    expect(detectLogoImageType(Uint8Array.from([255, 216, 255, 0]))).toBe("image/jpeg");
  });

  it("rejects unsupported image content and empty brand context", () => {
    expect(detectLogoImageType(new TextEncoder().encode("<svg></svg>"))).toBeNull();
    expect(logoMetadataSchema.safeParse({
      aiGenerated: false,
      aiGenerator: null,
      brandKeywords: [],
      brandName: "A",
      industry: "",
      language: "en",
      originalPrompt: null,
      targetLabel: "X",
    }).success).toBe(false);
  });
});
