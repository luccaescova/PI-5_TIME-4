import { Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

// Força o carregamento do .env localizando-o a partir da pasta atual
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

// Esse log vai aparecer no seu terminal e dirá a verdade!
console.log("DEBUG: Tentando usar a chave ->", apiKey ? "Chave encontrada!" : "CHAVE NÃO ENCONTRADA (UNDEFINED)");

const genAI = new GoogleGenerativeAI(apiKey || "");


export async function askGeminiHelp(req: Request, res: Response) {
    try {
        const { prompt } = req.body;

        // 1. Definição do Acervo (Ideal buscar do MongoDB depois)
        const livrosDisponiveis = "Vidas Secas, Dom Casmurro, O Mágico de Oz";

        // 2. Configuração do Modelo com as Instruções de Sistema (O "Cérebro" da IA)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: `
                Você é o "BiblioBot", o assistente especializado do projeto Leiturar. 
                Sua missão é ajudar alunos com informações sobre livros, autores e literatura.
                
                DIRETRIZES:
                1. Fale sobre autores, obras e contexto literário de forma ampla.
                2. Dê atenção especial aos livros do acervo: ${livrosDisponiveis}.
                3. Se o assunto não for literatura/educação, recuse educadamente.
            `
        });

        // 3. Montagem do Prompt de contexto
        const superPrompt = `Pergunta do Usuário: ${prompt}`;

        // 4. MUDANÇA PARA STREAM: Iniciando a geração aos poucos
        const result = await model.generateContentStream(superPrompt);

        // 5. Configuração dos Headers para o Navegador aceitar o Stream
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // 6. Loop que envia cada "pedaço" (chunk) da resposta assim que chega do Google
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(chunkText); // Escreve o pedaço no corpo da resposta HTTP
        }

        // 7. Finaliza a conexão
        res.end();

    } catch (error) {
        console.error("Erro no Stream do Gemini:", error);
        // Se der erro, precisamos fechar a conexão para o front não ficar esperando
        if (!res.headersSent) {
            res.status(500).json({ error: "Erro ao processar sua dúvida." });
        } else {
            res.end();
        }
    }
}