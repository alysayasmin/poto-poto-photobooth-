import mongoose from "mongoose";
const globalDb = globalThis as typeof globalThis & { mongoPromise?: Promise<typeof mongoose> };
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  if (!globalDb.mongoPromise) {
    globalDb.mongoPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }).catch((error) => {
      globalDb.mongoPromise = undefined;
      throw error;
    });
  }
  return globalDb.mongoPromise;
}
