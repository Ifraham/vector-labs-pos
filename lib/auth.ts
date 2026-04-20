import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth-constants";

// Hash a password using scrypt and a random salt.
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

// Verify a plain-text password against the stored salt:hash value.
export function verifyPassword(password: string, storedHash: string) {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const incomingHash = scryptSync(password, salt, 64);
  const originalHashBuffer = Buffer.from(originalHash, "hex");

  if (incomingHash.length !== originalHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(incomingHash, originalHashBuffer);
}

// Generate a random session token for the database + cookie.
export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function generateSessionId() {
  return `session_${randomBytes(16).toString("hex")}`;
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}
