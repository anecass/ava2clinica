// src/controllers/agendamentoController.ts
import { Response } from 'express';
import axios from 'axios';
import Agendamento from '../models/Agendamento';
import Usuario from '../models/Usuario';
import { RequestAutenticado } from '../middleware/auth';

// Verifica previsão de chuva via OpenWeatherMap
async function verificarChuva(data: string): Promise<{ alertaChuva: boolean; previsaoClima: string }> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const cidade = process.env.OPENWEATHER_CITY || 'Rio de Janeiro';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&lang=pt_br&units=metric`;

    const { data: clima } = await axios.get(url);

    const dataAlvo = new Date(data + 'T12:00:00').toISOString().split('T')[0];
    const previsoes = clima.list.filter((item: { dt_txt: string }) => item.dt_txt.startsWith(dataAlvo));

    if (previsoes.length === 0) {
      return { alertaChuva: false, previsaoClima: 'Previsão não disponível para esta data.' };
    }

    const temChuva = previsoes.some((item: { weather: Array<{ main: string }> }) =>
      item.weather.some((w) => w.main === 'Rain' || w.main === 'Drizzle' || w.main === 'Thunderstorm')
    );

    const descricao = previsoes[0].weather[0].description;
    const temp = Math.round(previsoes[0].main.temp);
    const previsaoClima = `${descricao.charAt(0).toUpperCase() + descricao.slice(1)}, ${temp}°C`;

    return { alertaChuva: temChuva, previsaoClima };
  } catch {
    return { alertaChuva: false, previsaoClima: 'Não foi possível obter previsão do tempo.' };
  }
}

// POST /agendamentos
export const criarAgendamento = async (req: RequestAutenticado, res: Response): Promise<void> => {
  try {
    const { medico, especialidade, data, hora, observacoes } = req.body;
    const pacienteId = req.usuario?.id;

    const erros: string[] = [];
    if (!medico) erros.push('Nome do médico é obrigatório.');
    if (!especialidade) erros.push('Especialidade é obrigatória.');
    if (!data) erros.push('Data é obrigatória.');
    if (!hora) erros.push('Hora é obrigatória.');

    if (erros.length > 0) {
      res.status(400).json({ erro: 'Dados inválidos.', detalhes: erros });
      return;
    }

    // Verifica conflito de horário
    const conflito = await Agendamento.findOne({
      medico,
      data,
      hora,
      status: { $in: ['agendado', 'confirmado'] },
    });

    if (conflito) {
      res.status(409).json({ erro: 'Este horário já está ocupado para o médico selecionado.' });
      return;
    }

    const paciente = await Usuario.findById(pacienteId);
    const pacienteNome = paciente?.nome || 'Paciente';

    // Consulta clima para a data
    const { alertaChuva, previsaoClima } = await verificarChuva(data);

    const agendamento = await Agendamento.create({
      pacienteId,
      pacienteNome,
      medico,
      especialidade,
      data,
      hora,
      observacoes,
      status: 'agendado',
      alertaChuva,
      previsaoClima,
    });

    res.status(201).json({
      mensagem: 'Consulta agendada com sucesso!',
      dados: agendamento,
      alertaChuva,
      previsaoClima,
    });
  } catch (err) {
    console.error('Erro ao criar agendamento:', err);
    res.status(500).json({ erro: 'Erro interno ao criar agendamento.' });
  }
};

// GET /agendamentos/meus
export const meusAgendamentos = async (req: RequestAutenticado, res: Response): Promise<void> => {
  try {
    const agendamentos = await Agendamento.find({ pacienteId: req.usuario?.id }).sort({ data: 1, hora: 1 });
    res.status(200).json({ dados: agendamentos });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar agendamentos.' });
  }
};

// GET /agendamentos (admin/secretario)
export const listarTodos = async (req: RequestAutenticado, res: Response): Promise<void> => {
  try {
    const agendamentos = await Agendamento.find().sort({ data: 1, hora: 1 });
    res.status(200).json({ dados: agendamentos });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar agendamentos.' });
  }
};

// PATCH /agendamentos/:id/status
export const atualizarStatus = async (req: RequestAutenticado, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['agendado', 'confirmado', 'cancelado', 'concluido'];
    if (!statusValidos.includes(status)) {
      res.status(400).json({ erro: 'Status inválido.' });
      return;
    }

    const agendamento = await Agendamento.findByIdAndUpdate(id, { status }, { new: true });
    if (!agendamento) {
      res.status(404).json({ erro: 'Agendamento não encontrado.' });
      return;
    }

    res.status(200).json({ mensagem: 'Status atualizado com sucesso.', dados: agendamento });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar status.' });
  }
};

// DELETE /agendamentos/:id
export const cancelarAgendamento = async (req: RequestAutenticado, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const agendamento = await Agendamento.findOne({ _id: id, pacienteId: req.usuario?.id });

    if (!agendamento) {
      res.status(404).json({ erro: 'Agendamento não encontrado.' });
      return;
    }

    agendamento.status = 'cancelado';
    await agendamento.save();

    res.status(200).json({ mensagem: 'Agendamento cancelado com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cancelar agendamento.' });
  }
};
