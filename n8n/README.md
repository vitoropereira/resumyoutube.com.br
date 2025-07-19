# 🤖 N8N Automation para Resume YouTube

Este diretório contém toda a configuração de automação usando N8N para processar vídeos do YouTube automaticamente.

## 🎯 Visão Geral

O sistema N8N automatiza todo o fluxo de processamento de vídeos:

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO AUTOMATIZADO N8N                      │
├─────────────────────────────────────────────────────────────────┤
│ 1. ⏰ Trigger (5 min) → Verificar novos vídeos                │
│ 2. 🎬 YouTube API → Detectar vídeos novos                     │
│ 3. 📝 RapidAPI → Obter transcrições                           │
│ 4. 🤖 OpenAI → Gerar resumos                                  │
│ 5. 💾 Database → Salvar resumos globalmente                   │
│ 6. 📨 Criar → Notificações individuais                        │
│ 7. 📱 WhatsApp → Enviar para usuários                         │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Estrutura

```
n8n/
├── workflows/                      # Workflows do N8N
│   ├── video-processing-workflow.json     # Processamento principal
│   └── channel-monitoring-workflow.json   # Monitoramento de canais
└── README.md                     # Esta documentação
```

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

Adicione no seu `.env.local`:

```env
# N8N Configuration
N8N_API_KEY=your_secure_api_key_here
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=resumeyoutube123
```

### 2. Iniciar N8N

**Windows:**

```cmd
cd n8n
start.bat
```

**Linux/Mac:**

```bash
cd n8n
chmod +x start.sh
./start.sh
```

### 3. Configurar Workflows

1. Acesse: http://localhost:5678
2. Login: admin / resumeyoutube123
3. Importe os workflows da pasta `workflows/`
4. Configure credenciais HTTP Header Auth
5. Ative os workflows

## 🔧 Workflows Disponíveis

### 1. Video Processing Workflow

- **Arquivo**: `video-processing-workflow.json`
- **Frequência**: A cada 5 minutos
- **Função**: Processar novos vídeos e enviar notificações

**Fluxo:**

1. Schedule Trigger (5 min)
2. POST `/api/youtube/process-new-videos`
3. GET `/api/notifications/pending`
4. POST `/api/whatsapp/send-pending` (se houver pendentes)
5. Log resultados

### 2. Channel Monitoring Workflow

- **Arquivo**: `channel-monitoring-workflow.json`
- **Frequência**: A cada 10 minutos
- **Função**: Verificar novos vídeos nos canais

**Fluxo:**

1. Schedule Trigger (10 min)
2. GET `/api/youtube/channel-info`
3. Para cada canal: GET `/api/youtube/videos`
4. Log resultados

## 🧪 Testes

### 1. Teste Manual via API

```bash
# Testar processamento de vídeos
curl -X POST http://localhost:3000/api/n8n/trigger \
  -H "Content-Type: application/json" \
  -d '{"workflow": "video-processing"}'

# Testar monitoramento de canais
curl -X POST http://localhost:3000/api/n8n/trigger \
  -H "Content-Type: application/json" \
  -d '{"workflow": "channel-monitoring"}'

# Testar todos os workflows
curl -X POST http://localhost:3000/api/n8n/trigger \
  -H "Content-Type: application/json" \
  -d '{"workflow": "all"}'
```

### 2. Teste via Interface N8N

1. Acesse http://localhost:5678
2. Abra um workflow
3. Clique em "Test workflow"
4. Clique em "Execute workflow"
5. Verifique logs e resultados

## 📊 Monitoramento

### 1. Logs do N8N

```bash
# Ver logs em tempo real
docker-compose logs -f n8n

# Ver logs específicos
docker-compose logs n8n | grep ERROR
```

### 2. Status dos Workflows

- Interface web: http://localhost:5678
- Executions history
- Error logs detalhados

### 3. Métricas

- Vídeos processados por hora
- Notificações enviadas
- Tempo de execução
- Taxa de erro

## 🔐 Segurança

### Autenticação

- **Basic Auth**: Habilitado por padrão
- **API Key**: Configurado via N8N_API_KEY
- **HTTP Header Auth**: Para chamadas de API

### Recomendações

- Use HTTPS em produção
- Configure firewall para porta 5678
- Monitore logs de acesso
- Rotacione API keys regularmente

## 🚨 Troubleshooting

### Problemas Comuns

1. **N8N não inicia**

   ```bash
   # Verificar Docker
   docker info

   # Verificar logs
   docker-compose logs n8n

   # Reiniciar
   docker-compose down && docker-compose up -d
   ```

2. **APIs não respondem**

   ```bash
   # Testar aplicação
   curl http://localhost:3000/api/n8n/trigger

   # Verificar .env.local
   cat ../.env.local | grep N8N_API_KEY
   ```

3. **Workflows não executam**
   - Verificar se estão ativados
   - Verificar credenciais HTTP Header
   - Verificar schedule configuration

### Comandos Úteis

```bash
# Status dos containers
docker-compose ps

# Reiniciar N8N
docker-compose restart n8n

# Parar tudo
docker-compose down

# Limpar dados (CUIDADO!)
docker-compose down -v
```

## 📈 Performance

### Otimizações

- Workflows executam em paralelo
- Timeout configurado por endpoint
- Batch processing para notificações
- Retry automático em caso de falha

### Limites

- Máximo 20 notificações por execução
- Máximo 5 canais por verificação
- Timeout de 30s para processamento de vídeos
- Timeout de 60s para envio WhatsApp

## 🔄 Próximos Passos

1. ✅ Configurar N8N básico
2. ✅ Importar workflows
3. ✅ Testar execução manual
4. ⏳ Implementar WhatsApp API real
5. ⏳ Adicionar retry logic
6. ⏳ Implementar alertas de falha
7. ⏳ Deploy em produção

## 📞 Suporte

- **N8N Docs**: https://docs.n8n.io
- **N8N Community**: https://community.n8n.io
- **GitHub Issues**: https://github.com/n8n-io/n8n/issues

---

## 🎉 Resultado Final

Com essa configuração, o sistema ficará **100% automatizado**:

- ✅ Vídeos processados automaticamente
- ✅ Resumos gerados com IA
- ✅ Notificações enviadas via WhatsApp
- ✅ Monitoramento e logs detalhados
- ✅ Interface web para gerenciamento
- ✅ Fácil configuração e deploy
