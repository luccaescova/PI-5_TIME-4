import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app'; // Caminho para o seu arquivo app.ts

describe('🧪 Testes de Validação da IA de Recomendação por Tags', () => {
  
  // Conectar ao banco antes dos testes (usa o banco local do seed)
  beforeAll(async () => {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leiturar';
    // Se o mongoose já não estiver conectado por conta do app.ts
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }
  });

  // Fechar a conexão após os testes para não travar o terminal
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('1. Deve diferenciar tags específicas e recomendar "Vidas Secas" com alta relevância', async () => {
    const response = await request(app)
      .post('/books/recommend')
      .send({ tags: ['seca', 'nordeste', 'regionalismo'] });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    
    // O primeiro livro retornado deve ser Vidas Secas, pois o match de tags é perfeito
    expect(response.body[0]._id).toBe('vidas_secas');
  });

  it('2. Deve lidar com tags genéricas e retornar múltiplos livros que compartilham a tag "clássico"', async () => {
    const response = await request(app)
      .post('/books/recommend')
      .send({ tags: ['clássico'] });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Com base no seu seed.ts, tanto o Mágico de Oz quanto Vidas Secas e Dom Casmurro têm a tag 'clássico'
    // A resposta deve conter mais de um livro
    expect(response.body.length).toBeGreaterThan(1);

    // Garante que os objetos retornados têm a estrutura correta de livro
    expect(response.body[0]).toHaveProperty('titulo');
    expect(response.body[0]).toHaveProperty('tags');
  });

  it('3. Deve retornar uma lista vazia quando nenhuma tag der match', async () => {
    const response = await request(app)
      .post('/books/recommend')
      .send({ tags: ['cyberpunk', 'alienígenas', 'futurista'] });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Como nenhum livro do seed tem essas tags, a IA deve retornar uma lista vazia []
    expect(response.body.length).toBe(0);
  });

  it('4. Deve retornar erro 400 se o payload de tags for enviado incorretamente', async () => {
    const response = await request(app)
      .post('/books/recommend')
      .send({ tags: [] }); // Array vazio

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Informe pelo menos uma tag');
  });
});