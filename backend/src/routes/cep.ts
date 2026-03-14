// src/routes/cep.ts
import { Router } from 'express';
import { buscarCep } from '../controllers/cepController';
import { autenticar } from '../middleware/auth';

const router = Router();

router.get('/:cep', autenticar, buscarCep);

export default router;
