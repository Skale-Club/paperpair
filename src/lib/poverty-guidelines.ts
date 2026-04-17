/**
 * 2026 HHS Federal Poverty Guidelines (48 contiguous states + D.C.)
 * Source: HHS/ASPE Federal Register, January 2026
 * https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines
 * // HHS 2026 Federal Poverty Guidelines — update annually (published Jan/Feb each year)
 * @module poverty-guidelines
 */

/** Base guideline amount for a household of 1 person (48 contiguous states + D.C.) */
export const POVERTY_2026_BASE = 15960;

/** Increment added per additional household member beyond the first */
export const POVERTY_2026_PER_ADDITIONAL_PERSON = 5680;

/**
 * Barrel export object matching the shape expected by poverty-guidelines.test.ts.
 * The individual named constants above remain the canonical exports.
 */
export const POVERTY_GUIDELINES_2026 = {
  baseAmount: POVERTY_2026_BASE,
  perAdditionalPerson: POVERTY_2026_PER_ADDITIONAL_PERSON,
} as const;

/**
 * Returns the 125% Federal Poverty Guideline threshold for the given household size.
 * Formula: (baseAmount + (householdSize - 1) * perAdditionalPerson) * 1.25
 * Result is rounded to the nearest dollar.
 */
export function get125PercentThreshold(householdSize: number): number {
  const guideline =
    POVERTY_2026_BASE + (householdSize - 1) * POVERTY_2026_PER_ADDITIONAL_PERSON;
  return Math.round(guideline * 1.25);
}
