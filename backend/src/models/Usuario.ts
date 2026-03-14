// src/models/Usuario.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUsuarioDocument extends Document {
  nome: string;
  email: string;
  senha: string;
  perfil: 'paciente' | 'secretario' | 'admin';
  telefone?: string;
  cep?: string;
  endereco?: {
    logradouro: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  compararSenha(senha: string): Promise<boolean>;
}

const EnderecoSchema = new Schema({
  logradouro: String,
  bairro: String,
  cidade: String,
  estado: String,
  cep: String,
}, { _id: false });

const UsuarioSchema = new Schema<IUsuarioDocument>({
  nome: { type: String, required: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  senha: { type: String, required: true, minlength: 6 },
  perfil: { type: String, enum: ['paciente', 'secretario', 'admin'], default: 'paciente' },
  telefone: { type: String, trim: true },
  cep: { type: String, trim: true },
  endereco: { type: EnderecoSchema },
}, { timestamps: true });

// Hash da senha antes de salvar
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// Método para comparar senha
UsuarioSchema.methods.compararSenha = async function (senha: string): Promise<boolean> {
  return bcrypt.compare(senha, this.senha);
};

export default mongoose.model<IUsuarioDocument>('Usuario', UsuarioSchema);
