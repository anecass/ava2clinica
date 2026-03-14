// src/seed.ts
// Script para criar usuário secretário padrão no banco
// Execute com: npx ts-node src/seed.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Usuario from './models/Usuario';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Conectado ao MongoDB');

    // Verifica se já existe
    const existe = await Usuario.findOne({ email: 'secretario@clinica.com' });
    if (existe) {
      console.log('ℹ️  Usuário secretário já existe. Nada foi alterado.');
      process.exit(0);
    }

    await Usuario.create({
      nome: 'Secretária Admin',
      email: 'secretario@clinica.com',
      senha: 'secretario123',
      perfil: 'secretario',
    });

    console.log('✅ Usuário secretário criado com sucesso!');
    console.log('📧 E-mail: secretario@clinica.com');
    console.log('🔑 Senha:  secretario123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
}

seed();
