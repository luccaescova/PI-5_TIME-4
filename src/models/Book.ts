import { Schema, model } from 'mongoose';

export interface IBook {
  _id: string; 
  titulo: string;
  autor: string;
  tags: string[]; 
  pdfPath?: string;
}

const BookSchema = new Schema<IBook>({
  _id: { type: String, required: true },
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  tags: { type: [String], default: [] }, 
  pdfPath: { type: String },
}, { timestamps: true });

const BookModel = model<IBook>('Book', BookSchema);
export default BookModel;