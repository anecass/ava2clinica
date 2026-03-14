// src/controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Usuario from '../models/Usuario';
import { ICadastroPayload, ILoginPayload, IViaCepResposta } from '../types';

// POST /auth/cadastro
export const cadastrar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha, perfil, telefone, cep }: ICadastroPayload = req.body;

    const erros: string[] = [];
    if (!nome || nome.trim().length < 3) erros.push('Nome deve ter pelo menos 3 caracteres.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.push('E-mail inválido.');
    if (!senha || senha.length < 6) erros.push('Senha deve ter pelo menos 6 caracteres.');

    if (erros.length > 0) {
      res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
      return;
    }

    const emailExiste = await Usuario.findOne({ email: email.toLowerCase() });
    if (emailExiste) {
      res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
      return;
    }

    // Busca endereço via CEP se fornecido
    let endereco;
    if (cep) {
      try {
        const cepLimpo = cep.replace(/\D/g, '');
        const { data } = await axios.get<IViaCepResposta>(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        if (!data.erro) {
          endereco = {
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
            cep: data.cep,
          };
        }
      } catch {
        // CEP inválido — ignora, não bloqueia cadastro
      }
    }

    const usuario = await Usuario.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha,
      perfil: perfil || 'paciente',
      telefone,
      cep,
      endereco,
    });

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso!',
      dados: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        endereco: usuario.endereco,
        token,
      },
    });
  } catch (err) {
    console.error('Erro no cadastro:', err);
    res.status(500).json({ erro: 'Erro interno ao realizar cadastro.' });
  }
};

// POST /auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha }: ILoginPayload = req.body;

    if (!email || !senha) {
      res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
      return;
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() });
    if (!usuario) {
      res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
      return;
    }

    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
      return;
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      dados: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        token,
      },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno ao realizar login.' });
  }
};

// GET /auth/me
export const perfil = async (req: Request & { usuario?: { id: string } }, res: Response): Promise<void> => {
  try {
    const usuario = await Usuario.findById(req.usuario?.id).select('-senha');
    if (!usuario) {
      res.status(404).json({ erro: 'Usuário não encontrado.' });
      return;
    }
    res.status(200).json({ dados: usuario });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno.' });
  }
};
