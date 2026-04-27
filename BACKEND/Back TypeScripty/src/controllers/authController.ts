import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

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
    console.error(err);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
}

// --------------------- LOGIN --------------------------
export async function loginController(req: Request, res: Response) {
  try {
    const { ra, senha } = req.body;
    if (!ra || !senha)
      return res.status(400).json({ message: 'RA e senha obrigatórios.' });

    const user = await User.findOne({ ra });
    if (!user)
      return res.status(401).json({ message: 'Credenciais inválidas.' });

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok)
      return res.status(401).json({ message: 'Credenciais inválidas.' });

    const token = jwt.sign(
      { ra: user.ra, nome: user.nome },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        ra: user.ra,
        nome: user.nome,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
}

// --------------------- FORGOT PASSWORD --------------------------
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { ra, email } = req.body;

    const user = await User.findOne({ ra, email });
    if (!user)
      return res.status(404).json({ message: 'RA ou email incorretos.' });

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30;
    await user.save();

    const resetURL = `http://localhost:5500/resetPassword.html?token=${token}`;

    return res.json({
      message: "Usuário encontrado.",
      token,
      resetURL
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor." });
  }
}

// --------------------- RESET PASSWORD --------------------------
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const { novaSenha } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: "Token inválido ou expirado." });

    const hash = await bcrypt.hash(novaSenha, 10);

    user.senha = hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ message: "Senha redefinida com sucesso!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor." });
  }
}
