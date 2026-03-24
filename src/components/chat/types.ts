export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ChatResponse = {
  reply: string;
  extractedData: Record<string, string>;
  generatedFiles?: Array<{ key: string; url: string }>;
};

export type Template = {
  id: string;
  key: string;
  name: string;
  filePath: string;
};

export const STRUCTURED_FIELD_LABELS: Record<string, string> = {
  fullName: "Beneficiary full name",
  dateOfBirth: "Date of birth",
  email: "Email",
  phone: "Phone",
  currentAddress: "Current address",
  spouseFullName: "Petitioning spouse name",
  marriageDate: "Marriage date",
  entryDateUsa: "U.S. entry date",
  i94Number: "I-94 number"
};
