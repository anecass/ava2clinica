<template>
  <div style="max-width: 500px; width: 100%;">
    <div class="card">
      <div class="card-header">
        <h2>📋 Criar Conta</h2>
        <p>Preencha seus dados para se cadastrar</p>
      </div>
      <div style="padding: 2rem;">

        <div v-if="erro" class="alerta alerta-erro">❌ {{ erro }}</div>
        <div v-if="sucesso" class="alerta alerta-sucesso">✅ {{ sucesso }}</div>

        <div class="campo-grupo">
          <label>Nome Completo <span class="obrigatorio">*</span></label>
          <input v-model.trim="form.nome" type="text" placeholder="Seu nome completo"
            :class="{ 'input-erro': erros.nome }" @input="erros.nome = ''" />
          <span v-if="erros.nome" class="mensagem-erro">{{ erros.nome }}</span>
        </div>

        <div class="campo-grupo">
          <label>E-mail <span class="obrigatorio">*</span></label>
          <input v-model.trim="form.email" type="email" placeholder="seu@email.com"
            :class="{ 'input-erro': erros.email }" @input="erros.email = ''" />
          <span v-if="erros.email" class="mensagem-erro">{{ erros.email }}</span>
        </div>

        <div class="campo-grupo">
          <label>Senha <span class="obrigatorio">*</span></label>
          <input v-model="form.senha" type="password" placeholder="Mínimo 6 caracteres"
            :class="{ 'input-erro': erros.senha }" @input="erros.senha = ''" />
          <span v-if="erros.senha" class="mensagem-erro">{{ erros.senha }}</span>
        </div>

        <div class="campo-grupo">
          <label>Telefone</label>
          <input v-model.trim="form.telefone" type="tel" placeholder="(21) 99999-9999" />
        </div>

        <div class="campo-grupo">
          <label>CEP</label>
          <div style="display:flex; gap:0.5rem;">
            <input v-model.trim="form.cep" type="text" placeholder="00000-000"
              maxlength="9" style="flex:1"
              @blur="buscarCep" @input="form.cep = mascararCep($event.target.value)" />
            <button type="button" class="btn-secondary" style="width:auto; padding:0 1rem;"
              @click="buscarCep" :disabled="buscandoCep">
              {{ buscandoCep ? '...' : '🔍' }}
            </button>
          </div>
        </div>

        <div v-if="endereco" class="alerta alerta-info" style="margin-bottom:1rem;">
          📍 {{ endereco.logradouro }}, {{ endereco.bairro }} — {{ endereco.cidade }}/{{ endereco.estado }}
        </div>

        <button class="btn-primary" @click="cadastrar" :disabled="carregando">
          <span v-if="carregando"><span class="spinner"></span>Cadastrando...</span>
          <span v-else>📋 Criar Conta</span>
        </button>

        <p style="text-align:center; color:#6b7280; font-size:0.9rem;">
          Já tem conta?
          <router-link to="/login" style="color:#1a56db; font-weight:600;">Entrar</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js'

export default {
  name: 'Cadastro',
  data() {
    return {
      form: { nome: '', email: '', senha: '', telefone: '', cep: '' },
      erros: { nome: '', email: '', senha: '' },
      endereco: null,
      buscandoCep: false,
      erro: '',
      sucesso: '',
      carregando: false,
    }
  },
  methods: {
    mascararCep(v) {
      return v.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9)
    },
     async buscarCep() {
       const cep = this.form.cep.replace(/\D/g, '')
       if (cep.length !== 8) return
       this.buscandoCep = true
       this.endereco = null
       try {
         const data = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then(r => r.json())
         if (data.erro) return
         this.endereco = {
           logradouro: data.logradouro,
           bairro: data.bairro,
           cidade: data.localidade,
           estado: data.uf
      } 
  } catch {
    // CEP não encontrado, ignora
  } finally {
    this.buscandoCep = false
  }
},
    validar() {
      let ok = true
      if (!this.form.nome || this.form.nome.length < 3) { this.erros.nome = 'Nome deve ter pelo menos 3 caracteres.'; ok = false }
      if (!this.form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) { this.erros.email = 'E-mail inválido.'; ok = false }
      if (!this.form.senha || this.form.senha.length < 6) { this.erros.senha = 'Senha deve ter pelo menos 6 caracteres.'; ok = false }
      return ok
    },
    async cadastrar() {
      this.erro = ''
      this.sucesso = ''
      if (!this.validar()) return
      this.carregando = true
      try {
        const { data } = await api.post('/auth/cadastro', this.form)
        localStorage.setItem('token', data.dados.token)
        localStorage.setItem('usuario', JSON.stringify(data.dados))
        window.dispatchEvent(new Event('auth-change'))
        this.$router.push('/agendamento')
      } catch (err) {
        this.erro = err.response?.data?.erro || 'Erro ao cadastrar. Tente novamente.'
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>
