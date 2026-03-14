#  Sistema de Atendimento Inteligente para Clínicas Médicas

Aplicação web fullstack desenvolvida com **Vue.js** (frontend) e **Node.js + Express + TypeScript** (backend), com autenticação JWT, integração com APIs externas e banco de dados MongoDB Atlas.

---

##  Funcionalidades

- Cadastro e login seguro de usuários (pacientes e secretários) com JWT
- Agendamento de consultas com verificação de conflito de horário
- Seleção de médico filtrada por especialidade
- Consulta automática de endereço pelo CEP (ViaCEP)
- Integração com API de clima (OpenWeatherMap) para alertar sobre chuva no dia da consulta
- Painel administrativo para secretários gerenciarem todos os atendimentos com filtros por status e paciente
- Proteção de rotas com middleware JWT
- Perfil de secretário criado via script de seed, sem exposição no cadastro público

---

##  Tecnologias

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Axios
- dotenv

**Frontend:**
- Vue.js 3
- Vue Router
- Axios
- Vite

**APIs Externas:**
- [ViaCEP](https://viacep.com.br) — consulta de endereço por CEP
- [OpenWeatherMap](https://openweathermap.org) — previsão do tempo

**Banco de Dados:**
- MongoDB Atlas (nuvem)

---

##  Como executar localmente

### Pré-requisitos
- Node.js 18+
- npm

### Backend
```bash
cd backend
npm install
npm run seed
npm run dev
```

O servidor inicia em `http://localhost:3000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

O frontend inicia em `http://localhost:5173`

---

##  Variáveis de Ambiente

### Backend (`backend/.env`)
```
PORT=3000
MONGODB_URI=sua_connection_string_mongodb
JWT_SECRET=sua_chave_secreta
OPENWEATHER_API_KEY=sua_chave_openweathermap
OPENWEATHER_CITY=Rio de Janeiro
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3000
```

---

##  Endpoints da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | /auth/cadastro | Cadastro de usuário | Não |
| POST | /auth/login | Login | Não |
| GET | /auth/me | Perfil do usuário | JWT |
| POST | /agendamentos | Criar agendamento | JWT |
| GET | /agendamentos/meus | Meus agendamentos | JWT |
| GET | /agendamentos | Todos (admin) | JWT + Admin |
| PATCH | /agendamentos/:id/status | Atualizar status | JWT + Admin |
| DELETE | /agendamentos/:id | Cancelar | JWT |
| GET | /cep/:cep | Buscar endereço por CEP | JWT |

---

## 👥 Perfis de Usuário

- **Paciente:** se cadastra pela tela de cadastro, agenda consultas, visualiza e cancela seus agendamentos
- **Secretário / Admin:** acesso ao painel administrativo com todos os agendamentos, pode confirmar, concluir ou cancelar qualquer consulta

### Credenciais do Secretário (para testes)

Para criar o usuário secretário no banco, execute na pasta `backend`:
```bash
npm run seed
```

Após rodar o seed, use estas credenciais para acessar o painel administrativo:

| Campo | Valor |
|-------|-------|
| E-mail | secretario@clinica.com |
| Senha | secretario123 |

---

##  Decisões de Segurança

O cadastro público permite apenas o perfil **paciente**. O perfil de secretário é criado exclusivamente via script controlado (`npm run seed`), evitando que qualquer usuário externo obtenha permissões administrativas pelo formulário de cadastro.

Como melhoria futura, recomenda-se:
- Criação de secretários exclusivamente por um administrador autenticado via painel
- Sistema de convite por e-mail para novos secretários
- Aprovação manual de contas com perfil sensível

---

##  Melhorias Futuras

**Agendamento inteligente:**
- Cadastro de médicos no banco de dados com especialidades vinculadas
- Endpoint `GET /medicos/:id/disponibilidade?data=...` que consulta agendamentos existentes e retorna apenas os horários livres
- Calendário visual bloqueando datas sem disponibilidade

**Gestão de usuários:**
- Painel para o secretário visualizar e gerenciar os pacientes cadastrados
- Edição de perfil pelo próprio paciente
- Recuperação de senha por e-mail

**Notificações:**
- Envio de e-mail de confirmação ao agendar consulta
- Lembrete automático 24h antes da consulta
- Notificação de cancelamento para o paciente

**Infraestrutura:**
- Deploy em ambiente de produção com variáveis de ambiente seguras
- Logs de auditoria para ações administrativas
- Testes automatizados com Jest

---

## Referências

ALVES, W. P. **Projetos de sistemas web**: conceitos, estruturas, criação de banco de dados e ferramentas de desenvolvimento. São Paulo: Saraiva, 2015.

FREITAS, P. H. C. et al. **Programação back end III**. Porto Alegre: Grupo A, 2021.

OLIVEIRA, C. L. V.; ZANETTI, H. A. P. **Javascript descomplicado**: programação para web, IoT e dispositivos móveis. São Paulo: Saraiva, 2020.