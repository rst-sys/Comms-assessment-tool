/**
 * Access gate and spend guard for a hosted deployment (revision 15).
 *
 * PROMPT.md Section 1 puts authentication out of scope, and this is not it:
 * there are no accounts, no roles and no identity. There is one shared
 * password that the owner gives to the testers, and two daily ceilings on the
 * endpoints that cost money. Both exist for one reason: on a public address
 * the owner's provider key pays for every review, so an open link is an open
 * wallet.
 *
 * Nothing here is written to disk. The counters live in memory and reset when
 * the process restarts, so they are a brake, not a guarantee; the hard stop is
 * the spending limit the owner sets with the provider.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";

/** The password every tester types once. Unset means the gate is open, which is correct only on your own computer. */
export const ACCESS_PASSWORD = process.env.ACR_ACCESS_PASSWORD ?? "";
export const GATE_ENABLED = ACCESS_PASSWORD.length > 0;

const COOKIE_NAME = "acr_access";
const num = (v: string | undefined, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

/** Reviews one visitor may run per day, and across everyone per day. */
export const PER_VISITOR_DAILY = num(process.env.ACR_DAILY_LIMIT_PER_VISITOR, 10);
export const TOTAL_DAILY = num(process.env.ACR_DAILY_LIMIT_TOTAL, 60);

/**
 * The cookie value a browser must present. Derived from the password itself,
 * so there is no second secret to manage. Holding the cookie is equivalent to
 * holding the password, which is the same trust the owner already extends to
 * whoever they gave it to.
 */
export function accessToken(password: string): string {
  return createHash("sha256").update(`acr:${password}`).digest("hex");
}

function equals(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** True when the supplied password is the configured one. Compared in constant time. */
export function passwordMatches(supplied: unknown): boolean {
  return GATE_ENABLED && typeof supplied === "string" && equals(supplied, ACCESS_PASSWORD);
}

function readCookie(header: string | undefined, name: string): string {
  for (const part of (header ?? "").split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return "";
}

/** True when this request may proceed. An unset password leaves the gate open. */
export function isAuthorized(req: IncomingMessage): boolean {
  if (!GATE_ENABLED) return true;
  return equals(readCookie(req.headers.cookie, COOKIE_NAME), accessToken(ACCESS_PASSWORD));
}

/** The Set-Cookie header sent after a correct password. Session-length, not readable by scripts. */
export function sessionCookie(secure: boolean): string {
  const flags = ["Path=/", "HttpOnly", "SameSite=Strict", "Max-Age=604800"];
  if (secure) flags.push("Secure");
  return `${COOKIE_NAME}=${accessToken(ACCESS_PASSWORD)}; ${flags.join("; ")}`;
}

/** The header that clears it, for signing out. */
export function clearedCookie(secure: boolean): string {
  const flags = ["Path=/", "HttpOnly", "SameSite=Strict", "Max-Age=0"];
  if (secure) flags.push("Secure");
  return `${COOKIE_NAME}=; ${flags.join("; ")}`;
}

/**
 * A stable, non-identifying label for one visitor, used only to keep a daily
 * count in memory. The address is hashed and never logged or stored, so the
 * counter cannot be turned back into a list of who used the tool.
 */
export function visitorKey(req: IncomingMessage): string {
  const forwarded = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim();
  const address = forwarded || req.socket.remoteAddress || "unknown";
  return createHash("sha256").update(`acr:${address}`).digest("hex").slice(0, 16);
}

interface Counters {
  day: string;
  total: number;
  perVisitor: Map<string, number>;
}

const counters: Counters = { day: "", total: 0, perVisitor: new Map() };

function today(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function roll(now: Date): void {
  const day = today(now);
  if (counters.day !== day) {
    counters.day = day;
    counters.total = 0;
    counters.perVisitor.clear();
  }
}

export interface LimitDecision {
  allowed: boolean;
  /** Set when refused: a plain sentence the app shows the visitor. */
  message?: string;
}

export const OVER_VISITOR_LIMIT =
  "You have reached the limit of reviews for today. This prototype caps how much it can spend. Try again tomorrow, or ask the owner to raise the limit.";
export const OVER_TOTAL_LIMIT =
  "This prototype has reached its spending limit for today across everyone using it. Try again tomorrow.";

/** Counts one paid call against both ceilings, or refuses it. Call only when the work is about to happen. */
export function chargeOne(req: IncomingMessage, now: Date = new Date()): LimitDecision {
  roll(now);
  const key = visitorKey(req);
  const mine = counters.perVisitor.get(key) ?? 0;
  if (counters.total >= TOTAL_DAILY) return { allowed: false, message: OVER_TOTAL_LIMIT };
  if (mine >= PER_VISITOR_DAILY) return { allowed: false, message: OVER_VISITOR_LIMIT };
  counters.total += 1;
  counters.perVisitor.set(key, mine + 1);
  return { allowed: true };
}

/** How much of today's total ceiling is spent, for the owner's own check. */
export function usageToday(now: Date = new Date()): { used: number; limit: number; visitors: number } {
  roll(now);
  return { used: counters.total, limit: TOTAL_DAILY, visitors: counters.perVisitor.size };
}

/** Test seam: forget every count. */
export function resetCounters(): void {
  counters.day = "";
  counters.total = 0;
  counters.perVisitor.clear();
}
