import { z } from "zod";

export const MAX_LOGO_BYTES = 8 * 1024 * 1024;

export const logoMetadataSchema = z.object({
  aiGenerated: z.boolean(),
  aiGenerator: z.string().trim().max(100).nullable(),
  brandKeywords: z.array(z.string().trim().min(1).max(40)).min(1).max(8),
  brandName: z.string().trim().min(2).max(100),
  industry: z.string().trim().min(2).max(100),
  language: z.enum(["en", "ja", "zh"]),
  originalPrompt: z.string().trim().max(4000).nullable(),
  targetLabel: z.string().trim().min(2).max(120),
});

export type LogoMetadata = z.infer<typeof logoMetadataSchema>;

export function detectLogoImageType(bytes: Uint8Array) {
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}
