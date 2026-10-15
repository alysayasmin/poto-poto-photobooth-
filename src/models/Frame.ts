import "server-only";
import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";
const schema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
  // Optional only for legacy local frames; all new uploads populate this field.
  cloudinaryPublicId: { type: String },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });
schema.index({ isPublished: 1, createdAt: -1 });
export const Frame = (models.Frame as Model<InferSchemaType<typeof schema>>) || model("Frame", schema);
export default Frame;
