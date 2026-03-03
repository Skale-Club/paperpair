import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ENCRYPTION_VERSION = "v1";

function getEncryptionKey() {
  const secret = process.env.AI_KEYS_ENCRYPTION_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing AI_KEYS_ENCRYPTION_SECRET");
  }

  return createHash("sha256").update(secret, "utf8").digest();
}

function toBase64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

export function encryptSecret(value: string) {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_VERSION,
    toBase64Url(iv),
    toBase64Url(authTag),
    toBase64Url(encrypted)
  ].join(":");
}

export function decryptSecret(payload: string) {
  const [version, ivPart, authTagPart, dataPart] = payload.split(":");

  if (version !== ENCRYPTION_VERSION || !ivPart || !authTagPart || !dataPart) {
    throw new Error("Invalid encrypted payload format");
  }

  const key = getEncryptionKey();
  const iv = fromBase64Url(ivPart);
  const authTag = fromBase64Url(authTagPart);
  const encrypted = fromBase64Url(dataPart);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
