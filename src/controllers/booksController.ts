import { Request, Response } from 'express';
import Book from '../models/Book'; 
import Question from '../models/Question';
import { CorretorRequest } from '../models/Corretor';

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


const GABARITOS: Record<string, string[]> = {
  magico_oz: ["C", "A", "B", "E", "D"], // Exemplo baseado no bytecode
  vidas_secas: ["B", "B", "C", "A", "E"],
  dom_casmurro: ["A", "D", "E", "C", "B"],
};

export async function corrigirRespostasController(req: Request, res: Response) {
  try {
    const { livro, respostas }: CorretorRequest = req.body;

    if (!livro || !Array.isArray(respostas)) {
      return res.status(400).json({ message: 'Payload inválido: livro e respostas são obrigatórios' });
    }

    const gabaritoOficial = GABARITOS[livro];

    if (!gabaritoOficial) {
      return res.status(404).json({ message: 'Gabarito para este livro não encontrado' });
    }

    let acertos = 0;

    // Lógica do loop extraída do Java: ignoreCase e comparação por índice
    respostas.forEach((respostaAluno, index) => {
      if (
        respostaAluno && 
        gabaritoOficial[index] && 
        respostaAluno.toLowerCase() === gabaritoOficial[index].toLowerCase()
      ) {
        acertos++;
      }
    });

    return res.json({
      acertos,
      total: gabaritoOficial.length,
      livro
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao processar correção' });
  }
}