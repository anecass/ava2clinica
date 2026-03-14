// src/models/Agendamento.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAgendamentoDocument extends Document {
  pacienteId: mongoose.Types.ObjectId;
  pacienteNome: string;
  medico: string;
  especialidade: string;
  data: string;
  hora: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
  observacoes?: string;
  alertaChuva?: boolean;
  previsaoClima?: string;
}

const AgendamentoSchema = new Schema<IAgendamentoDocument>({
  pacienteId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  pacienteNome: { type: String, required: true },
  medico: { type: String, required: true, trim: true },
  especialidade: { type: String, required: true, trim: true },
  data: { type: String, required: true },
  hora: { type: String, required: true },
  status: {
    type: String,
    enum: ['agendado', 'confirmado', 'cancelado', 'concluido'],
    default: 'agendado',
  },
  observacoes: { type: String, trim: true },
  alertaChuva: { type: Boolean, default: false },
  previsaoClima: { type: String },
}, { timestamps: true });

export default mongoose.model<IAgendamentoDocument>('Agendamento', AgendamentoSchema);
