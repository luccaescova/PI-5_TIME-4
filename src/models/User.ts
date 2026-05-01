import { Schema, model } from 'mongoose';

export interface IInteresse {
  tag: string;
  pontos: number;
}

export interface IUser {
  ra: string;
  nome?: string;
  senha: string;
  email: string;

  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  interesses: IInteresse[]; 
  livrosLidos: string[];
}

const userSchema = new Schema<IUser>({
  ra: { type: String, required: true, unique: true },
  nome: { type: String },
  senha: { type: String, required: true, select: false }, 
  email: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Number },
  interesses: [{
    tag: String,
    pontos: { type: Number, default: 0 }
  }],
  livrosLidos: [{ type: String }]
}, { timestamps: true });

export default model<IUser>('User', userSchema);