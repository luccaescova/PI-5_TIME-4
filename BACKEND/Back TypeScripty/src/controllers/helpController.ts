import { Request, Response } from "express";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendHelpEmail = async (req: Request, res: Response) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ error: "Campos obrigatórios." });
    }

    try {
        await resend.emails.send({
            from: "Leiturar <suporte@leiturar.dev>",
            to: "SEU_EMAIL_AQUI",
            replyTo: email,
            subject: "Pedido de suporte - Leiturar",
            text: message
        });

        return res.json({ success: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao enviar." });
    }
};
