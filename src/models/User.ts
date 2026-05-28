import { Schema, model } from 'mongoose';

export interface IUser {
  ra: string;
  nome?: string;
  senha: string;
  email: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
}

const userSchema = new Schema<IUser>({
  ra: { type: String, required: true, unique: true },
  nome: { type: String },
  senha: { type: String, required: true, select: false },
  email: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Number }
}, { timestamps: true });

export default model<IUser>('User', userSchema);