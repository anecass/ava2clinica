// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IJwtPayload } from '../types';

export interface RequestAutenticado extends Request {
  usuario?: IJwtPayload;
}

export const autenticar = (req: RequestAutenticado, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as IJwtPayload;
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado. Faça login novamente.' });
  }
};

export const autorizarAdmin = (req: RequestAutenticado, res: Response, next: NextFunction): void => {
  if (!req.usuario || (req.usuario.perfil !== 'admin' && req.usuario.perfil !== 'secretario')) {
    res.status(403).json({ erro: 'Acesso negado. Permissão insuficiente.' });
    return;
  }
  next();
};
