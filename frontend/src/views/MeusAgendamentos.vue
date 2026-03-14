<template>
  <div style="max-width: 700px; width: 100%;">
    <div class="card">
      <div class="card-header">
        <h2>📋 Minhas Consultas</h2>
        <p>Acompanhe seus agendamentos</p>
      </div>
      <div style="padding: 1.5rem 2rem;">

        <div v-if="carregando" class="alerta alerta-info">⏳ Carregando consultas...</div>
        <div v-else-if="erro" class="alerta alerta-erro">❌ {{ erro }}</div>

        <div v-else-if="agendamentos.length === 0" class="alerta alerta-info">
          📭 Você não tem consultas agendadas. <router-link to="/agendamento" style="color:#1a56db; font-weight:600;">Agendar agora</router-link>
        </div>

        <div v-else>
          <div v-for="a in agendamentos" :key="a._id" class="consulta-card">
            <div class="consulta-header">
              <div>
                <strong>{{ a.medico }}</strong>
                <span class="especialidade-tag">{{ a.especialidade }}</span>
              </div>
              <span class="status-badge" :class="'status-' + a.status">{{ traduzirStatus(a.status) }}</span>
            </div>
            <div class="consulta-info">
              <span>📅 {{ formatarData(a.data) }}</span>
              <span>🕐 {{ a.hora }}</span>
              <span v-if="a.alertaChuva">🌧️ Previsão de chuva!</span>
            </div>
            <div v-if="a.previsaoClima" style="font-size:0.82rem; color:#6b7280; margin-top:0.3rem;">
              🌡️ {{ a.previsaoClima }}
            </div>
            <div v-if="a.observacoes" style="font-size:0.85rem; color:#6b7280; margin-top:0.4rem;">
              📝 {{ a.observacoes }}
            </div>
            <div v-if="a.status === 'agendado'" style="margin-top:0.8rem;">
              <button class="btn-cancelar" @click="cancelar(a._id)" :disabled="cancelando === a._id">
                {{ cancelando === a._id ? 'Cancelando...' : '❌ Cancelar Consulta' }}
              </button>
            </div>
          </div>
        </div>

        <router-link to="/agendamento" style="display:block; margin-top:1rem;">
          <button type="button" class="btn-primary">📅 Nova Consulta</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js'

export default {
  name: 'MeusAgendamentos',
  data() {
    return { agendamentos: [], carregando: false, erro: '', cancelando: null }
  },
  mounted() { this.buscar() },
  methods: {
    async buscar() {
      this.carregando = true
      try {
        const { data } = await api.get('/agendamentos/meus')
        this.agendamentos = data.dados
      } catch {
        this.erro = 'Erro ao carregar agendamentos.'
      } finally {
        this.carregando = false
      }
    },
    async cancelar(id) {
      if (!confirm('Confirmar cancelamento desta consulta?')) return
      this.cancelando = id
      try {
        await api.delete(`/agendamentos/${id}`)
        await this.buscar()
      } catch (err) {
        alert(err.response?.data?.erro || 'Erro ao cancelar.')
      } finally {
        this.cancelando = null
      }
    },
    formatarData(data) {
      const [ano, mes, dia] = data.split('-')
      return `${dia}/${mes}/${ano}`
    },
    traduzirStatus(s) {
      return { agendado: 'Agendado', confirmado: 'Confirmado', cancelado: 'Cancelado', concluido: 'Concluído' }[s] || s
    }
  }
}
</script>

<style scoped>
.consulta-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  margin-bottom: 1rem;
  transition: box-shadow 0.2s;
}
.consulta-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.consulta-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
.especialidade-tag {
  display: inline-block; margin-left: 0.5rem;
  background: #dbeafe; color: #1e40af;
  padding: 0.15rem 0.6rem; border-radius: 20px; font-size: 0.78rem;
}
.consulta-info { display: flex; gap: 1.2rem; font-size: 0.88rem; color: #374151; flex-wrap: wrap; }
.status-badge {
  padding: 0.2rem 0.7rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600; white-space: nowrap;
}
.status-agendado { background: #dbeafe; color: #1e40af; }
.status-confirmado { background: #d1fae5; color: #065f46; }
.status-cancelado { background: #fee2e2; color: #991b1b; }
.status-concluido { background: #f3f4f6; color: #374151; }
.btn-cancelar {
  background: transparent; border: 1px solid #fca5a5; color: #991b1b;
  padding: 0.3rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.83rem;
  transition: background 0.2s;
}
.btn-cancelar:hover { background: #fee2e2; }
</style>
