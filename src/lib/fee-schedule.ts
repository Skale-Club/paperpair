/**
 * 2026 USCIS Fee Schedule (effective January 2026)
 * Source: USCIS Final Rule published 2024
 * @module fee-schedule
 */

/** Form I-485: Application to Register Permanent Residence */
export const FEES_2026_I485 = 1440;

/** Form I-131: Application for Travel Document (Advance Parole, included with I-485 bundle) */
export const FEES_2026_I131_WITH_I485 = 0;

/** Form I-765: Employment Authorization Document — Initial filing */
export const FEES_2026_I765_EAD_INITIAL = 260;

/** Form I-130: Petition for Alien Relative — Paper filing */
export const FEES_2026_I130_PAPER = 535;

/** Form I-130: Petition for Alien Relative — Online filing */
export const FEES_2026_I130_ONLINE = 535;

/** Biometrics — waived for I-485 filers since 2024 */
export const FEES_2026_BIOMETRICS = 0;

/** Total for a typical concurrent I-130 + I-485 + EAD bundle */
export const CONCURRENT_BUNDLE_TOTAL =
  FEES_2026_I130_PAPER + FEES_2026_I485 + FEES_2026_I765_EAD_INITIAL;

/**
 * Barrel export grouping all 2026 fee constants under a single object.
 * Individual named constants remain the canonical export for tree-shaking.
 */
export const FEES_2026 = {
  i485: FEES_2026_I485,
  i131_with_i485: FEES_2026_I131_WITH_I485,
  ead_initial: FEES_2026_I765_EAD_INITIAL,
  i130_paper: FEES_2026_I130_PAPER,
  i130_online: FEES_2026_I130_ONLINE,
  biometrics: FEES_2026_BIOMETRICS,
} as const;