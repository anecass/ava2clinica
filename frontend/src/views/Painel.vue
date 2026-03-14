<template>
  <div style="max-width: 900px; width: 100%;">
    <div class="card">
      <div class="card-header">
        <h2>🏥 Painel Administrativo</h2>
        <p>Gerenciamento de todos os atendimentos</p>
      </div>
      <div style="padding: 1.5rem 2rem;">

        <!-- Filtros -->
        <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap;">
          <select v-model="filtroStatus" style="flex:1; min-width:150px;">
            <option value="">Todos os status</option>
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
            <option value="concluido">Concluído</option>
          </select>
          <input v-model="filtroPaciente" type="text" placeholder="Buscar por paciente..."
            style="flex:2; min-width:200px;" />
        </div>

        <!-- Resumo -->
        <div class="resumo-grid">
          <div class="resumo-card azul">
            <div class="resumo-num">{{ total }}</div>
            <div class="resumo-label">Total</div>
          </div>
          <div class="resumo-card verde">
            <div class="resumo-num">{{ contarStatus('agendado') + contarStatus('confirmado') }}</div>
            <div class="resumo-label">Ativos</div>
          </div>
          <div class="resumo-card vermelho">
            <div class="resumo-num">{{ contarStatus('cancelado') }}</div>
            <div class="resumo-label">Cancelados</div>
          </div>
          <div class="resumo-card cinza">
            <div class="resumo-num">{{ contarStatus('concluido') }}</div>
            <div class="resumo-label">Concluídos</div>
          </div>
        </div>

        <div v-if="carregando" class="alerta alerta-info">⏳ Carregando...</div>
        <div v-else-if="erro" class="alerta alerta-erro">❌ {{ erro }}</div>

        <div v-else-if="agendamentosFiltrados.length === 0" class="alerta alerta-info">
          📭 Nenhum agendamento encontrado.
        </div>

        <div v-else>
          <div v-for="a in agendamentosFiltrados" :key="a._id" class="admin-card">
            <div class="admin-card-header">
              <div>
                <strong>{{ a.pacienteNome }}</strong>
                <span style="color:#6b7280; font-size:0.85rem; margin-left:0.5rem;">→ {{ a.medico }}</span>
              </div>
              <span class="status-badge" :class="'status-' + a.status">{{ traduzirStatus(a.status) }}</span>
            </div>
            <div class="admin-card-info">
              <span>🏥 {{ a.especialidade }}</span>
              <span>📅 {{ formatarData(a.data) }}</span>
              <span>🕐 {{ a.hora }}</span>
              <span v-if="a.alertaChuva">🌧️ Chuva prevista</span>
            </div>
            <div v-if="a.observacoes" style="font-size:0.83rem; color:#6b7280; margin-top:0.3rem;">
              📝 {{ a.observacoes }}
            </div>
            <!-- Ações de status -->
            <div class="admin-acoes" v-if="a.status !== 'cancelado' && a.status !== 'concluido'">
              <button v-if="a.status === 'agendado'" class="btn-acao btn-confirmar"
                @click="mudarStatus(a._id, 'confirmado')">✅ Confirmar</button>
              <button v-if="a.status === 'confirmado'" class="btn-acao btn-concluir"
                @click="mudarStatus(a._id, 'concluido')">🏁 Concluir</button>
              <button class="btn-acao btn-cancelar-admin"
                @click="mudarStatus(a._id, 'cancelado')">❌ Cancelar</button>
            </div>
          </div>
        </div>

        <button class="btn-secondary" style="margin-top:1rem;" @click="buscar">🔄 Atualizar</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js'

export default {
  name: 'Painel',
  data() {
    return {
      agendamentos: [],
      filtroStatus: '',
      filtroPaciente: '',
      carregando: false,
      erro: '',
    }
  },
  computed: {
    agendamentosFiltrados() {
      return this.agendamentos.filter(a => {
        const statusOk = !this.filtroStatus || a.status === this.filtroStatus
        const pacienteOk = !this.filtroPaciente ||
          a.pacienteNome.toLowerCase().includes(this.filtroPaciente.toLowerCase())
        return statusOk && pacienteOk
      })
    },
    total() { return this.agendamentos.length }
  },
  mounted() { this.buscar() },
  methods: {
    async buscar() {
      this.carregando = true
      try {
        const { data } = await api.get('/agendamentos')
        this.agendamentos = data.dados
      } catch {
        this.erro = 'Erro ao carregar agendamentos.'
      } finally {
        this.carregando = false
      }
    },
    async mudarStatus(id, status) {
      try {
        await api.patch(`/agendamentos/${id}/status`, { status })
        await this.buscar()
      } catch (err) {
        alert(err.response?.data?.erro || 'Erro ao atualizar status.')
      }
    },
    contarStatus(s) { return this.agendamentos.filter(a => a.status === s).length },
    formatarData(d) {
      const [ano, mes, dia] = d.split('-')
      return `${dia}/${mes}/${ano}`
    },
    traduzirStatus(s) {
      return { agendado: 'Agendado', confirmado: 'Confirmado', cancelado: 'Cancelado', concluido: 'Concluído' }[s] || s
    }
  }
}
</script>

<style scoped>
.resumo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.resumo-card { text-align: center; padding: 1rem; border-radius: 10px; }
.resumo-num { font-size: 1.8rem; font-weight: 700; }
.resumo-label { font-size: 0.8rem; margin-top: 0.2rem; }
.resumo-card.azul { background: #dbeafe; color: #1e40af; }
.resumo-card.verde { background: #d1fae5; color: #065f46; }
.resumo-card.vermelho { background: #fee2e2; color: #991b1b; }
.resumo-card.cinza { background: #f3f4f6; color: #374151; }
.admin-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem 1.2rem; margin-bottom: 0.8rem; }
.admin-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
.admin-card-info { display: flex; gap: 1rem; font-size: 0.85rem; color: #374151; flex-wrap: wrap; }
.status-badge { padding: 0.2rem 0.7rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.status-agendado { background: #dbeafe; color: #1e40af; }
.status-confirmado { background: #d1fae5; color: #065f46; }
.status-cancelado { background: #fee2e2; color: #991b1b; }
.status-concluido { background: #f3f4f6; color: #374151; }
.admin-acoes { display: flex; gap: 0.5rem; margin-top: 0.7rem; flex-wrap: wrap; }
.btn-acao { padding: 0.3rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.82rem; border: 1px solid; transition: opacity 0.2s; }
.btn-acao:hover { opacity: 0.8; }
.btn-confirmar { background: #d1fae5; border-color: #6ee7b7; color: #065f46; }
.btn-concluir { background: #e0e7ff; border-color: #a5b4fc; color: #3730a3; }
.btn-cancelar-admin { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }
@media (max-width: 500px) { .resumo-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
