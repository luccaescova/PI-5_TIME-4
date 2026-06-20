import { Request, Response } from 'express';
import Book from '../models/Book';
import Question from '../models/Question';

export async function listBooksController(req: Request, res: Response) {
  try {
    const books = await Book.find({});
    return res.json(books);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'erro' });
  }
}

export async function addBookController(req: Request, res: Response) {
  try {
    const { id, titulo, autor } = req.body;
    if (!id || !titulo) return res.status(400).json({ message: 'id e titulo obrigatórios' });

    const existing = await Book.findById(id);
    if (existing) return res.status(409).json({ message: 'livro já existe' });

    const book = await Book.create({ _id: id, titulo, autor });
    return res.status(201).json(book);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'erro' });
  }
}

export async function getBookQuestionsController(req: Request, res: Response) {
  try {
    const { bookId } = req.params;
    const questions = await Question.find({ idLivro: bookId });
    return res.json(questions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'erro' });
  }
}

export async function addQuestionController(req: Request, res: Response) {
  try {
    const { bookId } = req.params;
    const { pergunta, alternativas, correta } = req.body;
    if (!pergunta || !alternativas || typeof correta !== 'number') {
      return res.status(400).json({ message: 'payload inválido' });
    }
    const q = await Question.create({ idLivro: bookId, pergunta, alternativas, correta });
    return res.status(201).json(q);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'erro' });
  }
}
