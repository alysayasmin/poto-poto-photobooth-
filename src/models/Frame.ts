import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";
const schema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });
schema.index({ isPublished: 1, createdAt: -1 });
export const Frame = (models.Frame as Model<InferSchemaType<typeof schema>>) || model("Frame", schema);
