import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const caminhoEsperado = path.resolve(__dirname, '../.env');
console.log("Procurando arquivo em:", caminhoEsperado);
console.log("O arquivo existe lá?", fs.existsSync(caminhoEsperado));

if (fs.existsSync(caminhoEsperado)) {
    const conteudo = fs.readFileSync(caminhoEsperado, 'utf8');
    console.log("Conteúdo lido com sucesso (primeiros 10 caracteres):", conteudo.substring(0, 10));
}
const PORT = process.env.PORT || 4000;

// [CORREÇÃO] Forçamos 127.0.0.1 em vez de localhost para evitar erro de resolução de DNS
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leiturar';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✓ Conectado ao MongoDB com sucesso!');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Erro crítico de conexão com o Mongo:');
    console.error('Certifique-se de que o serviço do MongoDB está INICIADO no seu Windows.');
    console.error(err.message);
  });