import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import mongoose from 'mongoose';

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