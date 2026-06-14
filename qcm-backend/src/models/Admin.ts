import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  // 🔒 Propriétés ajoutées pour la sécurité de session unique
  currentSessionId?: string | null;
  currentIp?: string | null;
}

const AdminSchema = new Schema<IAdmin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // 🔒 Champs stockés en base de données pour valider la session
  currentSessionId: { type: String, default: null },
  currentIp: { type: String, default: null },
});

export default mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);