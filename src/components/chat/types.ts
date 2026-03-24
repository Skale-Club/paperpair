// Types for Paperpair chat system
// Compatible with AI SDK UIMessage format

import type { UIMessage } from "ai";

// Legacy message type (kept for backward compat)
export type Message = {
  role: "user" | "assistant";
  content: string;
};

// AI SDK compatible message type
export type ChatMessage = UIMessage;

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

export type Attachment = {
  name: string;
  contentType: string;
  url: string;
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
  i94Number: "I-94 number",
};

export const requiredFields = [
  "fullName",
  "dateOfBirth",
  "email",
  "phone",
  "currentAddress",
  "spouseFullName",
  "marriageDate",
  "entryDateUsa",
  "i94Number",
] as const;

export type RequiredField = (typeof requiredFields)[number];

export type StructuredData = Record<RequiredField, string>;

export function emptyStructuredData(): StructuredData {
  return {
    fullName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    currentAddress: "",
    spouseFullName: "",
    marriageDate: "",
    entryDateUsa: "",
    i94Number: "",
  };
}

export function getMissingFields(data: StructuredData): RequiredField[] {
  return requiredFields.filter((field) => !data[field]);
}
