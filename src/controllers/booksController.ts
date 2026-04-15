import { Request, Response } from 'express';
import Book from '../models/Book'; 
import Question from '../models/Question';
import { CorretorRequest } from '../models/Corretor';

// Mapa para converter letras do gabarito em índices (0, 1, 2...)
const letraParaIndice: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };

const GABARITOS: Record<string, string[]> = {
  magico_oz: ["C", "B", "C", "C", "C"], // Ajustado conforme o seed.ts
  vidas_secas: ["B", "C", "B", "C", "C"],
  dom_casmurro: ["C", "C", "B", "C", "B"],
};

export async function corrigirRespostasController(req: Request, res: Response) {
  try {
    const { livro, respostas }: CorretorRequest = req.body;

    if (!livro || !Array.isArray(respostas)) {
      return res.status(400).json({ message: 'Dados inválidos' });
    }

    const gabaritoOficial = GABARITOS[livro];
    if (!gabaritoOficial) {
      return res.status(404).json({ message: 'Gabarito não encontrado' });
    }

    let acertos = 0;

    respostas.forEach((resAlu, index) => {
      // Converte a letra do gabarito para o índice correspondente
      const indiceCorreto = letraParaIndice[gabaritoOficial[index].toUpperCase()];
      
      // Assume que o frontend envia o índice da alternativa escolhida (0 a 4)
      if (Number(resAlu) === indiceCorreto) {
        acertos++;
      }
    });

    return res.json({ acertos, total: gabaritoOficial.length, livro });
  } catch (err) {
    return res.status(500).json({ message: 'Erro na correção' });
  }
}

// ... manter as outras funções (listBooks, getQuestions) como estavam

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


