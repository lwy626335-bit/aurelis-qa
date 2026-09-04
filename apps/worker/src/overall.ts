export function websiteOverallScore({ brand, technical, visual }: { brand: number | null; technical: number | null; visual: number | null }) {
  if (technical === null) return null;
  const weighted = brand !== null && visual !== null
    ? technical * 0.5 + visual * 0.3 + brand * 0.2
    : visual !== null
      ? technical * 0.6 + visual * 0.4
      : brand !== null
        ? technical * 0.6 + brand * 0.4
        : null;
  return weighted === null ? null : Math.round(weighted * 10) / 10;
}
