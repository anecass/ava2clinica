<template>
  <div style="max-width: 560px; width: 100%;">
    <div class="card">
      <div class="card-header">
        <h2>📅 Agendar Consulta</h2>
        <p>Preencha os dados para agendar sua consulta</p>
      </div>
      <div style="padding: 2rem;">

        <div v-if="sucesso" class="alerta alerta-sucesso">
          <div>
            <strong>✅ {{ sucesso }}</strong>
            <div v-if="alertaChuva" style="margin-top:0.5rem;">
              🌧️ <strong>Atenção:</strong> Previsão de chuva no dia da consulta! Leve um guarda-chuva.
            </div>
            <div v-if="previsaoClima" style="margin-top:0.3rem; font-size:0.88rem;">
              🌡️ Previsão: {{ previsaoClima }}
            </div>
          </div>
        </div>

        <div v-if="erro" class="alerta alerta-erro">❌ {{ erro }}</div>

        <div class="campo-grupo">
          <label>Especialidade <span class="obrigatorio">*</span></label>
          <select v-model="form.especialidade"
            :class="{ 'input-erro': erros.especialidade }"
            @change="onEspecialidadeChange">
            <option value="">-- Selecione a especialidade --</option>
            <option v-for="e in especialidades" :key="e" :value="e">{{ e }}</option>
          </select>
          <span v-if="erros.especialidade" class="mensagem-erro">{{ erros.especialidade }}</span>
        </div>

        <div class="campo-grupo">
          <label>Médico <span class="obrigatorio">*</span></label>
          <select v-model="form.medico"
            :class="{ 'input-erro': erros.medico }"
            :disabled="!form.especialidade"
            @change="erros.medico = ''">
            <option value="">{{ form.especialidade ? '-- Selecione um médico --' : '-- Selecione a especialidade primeiro --' }}</option>
            <option v-for="m in medicosFiltrados" :key="m" :value="m">{{ m }}</option>
          </select>
          <span v-if="erros.medico" class="mensagem-erro">{{ erros.medico }}</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="campo-grupo">
            <label>Data <span class="obrigatorio">*</span></label>
            <input v-model="form.data" type="date" :min="hoje"
              :class="{ 'input-erro': erros.data }" @change="erros.data = ''" />
            <span v-if="erros.data" class="mensagem-erro">{{ erros.data }}</span>
          </div>
          <div class="campo-grupo">
            <label>Horário <span class="obrigatorio">*</span></label>
            <select v-model="form.hora" :class="{ 'input-erro': erros.hora }" @change="erros.hora = ''">
              <option value="">-- Horário --</option>
              <option v-for="h in horarios" :key="h" :value="h">{{ h }}</option>
            </select>
            <span v-if="erros.hora" class="mensagem-erro">{{ erros.hora }}</span>
          </div>
        </div>

        <div class="campo-grupo">
          <label>Observações</label>
          <textarea v-model="form.observacoes" rows="3"
            placeholder="Sintomas, informações relevantes..." style="resize:vertical;"></textarea>
        </div>

        <button class="btn-primary" @click="agendar" :disabled="carregando">
          <span v-if="carregando"><span class="spinner"></span>Agendando...</span>
          <span v-else>📅 Confirmar Agendamento</span>
        </button>

        <router-link to="/meus-agendamentos">
          <button type="button" class="btn-secondary">📋 Ver Minhas Consultas</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js'

export default {
  name: 'Agendamento',
  data() {
    const hoje = new Date().toISOString().split('T')[0]
    return {
      form: { medico: '', especialidade: '', data: '', hora: '', observacoes: '' },
      erros: { medico: '', especialidade: '', data: '', hora: '' },
      especialidades: [
        'Clínica Geral', 'Cardiologia', 'Dermatologia', 'Ginecologia',
        'Ortopedia', 'Pediatria', 'Neurologia', 'Oftalmologia'
      ],
      medicosPorEspecialidade: {
        'Clínica Geral': ['Dr. Carlos Mendes', 'Dra. Ana Paula Souza'],
        'Cardiologia': ['Dr. Ricardo Lima', 'Dra. Fernanda Costa'],
        'Dermatologia': ['Dra. Fernanda Costa', 'Dr. Marcelo Oliveira'],
        'Ginecologia': ['Dra. Ana Paula Souza', 'Dra. Juliana Ramos'],
        'Ortopedia': ['Dr. Carlos Mendes', 'Dr. Marcelo Oliveira'],
        'Pediatria': ['Dra. Ana Paula Souza', 'Dr. Paulo Henrique'],
        'Neurologia': ['Dr. Ricardo Lima', 'Dra. Carla Vieira'],
        'Oftalmologia': ['Dr. Marcelo Oliveira', 'Dra. Carla Vieira'],
      },
      horarios: [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00'
      ],
      hoje,
      sucesso: '',
      erro: '',
      alertaChuva: false,
      previsaoClima: '',
      carregando: false,
    }
  },
  computed: {
    medicosFiltrados() {
      if (!this.form.especialidade) return []
      return this.medicosPorEspecialidade[this.form.especialidade] || []
    }
  },
  methods: {
    onEspecialidadeChange() {
      this.erros.especialidade = ''
      this.form.medico = ''
      this.erros.medico = ''
    },
    validar() {
      let ok = true
      if (!this.form.especialidade) { this.erros.especialidade = 'Selecione uma especialidade.'; ok = false }
      if (!this.form.medico) { this.erros.medico = 'Selecione um médico.'; ok = false }
      if (!this.form.data) { this.erros.data = 'Selecione uma data.'; ok = false }
      if (!this.form.hora) { this.erros.hora = 'Selecione um horário.'; ok = false }
      return ok
    },
    async agendar() {
      this.sucesso = ''
      this.erro = ''
      if (!this.validar()) return
      this.carregando = true
      try {
        const { data } = await api.post('/agendamentos', this.form)
        this.sucesso = data.mensagem
        this.alertaChuva = data.alertaChuva
        this.previsaoClima = data.previsaoClima
        this.form = { medico: '', especialidade: '', data: '', hora: '', observacoes: '' }
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (err) {
        this.erro = err.response?.data?.erro || 'Erro ao agendar. Tente novamente.'
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>