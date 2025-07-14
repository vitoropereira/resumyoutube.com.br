# TODO - Resume YouTube MVP

## 🎯 Essencial para MVP (Mínimo Viável)

### ✅ Concluído
- [x] Autenticação (email/senha + social login)
- [x] Dashboard principal
- [x] Gerenciamento de canais (adicionar/remover)
- [x] Estrutura do banco de dados
- [x] Layout responsivo

### 🚧 Em Desenvolvimento

#### 1. **Sistema de Resumos** (CRÍTICO)
- [ ] Página de listagem de resumos
- [ ] Integração com YouTube Data API v3
- [ ] Geração de resumos com IA (OpenAI/Claude)
- [ ] Sistema de processamento em background

#### 2. **Integração WhatsApp** (CRÍTICO)
- [ ] API do WhatsApp Business
- [ ] Envio automático de resumos
- [ ] Configuração do número do usuário

#### 3. **Sistema de Pagamento** (CRÍTICO)
- [ ] Integração com Stripe (R$ 39,90/mês)
- [ ] Webhook de pagamento
- [ ] Upgrade/downgrade de planos
- [ ] Controle de limite de canais

### 🔧 Testes Essenciais

#### Fluxo Principal
- [ ] Cadastrar usuário → adicionar canal → receber resumo no WhatsApp
- [ ] Testar limite de 3 canais (usuário free)
- [ ] Testar upgrade para premium (canais ilimitados)
- [ ] Verificar processamento de novos vídeos

#### Integrações
- [ ] YouTube API: buscar vídeos novos
- [ ] OpenAI/Claude: gerar resumos
- [ ] WhatsApp: enviar mensagens
- [ ] Stripe: processar pagamentos

### ⚡ Deploy e Produção

#### Configuração
- [ ] Variáveis de ambiente produção
- [ ] SSL/HTTPS
- [ ] Domínio personalizado
- [ ] Backup do banco de dados

#### Monitoramento
- [ ] Logs de erro
- [ ] Métricas de uso
- [ ] Health checks

---

## 🔄 MIGRAÇÃO CRÍTICA - Database Schema (EM ANDAMENTO)

### **CONTEXTO**
Migração da estrutura legacy para estrutura global otimizada:
- ❌ **ANTES**: Resumos duplicados por usuário (desperdício 75%+ OpenAI)
- ✅ **AGORA**: 1 resumo por vídeo + transcrições + economia massiva

### **PASSO 1: Preparar Base**
- [ ] 1.1 Atualizar `database.types.ts` - Adicionar tipos das novas tabelas
- [ ] 1.2 Atualizar `types.ts` - Criar tipos para estrutura global
- [ ] 1.3 Testar conexão com banco - Garantir que novas tabelas existem

### **PASSO 2: Migrar APIs (Backend)**
- [ ] 2.1 Migrar `/api/channels/route.ts` - Usar `global_youtube_channels` + `user_channel_subscriptions`
- [ ] 2.2 Migrar `/api/channels/[id]/route.ts` - Atualizar para estrutura global
- [ ] 2.3 Migrar `/api/processed-videos/route.ts` - Usar `global_processed_videos` + `user_video_notifications`
- [ ] 2.4 Migrar `/api/processed-videos/stats/route.ts` - Atualizar estatísticas
- [ ] 2.5 Migrar `/api/youtube/process-new-videos/route.ts` - Usar `process_global_video()`

### **PASSO 3: Migrar Componentes (Frontend)**
- [ ] 3.1 Migrar `add-channel-form.tsx` - Usar `can_add_global_channel()`
- [ ] 3.2 Migrar `channel-list.tsx` - Adaptar para nova estrutura
- [ ] 3.3 Migrar `summary-list.tsx` - Usar novos campos

### **PASSO 4: Migrar Páginas (Dashboard)**
- [ ] 4.1 Migrar `/dashboard/page.tsx` - Atualizar estatísticas
- [ ] 4.2 Migrar `/dashboard/channels/page.tsx` - Listar canais globais
- [ ] 4.3 Migrar `/dashboard/summaries/page.tsx` - Usar nova estrutura
- [ ] 4.4 Migrar `/dashboard/billing/page.tsx` - Calcular uso correto

### **PASSO 5: Limpeza Final**
- [ ] 5.1 Remover código legacy - Deletar tabelas/funções antigas
- [ ] 5.2 Atualizar documentação - CLAUDE.md, CONTINUE.md
- [ ] 5.3 Testar tudo - Garantir funcionalidade completa

### **ARQUIVOS IMPACTADOS** (15 total)
- **APIs**: `/api/channels/*`, `/api/processed-videos/*`, `/api/youtube/*`
- **Páginas**: `/dashboard/page.tsx`, `/dashboard/channels/*`, `/dashboard/summaries/*`, `/dashboard/billing/*`
- **Componentes**: `add-channel-form.tsx`, `channel-list.tsx`, `summary-list.tsx`
- **Tipos**: `types.ts`, `database.types.ts`

---

## 📝 Funcionalidades Futuras (Pós-MVP)

- [ ] Personalização de resumos
- [ ] Múltiplos idiomas
- [ ] Analytics de canais
- [ ] Integração com Telegram
- [ ] App mobile
- [ ] Resumos por categoria/tópico

---

## 🎯 Definição de "Pronto para MVP"

**O produto está pronto quando:**
1. Usuário pode se cadastrar e pagar
2. Usuário pode adicionar canais do YouTube
3. Sistema detecta vídeos novos automaticamente
4. IA gera resumos inteligentes
5. Resumos são enviados via WhatsApp
6. Billing funciona (upgrade/downgrade)

**Tempo estimado:** 2-3 semanas