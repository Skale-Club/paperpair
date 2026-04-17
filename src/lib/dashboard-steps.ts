export const DASHBOARD_STEPS = [
  {
    slug: "personal-info",
    title: "Personal Information",
    description: "Basic details about the Beneficiary.",
    critical: true,
    order: 1
  },
  {
    slug: "spouse-info",
    title: "Petitioner Information",
    description: "Details about the petitioning spouse.",
    critical: true,
    order: 2
  },
  {
    slug: "marriage-details",
    title: "Marriage Details",
    description: "Information about the marriage.",
    critical: true,
    order: 3
  },
  {
    slug: "immigration-info",
    title: "Immigration History",
    description: "Entry and status details.",
    critical: true,
    order: 4
  },
  {
    slug: "documents",
    title: "Documents",
    description: "Upload required evidence.",
    critical: true,
    order: 5
  },
  {
    slug: "review",
    title: "Final Review",
    description: "Check everything before submission.",
    critical: false,
    order: 6
  },
  {
    slug: "income-calculator",
    title: "Income Calculator",
    description: "Verify petitioner income meets the 125% federal poverty guideline.",
    critical: false,
    order: 7
  }
] as const;

export type DashboardStep = (typeof DASHBOARD_STEPS)[number];
export type DashboardStepSlug = DashboardStep["slug"];
export type DashboardStepStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

const stepSlugSet = new Set<string>(DASHBOARD_STEPS.map((step) => step.slug));

export function isDashboardStepSlug(value: string): value is DashboardStepSlug {
  return stepSlugSet.has(value);
}
