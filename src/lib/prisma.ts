import { PrismaClient } from "@prisma/client";

const QUERY_TIMEOUT_MS = 10_000;
const FAILURE_THRESHOLD = 5;
const OPEN_MS = 30_000;

let consecutiveFailures = 0;
let openUntil = 0;

class DatabaseUnavailableError extends Error {
  constructor() {
    super("Database is temporarily unavailable");
    this.name = "DatabaseUnavailableError";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Database query timed out after ${ms}ms`)),
      ms
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function guarded<T>(operation: () => Promise<T>): Promise<T> {
  const now = Date.now();

  if (openUntil > now) {
    throw new DatabaseUnavailableError();
  }

  try {
    const result = await withTimeout(operation(), QUERY_TIMEOUT_MS);
    consecutiveFailures = 0;
    return result;
  } catch (error) {
    consecutiveFailures += 1;
    if (consecutiveFailures >= FAILURE_THRESHOLD) {
      openUntil = now + OPEN_MS;
      consecutiveFailures = 0;
    }
    throw error;
  }
}

const base = new PrismaClient();

const prisma = base.$extends({
  query: {
    $allOperations({ operation, args, query }) {
      return guarded(() => query(args));
    },
  },
});

export function isDatabaseUnavailable(error: unknown): boolean {
  return error instanceof DatabaseUnavailableError;
}

export default prisma;
