export interface FormItem {
  id: string;
  title: string;
  pdfUrl: string;
}

export interface FormPack {
  id: string;
  label: string;
  detailLabel: string;
  /** PDF shown on the pack index card (the main form, not instructions) */
  coverPdfUrl: string;
  forms: FormItem[];
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
  },
];

const PENDING_KEY = "pp_pending_forms";
const VISITED_KEY = "pp_visited_packs";
const SENT_KEY = "pp_my_forms";

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

export function getSentForms(): string[] {
  return safeGet<string[]>(SENT_KEY, []);
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

/** Move all pending forms into the sent (My Forms) list and clear session state */
export function sendForms(): void {
  const pending = getPendingForms();
  const existing = getSentForms();
  const merged = Array.from(new Set([...existing, ...pending]));
  safeSet(SENT_KEY, merged);
  safeSet(PENDING_KEY, []);
  safeSet(VISITED_KEY, []);
}
