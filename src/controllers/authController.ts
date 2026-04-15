import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Use uma variável de ambiente para o secret em produção!
const JWT_SECRET = process.env.JWT_SECRET || 'secret_super_seguro_123';

// --------------------- REGISTER --------------------------
export async function registerController(req: Request, res: Response) {
  try {
    const { ra, senha, nome, email } = req.body;
    if (!ra || !senha || !email)
      return res.status(400).json({ message: 'RA, email e senha são obrigatórios.' });

    const existing = await User.findOne({ ra });
    if (existing)
      return res.status(409).json({ message: 'RA já cadastrado.' });

    const hash = await bcrypt.hash(senha, 10);

    const user = await User.create({
      ra,
      senha: hash,
      nome,
      email
    });

    return res.status(201).json({
      ra: user.ra,
      nome: user.nome,
      email: user.email
    });

  } catch (err) {
    console.error("Erro no Registro:", err);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// --------------------- LOGIN --------------------------
export async function loginController(req: Request, res: Response) {
  try {
    const { ra, senha } = req.body;
    
    // Busca o usuário e pede explicitamente o campo senha que está com select: false
    const user = await User.findOne({ ra }).select('+senha'); 
    
    if (!user || !(await bcrypt.compare(senha, user.senha))) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign({ ra: user.ra }, JWT_SECRET, { expiresIn: '8h' });

    return res.json({
      token,
      user: { ra: user.ra, nome: user.nome, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno.' });
  }
}

// --------------------- FORGOT PASSWORD --------------------------
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { ra, email } = req.body;

    const user = await User.findOne({ ra, email });
    if (!user)
      return res.status(404).json({ message: 'RA ou email incorretos.' });

    // Gera um token aleatório
    const token = crypto.randomBytes(20).toString("hex");

    // Define expiração para 30 minutos
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30;
    
    await user.save();

    // Como você não está usando e-mail (Resend), retornamos o link no JSON para o frontend usar
    const resetURL = `http://localhost:5500/resetPassword.html?token=${token}`;

    return res.json({
      message: "Processo de recuperação iniciado.",
      resetURL // No futuro, você enviaria isso por e-mail
    });

  } catch (err) {
    console.error("Erro no Forgot Password:", err);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}

// --------------------- RESET PASSWORD --------------------------
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha) {
        return res.status(400).json({ message: "A nova senha é obrigatória." });
    }

    // Busca usuário com token válido e que não expirou
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user)
      return res.status(400).json({ message: "Token inválido ou expirado." });

    const hash = await bcrypt.hash(novaSenha, 10);

    user.senha = hash;
    // Limpa os campos de reset
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ message: "Senha redefinida com sucesso!" });

  } catch (err) {
    console.error("Erro no Reset Password:", err);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
}

