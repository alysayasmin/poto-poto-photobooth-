import "server-only";
import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";
const schema = new Schema({
  tokenHash: { type: String, required: true, unique: true },
  credentialHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
});
export const AdminSession = (models.AdminSession as Model<InferSchemaType<typeof schema>>) || model("AdminSession", schema);
