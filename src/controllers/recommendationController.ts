import { Request, Response } from 'express';
import Book from '../models/Book';
import Question from '../models/Question';

export async function getRecommendationsController(req: Request, res: Response) {
  try {
    const { ra } = req.params;

    // 1. Lógica: Identificar livros que o usuário completou (sucesso no quiz)
    // Simulamos que ele 'gostou' de livros onde acertou mais de 60%
    const livrosCompletos = await Question.distinct('idLivro', { /* filtro de progresso do usuário */ });

    if (livrosCompletos.length === 0) {
      // Se não houver histórico, retorna livros aleatórios/recentes
      const exploracao = await Book.find().limit(3);
      return res.json(exploracao);
    }

    // 2. Extrair Perfil de Tags (Interesses)
    const livrosGostados = await Book.find({ _id: { $in: livrosCompletos } });
    const interesses = livrosGostados.flatMap(l => l.tags);

    // 3. Busca por Similaridade de Tags no MongoDB
    const recomendados = await Book.find({
      _id: { $nin: livrosCompletos }, // Não recomendar o que já leu
      tags: { $in: interesses }       // Recomendar o que tem tags em comum
    }).limit(4);

    return res.json(recomendados);
  } catch (err) {
    return res.status(500).json({ message: 'Erro no algoritmo de recomendação' });
  }
}