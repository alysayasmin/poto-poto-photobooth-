import "server-only";
import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";
const schema = new Schema({
  _id: { type: String, required: true },
  count: { type: Number, required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
});
export const LoginAttempt = (models.LoginAttempt as Model<InferSchemaType<typeof schema>>) || model("LoginAttempt", schema);
