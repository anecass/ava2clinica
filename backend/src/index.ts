// src/index.ts
// Servidor principal — Sistema de Atendimento para Clínicas Médicas

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import agendamentosRoutes from './routes/agendamentos';
import cepRoutes from './routes/cep';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// MIDDLEWARES
// =============================================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// =============================================
// CONEXÃO COM MONGODB
// =============================================
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('✅ MongoDB Atlas conectado com sucesso!'))
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// =============================================
// ROTAS
// =============================================
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    mensagem: '🏥 API - Sistema de Atendimento para Clínicas Médicas',
    versao: '1.0.0',
    rotas: {
      auth: {
        cadastro: 'POST /auth/cadastro',
        login: 'POST /auth/login',
        perfil: 'GET /auth/me',
      },
      agendamentos: {
        criar: 'POST /agendamentos',
        meus: 'GET /agendamentos/meus',
        todos: 'GET /agendamentos (admin)',
        status: 'PATCH /agendamentos/:id/status (admin)',
        cancelar: 'DELETE /agendamentos/:id',
      },
      cep: 'GET /cep/:cep',
    },
  });
});

app.use('/auth', authRoutes);
app.use('/agendamentos', agendamentosRoutes);
app.use('/cep', cepRoutes);

// =============================================
// TRATAMENTO DE ERROS
// =============================================
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro interno:', err.message);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

// =============================================
// INICIALIZAÇÃO
// =============================================
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 POST /auth/cadastro`);
  console.log(`🔐 POST /auth/login`);
  console.log(`📅 POST /agendamentos`);
  console.log(`🗺️  GET  /cep/:cep`);
});

export default app;
