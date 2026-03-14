// src/routes/agendamentos.ts
import { Router } from 'express';
import { autenticar, autorizarAdmin } from '../middleware/auth';
import {
  criarAgendamento,
  meusAgendamentos,
  listarTodos,
  atualizarStatus,
  cancelarAgendamento,
} from '../controllers/agendamentoController';

const router = Router();

router.post('/', autenticar, criarAgendamento);
router.get('/meus', autenticar, meusAgendamentos);
router.get('/', autenticar, autorizarAdmin, listarTodos);
router.patch('/:id/status', autenticar, autorizarAdmin, atualizarStatus);
router.delete('/:id', autenticar, cancelarAgendamento);

export default router;
