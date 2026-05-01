import { Request, Response } from 'express';
import Book from '../models/Book'; 
import Question from '../models/Question';
import User from '../models/User'; 
const letraParaIndice: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };

const GABARITOS: Record<string, string[]> = {
  magico_oz: ["C", "B", "C", "C", "C"], 
  vidas_secas: ["B", "C", "B", "C", "C"],
  dom_casmurro: ["C", "C", "B", "C", "B"],
};

export async function corrigirRespostasController(req: Request, res: Response) {
  try {
    // Adicionado o 'ra' no corpo da requisição para identificar o usuário[cite: 4, 14]
    const { livro, respostas, ra }: { livro: string, respostas: string[], ra: string } = req.body;

    if (!livro || !Array.isArray(respostas) || !ra) {
      return res.status(400).json({ message: 'Dados inválidos (Livro, Respostas e RA são necessários)' });
    }

    const gabaritoOficial = GABARITOS[livro];
    if (!gabaritoOficial) return res.status(404).json({ message: 'Gabarito não encontrado' });

    let acertos = 0;

    respostas.forEach((respostaAluno, index) => {
      const letraCorreta = gabaritoOficial[index];
      const indiceCorreto = letraParaIndice[letraCorreta];
      const indiceAluno = letraParaIndice[respostaAluno.toUpperCase()];

      if (indiceAluno === indiceCorreto) {
        acertos++;
      }
    });


    if (acertos >= 3) {
      const livroData = await Book.findById(livro);
      const user = await User.findOne({ ra });

      if (livroData && user) {
        // Atualiza pontos baseados nas tags do livro
        livroData.tags.forEach((tag, index) => {
          // Tag principal (primeira) vale +2, secundárias valem +1
          const peso = (index === 0) ? 2 : 1;
          const interesseExistente = user.interesses.find(i => i.tag === tag);

          if (interesseExistente) {
            interesseExistente.pontos += peso;
          } else {
            user.interesses.push({ tag, pontos: peso });
          }
        });

        // Adiciona à lista de lidos para o algoritmo não recomendar o mesmo livro[cite: 11]
        if (!user.livrosLidos.includes(livro)) {
          user.livrosLidos.push(livro);
        }

        await user.save(); // Persiste a evolução do gosto no MongoDB[cite: 13]
      }
    }

    return res.json({ 
      acertos, 
      total: gabaritoOficial.length, 
      livro 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao processar correção e recomendação' });
  }
}

export async function listBooksController(req: Request, res: Response) {
  try {
    const books = await Book.find({});
    return res.json(books);
  } catch (err) {
    return res.status(500).json({ message: 'erro' });
  }
}

export async function addBookController(req: Request, res: Response) {
  try {
    const { id, titulo, autor, tags } = req.body; 
    if (!id || !titulo) return res.status(400).json({ message: 'id e titulo obrigatórios' });

    const existing = await Book.findById(id);
    if (existing) return res.status(409).json({ message: 'livro já existe' });

    const book = await Book.create({ _id: id, titulo, autor, tags });
    return res.status(201).json(book);
  } catch (err) {
    return res.status(500).json({ message: 'erro' });
  }
}

export async function getBookQuestionsController(req: Request, res: Response) {
  try {
    const { bookId } = req.params;
    const questions = await Question.find({ idLivro: bookId });
    return res.json(questions);
  } catch (err) {
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
    return res.status(500).json({ message: 'erro' });
  }
}