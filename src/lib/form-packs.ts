export interface FormItem {
  id: string;
  title: string;
  pdfUrl: string;
}

export interface FormPackInstructions {
  /** 1-2 sentence description of what this form is for */
  purpose: string;
  /** Who is responsible for filling this form */
  whoFills: "Petitioner" | "Beneficiary" | "Both";
  /** Plain-English explanation of the filing process */
  whatToExpect: string;
}

export interface FormPack {
  id: string;
  label: string;
  detailLabel: string;
  /** PDF shown on the pack index card (the main form, not instructions) */
  coverPdfUrl: string;
  forms: FormItem[];
  /** ISO date string of the current accepted USCIS edition */
  editionDate: string;
  /** UI shows edition warning if new Date() > lockedUntil */
  lockedUntil: Date;
  /** Direct link to the official USCIS form page (never a PDF mirror) — per D-07 */
  uscisUrl: string;
  /** Plain-English instructions for this form pack — per D-05 */
  instructions: FormPackInstructions;
}

export const FORM_PACKS: FormPack[] = [
  {
    id: "i130",
    label: "Form I - 130",
    detailLabel: "I - 130 / I - 130a",
    coverPdfUrl: "/forms/i130-petition.pdf",
    forms: [
      { id: "i130-instructions", title: "Form Instructions", pdfUrl: "/forms/i130-instructions.pdf" },
      { id: "i130-petition", title: "I-130\nPetition for Alien Relative", pdfUrl: "/forms/i130-petition.pdf" },
      { id: "i130a-spouse", title: "I-130a\nForm for Spouse Beneficiary", pdfUrl: "/forms/i130a-spouse.pdf" },
    ],
    editionDate: "2023-12-15",
    lockedUntil: new Date("2023-12-15"),
    uscisUrl: "https://www.uscis.gov/i-130",
    instructions: {
      purpose: "Form I-130 establishes your qualifying relationship to a U.S. citizen or lawful permanent resident spouse. It is the first petition filed in the marriage-based green card process.",
      whoFills: "Petitioner",
      whatToExpect: "The petitioner (U.S. citizen spouse) fills out this form to sponsor their foreign-born spouse. USCIS reviews the petition to confirm the marriage is valid and the petitioner qualifies to sponsor. Processing typically takes several months. The I-130A supplement is filled by the beneficiary.",
    },
  },
  {
    id: "i131",
    label: "Form I - 131",
    detailLabel: "I - 131",
    coverPdfUrl: "/forms/i131-parole.pdf",
    forms: [
      { id: "i131-instructions", title: "Form Instructions", pdfUrl: "/forms/i131-instructions.pdf" },
      { id: "i131-parole", title: "I-131\nAdvance Parole Document", pdfUrl: "/forms/i131-parole.pdf" },
    ],
    editionDate: "2024-04-01",
    lockedUntil: new Date("2024-04-01"),
    uscisUrl: "https://www.uscis.gov/i-131",
    instructions: {
      purpose: "Form I-131 is the Application for Travel Document. For AOS applicants, it is used to request Advance Parole — which allows you to travel internationally while your I-485 is pending.",
      whoFills: "Beneficiary",
      whatToExpect: "The beneficiary (foreign-born spouse) files I-131 to obtain an Advance Parole document. Without an approved AP document, leaving the U.S. while your I-485 is pending will typically abandon your application. File this early and wait for approval before any international travel.",
    },
  },
  {
    id: "i485",
    label: "Form I - 485",
    detailLabel: "I - 485",
    coverPdfUrl: "/forms/i485-application.pdf",
    forms: [
      { id: "i485-instructions", title: "Form Instructions", pdfUrl: "/forms/i485-instructions.pdf" },
      { id: "i485-application", title: "I-485\nApplication to Register\nPermanent Residence", pdfUrl: "/forms/i485-application.pdf" },
    ],
    editionDate: "2024-04-01",
    lockedUntil: new Date("2024-04-01"),
    uscisUrl: "https://www.uscis.gov/i-485",
    instructions: {
      purpose: "Form I-485 is the Application to Register Permanent Residence. This is the core form that adjusts your immigration status from a nonimmigrant (or undocumented) to a lawful permanent resident.",
      whoFills: "Beneficiary",
      whatToExpect: "The beneficiary fills out I-485 to apply for a green card without leaving the U.S. It is typically filed concurrently with I-130, I-765, and I-131 as a bundle. USCIS will schedule biometrics and an interview after receiving the package.",
    },
  },
  {
    id: "i693",
    label: "Form I - 693",
    detailLabel: "I - 693",
    coverPdfUrl: "/forms/i693-medical.pdf",
    forms: [
      { id: "i693-instructions", title: "Form Instructions", pdfUrl: "/forms/i693-instructions.pdf" },
      { id: "i693-medical", title: "I-693\nReport of Medical\nExamination", pdfUrl: "/forms/i693-medical.pdf" },
    ],
    editionDate: "2023-06-01",
    lockedUntil: new Date("2023-06-01"),
    uscisUrl: "https://www.uscis.gov/i-693",
    instructions: {
      purpose: "Form I-693 is the Report of Medical Examination and Vaccination Record. USCIS requires a medical exam completed by an approved civil surgeon to confirm you meet health requirements for a green card.",
      whoFills: "Beneficiary",
      whatToExpect: "The beneficiary must visit a USCIS-designated civil surgeon who completes this sealed form. The exam covers vaccinations, a physical, and a tuberculosis test. The completed I-693 is typically submitted at your interview or mailed to USCIS in a sealed envelope.",
    },
  },
  {
    id: "i765",
    label: "Form I - 765",
    detailLabel: "I - 765",
    coverPdfUrl: "/forms/i765-ead.pdf",
    forms: [
      { id: "i765-instructions", title: "Form Instructions", pdfUrl: "/forms/i765-instructions.pdf" },
      { id: "i765-ead", title: "I-765\nEmployment Authorization\nDocument", pdfUrl: "/forms/i765-ead.pdf" },
    ],
    editionDate: "2024-04-01",
    lockedUntil: new Date("2024-04-01"),
    uscisUrl: "https://www.uscis.gov/i-765",
    instructions: {
      purpose: "Form I-765 is the Application for Employment Authorization. AOS applicants can request a work permit (EAD) while their green card application is pending.",
      whoFills: "Beneficiary",
      whatToExpect: "The beneficiary files I-765 concurrently with I-485 to receive an Employment Authorization Document, allowing legal work in the U.S. while waiting. USCIS typically processes EAD applications within 90-150 days. Your EAD is valid until your green card case is decided.",
    },
  },
  {
    id: "i864a",
    label: "Form I - 864a",
    detailLabel: "I - 864a",
    coverPdfUrl: "/forms/i864a-contract.pdf",
    forms: [
      { id: "i864a-instructions", title: "Form Instructions", pdfUrl: "/forms/i864a-instructions.pdf" },
      { id: "i864a-contract", title: "I-864a\nContract Between Sponsor\nand Household Member", pdfUrl: "/forms/i864a-contract.pdf" },
    ],
    editionDate: "2023-12-15",
    lockedUntil: new Date("2023-12-15"),
    uscisUrl: "https://www.uscis.gov/i-864a",
    instructions: {
      purpose: "Form I-864A is the Contract Between Sponsor and Household Member. It is used when a joint sponsor or household member's income is included to meet the financial support requirements.",
      whoFills: "Petitioner",
      whatToExpect: "This supplement to the Affidavit of Support (I-864) is needed when someone other than the primary sponsor — such as a household member — is combining income to meet the 125% poverty threshold. Both the primary sponsor and the household member sign this form.",
    },
  },
];

