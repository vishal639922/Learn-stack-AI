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

async function resolveMongoUri(): Promise<string> {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
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

  throw new Error(
    "MONGODB_URI is not set. Add it to .env.local or run in development mode."
  );
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI) || process.env.NODE_ENV === "development";
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      const uri = await resolveMongoUri();
      return mongoose.connect(uri, { bufferCommands: false });
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
