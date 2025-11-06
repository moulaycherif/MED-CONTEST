import mongoose, { Document, Schema } from "mongoose";

export interface IStudent extends Document {
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
