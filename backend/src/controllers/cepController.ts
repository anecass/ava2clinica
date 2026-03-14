// src/controllers/cepController.ts
import { Request, Response } from 'express';
import axios from 'axios';
import { IViaCepResposta } from '../types';

// GET /cep/:cep
export const buscarCep = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cep } = req.params;
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      res.status(400).json({ erro: 'CEP inválido. Informe 8 dígitos.' });
      return;
    }

    const { data } = await axios.get<IViaCepResposta>(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (data.erro) {
      res.status(404).json({ erro: 'CEP não encontrado.' });
      return;
    }

    res.status(200).json({
      cep: data.cep,
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
    });
  } catch {
    res.status(500).json({ erro: 'Erro ao consultar CEP. Tente novamente.' });
  }
};
