#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const allowedEmailDomains = new Set(["example.com", "localhost"]);

const textExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
  ".yml",
  ".yaml",
  ".txt",
  ".env",
  ".example",
  ".prisma",
  ".sql",
  ".toml"
]);

const alwaysScanFilenames = new Set([".gitignore", ".env.example", "AGENTS.md"]);
const skipFiles = new Set([".privacy-denylist", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "public/pdf.worker.min.mjs"]);

const blockedPatterns = [
  { label: "USCIS receipt number", regex: /\b(?:EAC|WAC|LIN|SRC|MSC|IOE|NBC)\d{10}\b/ },
  { label: "A-Number", regex: /\bA\d{8,9}\b/ },
  { label: "SSN-like value", regex: /\b\d{3}-\d{2}-\d{4}\b/ },
  { label: "Provider secret key (sk-)", regex: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { label: "Google AI API key", regex: /\bAIza[0-9A-Za-z_-]{30,}\b/ },
  { label: "GitHub PAT", regex: /\bghp_[A-Za-z0-9]{20,}\b/ },
  { label: "AWS access key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: "JWT-like API token", regex: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/ },
  {
    label: "Supabase service role assignment",
    regex: /\bSUPABASE_SERVICE_ROLE_KEY\s*=\s*["']?[A-Za-z0-9._-]{20,}/
  }
];

function getScannableFiles() {
  const output = execSync("git ls-files -z --cached --others --exclude-standard", {
    encoding: "utf8"
  });
  return output
    .split("\0")
    .map((file) => file.trim())
    .filter(Boolean);
}

function getTrackedFiles() {
  const output = execSync("git ls-files -z --cached", { encoding: "utf8" });
  return output
    .split("\0")
    .map((file) => file.trim())
    .filter(Boolean);
}

function shouldScanFile(file) {
  if (skipFiles.has(file)) {
    return false;
  }

  const filename = path.basename(file);
  if (alwaysScanFilenames.has(filename)) {
    return true;
  }

  const ext = path.extname(file).toLowerCase();
  return textExtensions.has(ext);
}

function getDenyTerms() {
  const raw = readFileSync(".privacy-denylist", "utf8");
  return raw
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter((value) => value && !value.startsWith("#"));
}

function getEmailViolations(line) {
  const regex = /\b[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})\b/gi;
  const violations = [];

  for (const match of line.matchAll(regex)) {
    const full = match[0];
    const domain = (match[1] ?? "").toLowerCase();
    if (!allowedEmailDomains.has(domain)) {
      violations.push({
        label: "Non-placeholder e-mail",
        value: full
      });
    }
  }

  return violations;
}

function main() {
  const files = getScannableFiles();
  const trackedFiles = new Set(getTrackedFiles());
  const denyTerms = getDenyTerms();
  const denyRegexes = denyTerms.map((term) => ({
    label: `Blocked term (${term})`,
    regex: new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
  }));

  const violations = [];

  for (const file of files) {
    if (!shouldScanFile(file)) {
      continue;
    }

    let content = "";
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }

    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const rule of [...blockedPatterns, ...denyRegexes]) {
        if (rule.regex.test(line)) {
          violations.push({
            file,
            line: index + 1,
            label: rule.label,
            excerpt: line.trim().slice(0, 180)
          });
        }
      }

      for (const emailViolation of getEmailViolations(line)) {
        violations.push({
          file,
          line: index + 1,
          label: emailViolation.label,
          excerpt: emailViolation.value
        });
      }
    });
  }

  if (trackedFiles.has(".env")) {
    violations.push({
      file: ".env",
      line: 1,
      label: "Tracked .env file",
      excerpt: ".env must never be tracked"
    });
  }

  const trackedPrivateFiles = [...trackedFiles].filter((file) => file.startsWith("src/content/private/"));
  trackedPrivateFiles.forEach((file) => {
    violations.push({
      file,
      line: 1,
      label: "Tracked private content",
      excerpt: "Files under src/content/private/ must stay untracked"
    });
  });

  if (violations.length) {
    console.error("Privacy check failed. Sensitive patterns were detected:\n");
    violations.forEach((violation) => {
      console.error(
        `- ${violation.file}:${violation.line} [${violation.label}] ${violation.excerpt || "(no excerpt)"}`
      );
    });
    process.exit(1);
  }

  console.log("Privacy check passed.");
}

main();
