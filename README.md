# Sistema de Relatórios CRM

Sistema completo de dashboard e relatórios integrado com CRM RD Station.

## 🚀 Deploy

### Pré-requisitos

1. **Conta no GitHub**
2. **Conta na Vercel**
3. **Token do CRM RD Station**

### Passos para Deploy

#### 1. Preparar o Repositório

```bash
# Clone ou faça fork do projeto
git clone <seu-repositorio>
cd sistema-relatorios-crm

# Instale as dependências
npm install
```

#### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# CRM Configuration
CRM_BASE_URL=https://crm.rdstation.com/api/v1
CRM_TOKEN=seu_token_do_crm_aqui
CRM_PIPELINE_ID=seu_pipeline_id_aqui

# Frontend Configuration (será atualizado após deploy)
VITE_API_BASE_URL=https://seu-app.vercel.app/api

# Production Environment
NODE_ENV=production
PORT=3001
```

#### 3. Deploy na Vercel

1. **Conecte seu repositório GitHub à Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Conecte sua conta GitHub
   - Selecione o repositório do projeto

2. **Configure as variáveis de ambiente na Vercel:**
   - Na dashboard da Vercel, vá em Settings > Environment Variables
   - Adicione todas as variáveis do arquivo `.env`:
     - `CRM_BASE_URL`
     - `CRM_TOKEN`
     - `CRM_PIPELINE_ID`
     - `NODE_ENV` = `production`

3. **Configure o domínio:**
   - Após o deploy, copie a URL gerada (ex: `https://seu-app.vercel.app`)
   - Atualize a variável `VITE_API_BASE_URL` com essa URL + `/api`

4. **Faça o deploy:**
   - A Vercel fará o deploy automaticamente
   - O frontend será servido na raiz (`/`)
   - A API será servida em (`/api/*`)

#### 4. Verificar o Deploy

1. **Teste a API:**
   ```
   GET https://seu-app.vercel.app/api/health
   ```

2. **Teste o Frontend:**
   ```
   https://seu-app.vercel.app
   ```

3. **Login de teste:**
   - Admin: `admin@company.com` / `demo123`
   - Usuário: `anaclarauniminas@gmail.com` / `demo123`

### 🔧 Estrutura do Deploy

```
Vercel Deploy:
├── Frontend (React + Vite) → servido na raiz "/"
├── API (Express.js) → servido em "/api/*"
├── Cache em memória → funciona em serverless
└── Integração CRM → via variáveis de ambiente
```

### 📊 Funcionalidades

- ✅ **Dashboard Admin**: KPIs, consultores, campanhas
- ✅ **Dashboard Usuário**: Performance individual
- ✅ **Filtros avançados**: Por período, consultor, campanha
- ✅ **Cache inteligente**: Performance otimizada
- ✅ **Integração CRM**: Dados em tempo real
- ✅ **Responsivo**: Funciona em mobile e desktop

### 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Deploy**: Vercel (Serverless)
- **Integração**: RD Station CRM API
- **Cache**: Sistema em memória otimizado

### 📝 Notas Importantes

1. **Serverless**: O backend roda em funções serverless na Vercel
2. **Cache**: Sistema de cache otimizado para ambiente serverless
3. **CORS**: Configurado para produção
4. **Variáveis**: Todas as configurações via environment variables
5. **Logs**: Disponíveis na dashboard da Vercel

### 🔒 Segurança

- ✅ Tokens CRM via variáveis de ambiente
- ✅ CORS configurado para domínio específico
- ✅ Validação de entrada em todas as APIs
- ✅ Rate limiting implícito via Vercel
- ✅ HTTPS automático via Vercel

### 📞 Suporte

Se encontrar problemas no deploy:

1. Verifique os logs na dashboard da Vercel
2. Confirme se todas as variáveis de ambiente estão configuradas
3. Teste a API de health check primeiro
4. Verifique se o token do CRM está válido