const PENDING_KEY = "pp_pending_forms";
const VISITED_KEY = "pp_visited_packs";

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

export function getPendingForms(): string[] {
  return safeGet<string[]>(PENDING_KEY, []);
}

export function getVisitedPacks(): string[] {
  return safeGet<string[]>(VISITED_KEY, []);
}

/** @deprecated Use /api/dashboard/selected-forms (GET) to load persisted form IDs from DB */
export function getSentForms(): string[] {
  // Returns empty array — selected forms are persisted in DB via /api/dashboard/selected-forms
  return [];
}

/** Get pending form IDs for a specific pack (pre-select when revisiting a pack) */
export function getPackPendingForms(packId: string): string[] {
  const pack = FORM_PACKS.find(p => p.id === packId);
  if (!pack) return [];
  const pending = getPendingForms();
  const packFormIds = new Set(pack.forms.map(f => f.id));
  return pending.filter(id => packFormIds.has(id));
}

/** Merge this pack's selected forms into pending, mark pack as visited */
export function confirmPackSelection(packId: string, selectedFormIds: string[]): void {
  const pack = FORM_PACKS.find(p => p.id === packId);
  if (!pack) return;
  const packFormIds = new Set(pack.forms.map(f => f.id));
  const existing = getPendingForms().filter(id => !packFormIds.has(id));
  safeSet(PENDING_KEY, [...existing, ...selectedFormIds]);

  const visited = getVisitedPacks();
  if (!visited.includes(packId)) {
    safeSet(VISITED_KEY, [...visited, packId]);
  }
}

/**
 * Move all pending forms into the sent (My Forms) list and clear session state.
 * The merged form IDs are persisted to DB via POST /api/dashboard/selected-forms.
 * Callers must pass the current sent IDs from the DB (fetched via GET /api/dashboard/selected-forms).
 */
export function sendForms(existingSentIds: string[] = []): void {
  const pending = getPendingForms();
  const merged = Array.from(new Set([...existingSentIds, ...pending]));
  // Persist merged list to DB (fire-and-forget)
  void fetch("/api/dashboard/selected-forms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formIds: merged }),
  });
  // Clear session-only state
  safeSet(PENDING_KEY, []);
  safeSet(VISITED_KEY, []);
}
