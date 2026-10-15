import { connectDB } from "@/lib/mongodb";
import { Frame } from "@/models/Frame";
import { apiError, json } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await connectDB();
    return json(await Frame.find({ isPublished: true }).select("name slug imageUrl isPublished createdAt").sort({ createdAt: -1 }).lean());
  } catch (error) { return apiError(error); }
}
