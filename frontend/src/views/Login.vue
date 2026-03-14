<template>
  <div style="max-width: 440px; width: 100%;">
    <div class="card">
      <div class="card-header">
        <h2>🔐 Entrar no Sistema</h2>
        <p>Clínica Digital — Área do Paciente</p>
      </div>
      <div style="padding: 2rem;">
        <div v-show="erro" class="alerta alerta-erro" style="min-height:0;">❌ {{ erro }}</div>
        <div class="campo-grupo">
          <label>E-mail <span class="obrigatorio">*</span></label>
          <input v-model.trim="form.email" type="email" placeholder="seu@email.com"
            :class="{ 'input-erro': erros.email }"
            @input="erros.email = ''" />
          <span v-if="erros.email" class="mensagem-erro">{{ erros.email }}</span>
        </div>

        <div class="campo-grupo">
          <label>Senha <span class="obrigatorio">*</span></label>
          <input v-model="form.senha" type="password" placeholder="Sua senha"
            :class="{ 'input-erro': erros.senha }"
            @input="erros.senha = ''"
            @keyup.enter="entrar" />
          <span v-if="erros.senha" class="mensagem-erro">{{ erros.senha }}</span>
        </div>

        <button class="btn-primary" @click="entrar" :disabled="carregando">
          <span v-if="carregando"><span class="spinner"></span>Entrando...</span>
          <span v-else>🔐 Entrar</span>
        </button>

        <p style="text-align:center; color:#6b7280; font-size:0.9rem;">
          Não tem conta?
          <router-link to="/cadastro" style="color:#1a56db; font-weight:600;">Cadastre-se</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js'

export default {
  name: 'Login',
  data() {
    return {
      form: { email: '', senha: '' },
      erros: { email: '', senha: '' },
      erro: '',
      carregando: false,
    }
  },
  methods: {
    validar() {
      let ok = true
      if (!this.form.email) { this.erros.email = 'E-mail obrigatório.'; ok = false }
      if (!this.form.senha) { this.erros.senha = 'Senha obrigatória.'; ok = false }
      return ok
    },
    async entrar() {
      this.erro = ''
      if (!this.validar()) return
      this.carregando = true
      try {
        const { data } = await api.post('/auth/login', this.form)
        localStorage.setItem('token', data.dados.token)
        localStorage.setItem('usuario', JSON.stringify(data.dados))
        window.dispatchEvent(new Event('auth-change'))
        const perfil = data.dados.perfil
        if (perfil === 'admin' || perfil === 'secretario') {
          this.$router.push('/painel')
        } else {
          this.$router.push('/agendamento')
        }
      } catch (err) {
        this.erro = err.response?.data?.erro || 'Erro ao fazer login. Tente novamente.'
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>
