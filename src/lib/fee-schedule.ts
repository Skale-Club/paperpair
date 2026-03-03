/**
 * 2026 USCIS Fee Schedule (effective January 2026)
 * Source: USCIS Final Rule published 2024
 */
export const FEES_2026 = {
  /** Form I-485: Application to Register Permanent Residence */
  i485: 1440,
  /** Form I-131: Application for Travel Document (Advance Parole, included with I-485 bundle) */
  i131_with_i485: 0,
  /** Form I-765: Employment Authorization Document — Initial filing */
  ead_initial: 260,
  /** Form I-130: Petition for Alien Relative — Paper filing */
  i130_paper: 535,
  /** Form I-130: Petition for Alien Relative — Online filing */
  i130_online: 535,
  /** Biometrics — waived for I-485 filers since 2024 */
  biometrics: 0,
} as const;

/** Total for a typical concurrent I-130 + I-485 + EAD bundle */
export const CONCURRENT_BUNDLE_TOTAL =
  FEES_2026.i130_paper + FEES_2026.i485 + FEES_2026.ead_initial;
// = $535 + $1,440 + $260 = $2,235
