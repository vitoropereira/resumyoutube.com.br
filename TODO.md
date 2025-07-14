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