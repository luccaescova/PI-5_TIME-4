import { Schema, model } from 'mongoose';

// Definição da interface para garantir a tipagem correta
export interface IBook {
  _id: string; // Usaremos IDs curtos e amigáveis (ex: 'dom_casmurro')
  titulo: string;
  autor: string;
}

const BookSchema = new Schema<IBook>({
  _id: { type: String, required: true },
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
}, {
  // Adiciona campos createdAt e updatedAt
  timestamps: true,
});

const BookModel = model<IBook>('Book', BookSchema);

export default BookModel;