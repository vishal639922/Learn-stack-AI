import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var mongoMemoryServer: MongoMemoryServer | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

/** Read MONGODB_URI from env (handles quotes, whitespace, accidental key prefix). */
export function getMongoUriFromEnv(): string | undefined {
  const raw =
    process.env.MONGODB_URI ??
    process.env.DATABASE_URL ??
    "";

  let value = raw.trim();
  if (!value) return undefined;

  if (value.startsWith("MONGODB_URI=")) {
    value = value.slice("MONGODB_URI=".length).trim();
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  if (!value.startsWith("mongodb://") && !value.startsWith("mongodb+srv://")) {
    return undefined;
  }

  return value;
}

async function resolveMongoUri(): Promise<string> {
  const uri = getMongoUriFromEnv();
  if (uri) {
    return uri;
  }

  if (process.env.NODE_ENV === "development") {
    if (!global.mongoMemoryServer) {
      global.mongoMemoryServer = await MongoMemoryServer.create();
      console.log(
        "[mongodb] Using in-memory database for local development:",
        global.mongoMemoryServer.getUri()
      );
    }
    return global.mongoMemoryServer.getUri();
  }

  const hint = process.env.VERCEL
    ? "Add MONGODB_URI in Vercel → Settings → Environment Variables (Production), then redeploy."
    : "Add MONGODB_URI to .env.local and restart npm run dev.";

  throw new Error(`MONGODB_URI is not set. ${hint}`);
}

export function isDbConfigured(): boolean {
  return Boolean(getMongoUriFromEnv()) || process.env.NODE_ENV === "development";
}

export function getDbMode(): "atlas" | "in-memory" | "unconfigured" {
  if (getMongoUriFromEnv()) return "atlas";
  if (process.env.NODE_ENV === "development") return "in-memory";
  return "unconfigured";
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      const uri = await resolveMongoUri();
      let conn: typeof mongoose;
      try {
        conn = await mongoose.connect(uri, {
          bufferCommands: false,
          readPreference: "primary",
        });
      } catch (error) {
        cached.promise = null;
        const message =
          error instanceof Error ? error.message : String(error);
        if (uri.startsWith("mongodb+srv://") && message.includes("querySrv")) {
          throw new Error(
            "MongoDB SRV lookup failed (common on Windows). In Atlas: Connect → Drivers → choose a standard connection string (mongodb://...), or set directConnection=true. See .env.example"
          );
        }
        throw error;
      }
      const mode = getDbMode();
      console.log(
        `[mongodb] Connected (${mode === "atlas" ? "MONGODB_URI" : "in-memory dev"}) → ${conn.connection.db?.databaseName ?? "unknown"}`
      );
      return conn;
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
