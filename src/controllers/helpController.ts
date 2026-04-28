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

        // 1. Aqui você poderia buscar os nomes dos livros no seu MongoDB
        // const livrosNoBanco = await Livro.find().select('titulo');
        const livrosDisponiveis = "Vidas Secas, Dom Casmurro, O Mágico de Oz"; // Exemplo manual

        const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: `
        Você é o "BiblioBot", o assistente especializado do projeto Leiturar. 
        
        SUA MISSÃO:
        Ajudar alunos com informações sobre livros, autores, resumos e análise literária.
        
        DIRETRIZES:
        1. Se perguntarem sobre autores (ex: Machado de Assis, Guimarães Rosa), responda com detalhes biográficos e mencione suas principais obras.
        2. Se a pergunta for sobre um livro específico do acervo (Dom Casmurro, Vidas Secas, O Mágico de Oz), forneça análises profundas.
        3. Você tem permissão para falar sobre literatura universal e brasileira de forma ampla.
        
        BLOQUEIO DE SEGURANÇA:
        - Recuse APENAS perguntas que não tenham NADA a ver com educação ou leitura (ex: "como consertar um pneu", "receita de bolo", "previsão do tempo").
        - Nesses casos, diga: "Como assistente do Leiturar, meu foco é te ajudar com o mundo dos livros e da literatura. Posso te ajudar com alguma dúvida sobre autores ou obras?"
    `
});

        // 2. Criamos um "super prompt" que limita a IA
        const superPrompt = `
            Contexto do Acervo: Os livros disponíveis atualmente são: ${livrosDisponiveis}.
            Pergunta do Usuário: ${prompt}
            
            Lembre-se: Se a pergunta não for sobre livros, recuse.
        `;

        const result = await model.generateContent(superPrompt);
        const text = result.response.text();

        res.json({ answer: text });
    } catch (error) {
        // ... erro ...
    }
}