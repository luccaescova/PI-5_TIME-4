export interface CorretorRequest {
  livro: string;
  respostas: string[];
}

export interface CorretorResponse {
  acertos: number;
  total: number;
  livro: string;
}