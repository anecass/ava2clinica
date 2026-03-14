<template>
  <div id="app">
    <nav v-if="usuario" class="navbar">
      <div class="nav-brand">🏥 Clínica Digital</div>
      <div class="nav-links">
        <router-link to="/agendamento">Agendar</router-link>
        <router-link to="/meus-agendamentos">Minhas Consultas</router-link>
        <router-link v-if="isAdmin" to="/painel">Painel Admin</router-link>
        <span class="nav-user">{{ usuario.nome }}</span>
        <button class="btn-sair" @click="sair">Sair</button>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return { usuario: null }
  },
  computed: {
    isAdmin() {
      return this.usuario?.perfil === 'secretario' || this.usuario?.perfil === 'admin'
    }
  },
  mounted() {
    this.carregarUsuario()
    window.addEventListener('storage', this.carregarUsuario)
    window.addEventListener('auth-change', this.carregarUsuario)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.carregarUsuario)
    window.removeEventListener('auth-change', this.carregarUsuario)
  },
  methods: {
    carregarUsuario() {
      const u = localStorage.getItem('usuario')
      this.usuario = u ? JSON.parse(u) : null
    },
    sair() {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      this.usuario = null
      this.$router.push('/login')
    }
  }
}
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #f0f4f8;
  color: #1a202c;
  min-height: 100vh;
}

.navbar {
  background: linear-gradient(135deg, #1a56db, #0e9f6e);
  color: white;
  padding: 0 2rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.nav-brand { font-size: 1.2rem; font-weight: 700; }

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.nav-links a {
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: rgba(255,255,255,0.2);
  color: white;
}

.nav-user {
  font-size: 0.85rem;
  opacity: 0.85;
  border-left: 1px solid rgba(255,255,255,0.3);
  padding-left: 1rem;
}

.btn-sair {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.btn-sair:hover { background: rgba(255,255,255,0.25); }

.main-content {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
}

/* Componentes reutilizáveis globais */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  width: 100%;
}

.card-header {
  background: linear-gradient(135deg, #1a56db, #0e9f6e);
  color: white;
  padding: 1.5rem 2rem;
}

.card-header h2 { font-size: 1.4rem; margin-bottom: 0.3rem; }
.card-header p { opacity: 0.9; font-size: 0.9rem; }

.campo-grupo { margin-bottom: 1.2rem; }

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #374151;
  font-size: 0.9rem;
}

.obrigatorio { color: #ef4444; }

input, select, textarea {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  outline: none;
  background: white;
}

input:focus, select:focus, textarea:focus {
  border-color: #1a56db;
  box-shadow: 0 0 0 3px rgba(26,86,219,0.12);
}

.input-erro { border-color: #ef4444 !important; background: #fef2f2; }
.input-valido { border-color: #10b981 !important; background: #f0fdf4; }

.mensagem-erro { display: block; color: #ef4444; font-size: 0.82rem; margin-top: 0.3rem; }

.alerta {
  padding: 0.9rem 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.2rem;
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.alerta-sucesso { background: #d1fae5; border: 1px solid #6ee7b7; color: #065f46; }
.alerta-erro { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; }
.alerta-aviso { background: #fef3c7; border: 1px solid #fde68a; color: #92400e; }
.alerta-info { background: #dbeafe; border: 1px solid #93c5fd; color: #1e40af; }

.btn-primary {
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(135deg, #1a56db, #0e9f6e);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  margin-bottom: 0.75rem;
}

.btn-primary:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

.btn-secondary {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  color: #6b7280;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover { border-color: #9ca3af; color: #374151; background: #f9fafb; }

.spinner {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 480px) {
  .navbar { padding: 0 1rem; }
  .nav-links { gap: 0.6rem; }
  .nav-links a { font-size: 0.8rem; }
}
</style>
