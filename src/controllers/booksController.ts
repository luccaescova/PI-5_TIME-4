import { Request, Response } from 'express';
import Book from '../models/Book'; 
import Question from '../models/Question';
import { CorretorRequest } from '../models/Corretor';

// Mapa para converter letras do gabarito em índices (0, 1, 2...)
const letraParaIndice: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };

const GABARITOS: Record<string, string[]> = {
  magico_oz: ["C", "B", "C", "C", "C"], 
  vidas_secas: ["B", "C", "B", "C", "C"],
  dom_casmurro: ["C", "C", "B", "C", "B"],
};

export async function corrigirRespostasController(req: Request, res: Response) {
  try {
    const { livro, respostas }: { livro: string, respostas: string[] } = req.body;

    if (!livro || !Array.isArray(respostas)) {
      return res.status(400).json({ message: 'Dados inválidos' });
    }

    const gabaritoOficial = GABARITOS[livro];
    if (!gabaritoOficial) return res.status(404).json({ message: 'Gabarito não encontrado' });

    let acertos = 0;

    respostas.forEach((respostaAluno, index) => {
      // Pega a letra do gabarito oficial (ex: "C") e converte para índice (ex: 2)
      const letraCorreta = gabaritoOficial[index];
      const indiceCorreto = letraParaIndice[letraCorreta];

      // Pega a letra que veio do frontend (ex: "C") e converte para índice (ex: 2)
      const indiceAluno = letraParaIndice[respostaAluno.toUpperCase()];

      // Compara os índices
      if (indiceAluno === indiceCorreto) {
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

// retorna lista de tags únicas extraídas de todos os livros do banco
export async function listTagsController(_req: Request, res: Response) {
  try {
    const books = await Book.find({}, { tags: 1, _id: 0 }).lean();
    const tags = new Set<string>();
    for (const b of books as Array<{ tags?: string[] }>) {
      for (const t of (b.tags || [])) {
        if (typeof t === 'string' && t.trim()) tags.add(t.trim().toLowerCase());
      }
    }
    return res.json({ tags: Array.from(tags).sort() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'erro' });
  }
}

// recebe um array de tags e retorna livros ordenados por número de tags em comum
export async function recommendBooksController(req: Request, res: Response) {
  try {
    const { tags } = req.body as { tags?: string[] };
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ message: 'envie um array "tags" com pelo menos um valor' });
    }

    const userTags = new Set(tags.map(t => String(t).trim().toLowerCase()).filter(Boolean));
    const books = await Book.find({}).lean();

    type BookDoc = {
      _id: string;
      titulo: string;
      autor: string;
      tags?: string[];
      coverUrl?: string;
      htmlUrl?: string;
    };

    const recomendacoes = (books as BookDoc[])
      .map(book => {
        const bookTags = new Set((book.tags || []).map(t => String(t).trim().toLowerCase()));
        const emComum: string[] = [];
        for (const t of userTags) if (bookTags.has(t)) emComum.push(t);
        return { book, score: emComum.length, tagsEmComum: emComum.sort() };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => ({
        _id: r.book._id,
        titulo: r.book.titulo,
        autor: r.book.autor,
        tags: r.book.tags || [],
        coverUrl: r.book.coverUrl,
        htmlUrl: r.book.htmlUrl,
        score: r.score,
        tagsEmComum: r.tagsEmComum,
      }));

    return res.json({
      tagsSelecionadas: Array.from(userTags),
      total: recomendacoes.length,
      recomendacoes,
    });
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


