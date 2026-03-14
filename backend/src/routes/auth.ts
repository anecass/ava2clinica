// src/routes/auth.ts
import { Router } from 'express';
import { cadastrar, login, perfil } from '../controllers/authController';
import { autenticar } from '../middleware/auth';

const router = Router();

router.post('/cadastro', cadastrar);
router.post('/login', login);
router.get('/me', autenticar, perfil);

export default router;
