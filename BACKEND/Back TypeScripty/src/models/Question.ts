import { Schema, model } from 'mongoose';

export interface IQuestion {
  idLivro: string;
  pergunta: string;
  alternativas: string[];
  correta: number; 
}

const questionSchema = new Schema<IQuestion>({
  idLivro: { type: String, required: true, index: true },
  pergunta: { type: String, required: true },
  alternativas: { type: [String], required: true },
  correta: { type: Number, required: true }
});

export default model<IQuestion>('Question', questionSchema);
