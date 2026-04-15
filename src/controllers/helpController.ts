import { Request, Response } from "express";
import { Resend } from "resend";

// Garante que o código não quebre se a chave estiver faltando no .env
const resend = new Resend(process.env.RESEND_API_KEY || 'chave_temporaria_para_nao_dar_erro');

export const sendHelpEmail = async (req: Request, res: Response) => {
    const { email, message } = req.body;

    if (!process.env.RESEND_API_KEY) {
        console.error("ERRO: RESEND_API_KEY não configurada no .env");
        return res.status(500).json({ error: "Configuração de e-mail ausente." });
    }

    if (!email || !message) {
        return res.status(400).json({ error: "Campos obrigatórios." });
    }

    try {
        await resend.emails.send({
            from: "Leiturar <onboarding@resend.dev>", // Use o domínio padrão da Resend para testes
            to: "seu-email@exemplo.com", // Coloque seu e-mail pessoal aqui para receber os testes
            replyTo: email,
            subject: "Pedido de suporte - Leiturar",
            text: `Mensagem de ${email}: ${message}`
        });

        return res.json({ success: true });

    } catch (error) {
        console.error("Erro no Resend:", error);
        return res.status(500).json({ error: "Erro ao enviar e-mail." });
    }
};