const durationPattern = /^(\d+)([smhd])$/;

const unitMs: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000
};

export const durationToMs = (value: string): number => {
  const match = value.match(durationPattern);
  if (!match) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const [, amountValue, unit] = match;
  if (!amountValue || !unit) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const amount = Number(amountValue);
  const multiplier = unitMs[unit];

  if (!multiplier) {
    throw new Error(`Unsupported duration unit: ${unit}`);
  }

  return amount * multiplier;
};
