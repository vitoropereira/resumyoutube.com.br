-- =====================================================
-- BOT YOUTUBE - SCHEMA COMPLETO
-- Projeto: elvascbrrxmptiooybxw
-- Estrutura: Híbrida (Legacy + Global Otimizada)
-- Data: 2025-07-14
-- =====================================================

-- =====================================================
-- EXTENSÕES NECESSÁRIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE, -- WhatsApp number
    name VARCHAR(255),
    email VARCHAR(255),
    subscription_status VARCHAR(20) DEFAULT 'inactive' 
        CHECK (subscription_status IN ('active', 'inactive', 'expired', 'trialing')),
    subscription_id VARCHAR(255), -- Stripe subscription ID
    max_channels INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE users IS 'Usuários cadastrados no bot YouTube';
COMMENT ON COLUMN users.phone_number IS 'Número WhatsApp formato: +5511999999999';
COMMENT ON COLUMN users.subscription_status IS 'Status da assinatura Stripe';
COMMENT ON COLUMN users.max_channels IS 'Limite de canais por usuário (padrão: 3)';

-- =====================================================
-- 2. TABELA DE ASSINATURAS (STRIPE)
-- =====================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'incomplete' 
        CHECK (status IN ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
    plan_name VARCHAR(50) DEFAULT 'basic',
    amount_cents INTEGER DEFAULT 3990, -- R$ 39,90/mês
    currency VARCHAR(3) DEFAULT 'BRL',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE subscriptions IS 'Assinaturas e pagamentos via Stripe';
COMMENT ON COLUMN subscriptions.amount_cents IS 'Valor em centavos (3990 = R$ 39,90)';

-- =====================================================
-- 3. TABELA DE CONFIGURAÇÕES DO SISTEMA
-- =====================================================
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE system_settings IS 'Configurações gerais do sistema';

-- Inserir configurações padrão
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('bot_name', 'Bot YouTube', 'Nome do bot'),
('check_interval_minutes', '60', 'Intervalo de verificação de novos vídeos'),
('max_channels_per_user', '3', 'Máximo de canais por usuário'),
('subscription_price_cents', '3990', 'Preço da assinatura em centavos (R$ 39,90)'),
('summary_max_tokens', '400', 'Máximo de tokens para resumos'),
('rate_limit_per_hour', '100', 'Limite de requisições por hora por usuário'),
('openai_api_key', '', 'Chave da API do OpenAI para resumos'),
('youtube_api_key', '', 'Chave da API do YouTube Data v3'),
('uaizap_api_key', '', 'Chave da API do uaizap para WhatsApp'),
('stripe_secret_key', '', 'Chave secreta do Stripe'),
('stripe_webhook_secret', '', 'Secret do webhook do Stripe'),
('support_phone', '', 'Telefone de suporte');

-- =====================================================
-- 4. LOGS DE CONVERSAS
-- =====================================================
CREATE TABLE conversation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(50) NOT NULL, -- 'user_message', 'bot_response', 'system'
    message_content TEXT,
    context VARCHAR(100), -- 'add_channel', 'list_channels', 'status', etc.
    metadata JSONB, -- Dados extras em JSON
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE conversation_logs IS 'Logs de todas as interações do bot';
COMMENT ON COLUMN conversation_logs.message_type IS 'Tipo: user_message, bot_response, system';
COMMENT ON COLUMN conversation_logs.context IS 'Contexto da mensagem para analytics';

-- =====================================================
-- 5. ESTRUTURA GLOBAL OTIMIZADA (NOVA)
-- =====================================================

-- 5.1 CANAIS GLOBAIS (SEM DUPLICAÇÃO)
CREATE TABLE global_youtube_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_channel_id VARCHAR(255) UNIQUE NOT NULL, -- UCxxx... (ID único do YouTube)
    channel_name VARCHAR(500) NOT NULL,
    channel_url VARCHAR(500) NOT NULL,
    channel_description TEXT,
    subscriber_count INTEGER,
    video_count INTEGER,
    last_video_id VARCHAR(255), -- Último vídeo processado
    last_check_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE global_youtube_channels IS 'Canais únicos globalmente - elimina duplicação';
COMMENT ON COLUMN global_youtube_channels.youtube_channel_id IS 'ID único do canal no YouTube (UCxxx...)';
COMMENT ON COLUMN global_youtube_channels.last_video_id IS 'Controle de novos vídeos';

-- 5.2 RELACIONAMENTO USUÁRIO ↔ CANAL
CREATE TABLE user_channel_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    global_channel_id UUID REFERENCES global_youtube_channels(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, global_channel_id) -- Evita inscrições duplicadas
);

COMMENT ON TABLE user_channel_subscriptions IS 'Relacionamento usuário ↔ canal (N:N)';
COMMENT ON COLUMN user_channel_subscriptions.is_active IS 'Controla se a inscrição está ativa';

-- 5.3 VÍDEOS PROCESSADOS GLOBALMENTE (1 RESUMO POR VÍDEO)
CREATE TABLE global_processed_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_channel_id UUID REFERENCES global_youtube_channels(id) ON DELETE CASCADE,
    video_id VARCHAR(255) UNIQUE NOT NULL, -- ID único do vídeo no YouTube
    video_title VARCHAR(500) NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    video_description TEXT,
    transcript TEXT, -- Transcrição do áudio/vídeo
    summary TEXT, -- Resumo único para TODOS os usuários
    video_duration VARCHAR(20), -- Ex: "PT15M33S"
    published_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE global_processed_videos IS 'Vídeos únicos com resumos reutilizáveis';
COMMENT ON COLUMN global_processed_videos.video_id IS 'ID único do vídeo no YouTube';
COMMENT ON COLUMN global_processed_videos.transcript IS 'Transcrição para resumos de qualidade';
COMMENT ON COLUMN global_processed_videos.summary IS 'Resumo único reutilizado por todos os usuários';

-- 5.4 CONTROLE DE NOTIFICAÇÕES POR USUÁRIO
CREATE TABLE user_video_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    global_video_id UUID REFERENCES global_processed_videos(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ,
    is_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, global_video_id) -- Evita notificações duplicadas
);

COMMENT ON TABLE user_video_notifications IS 'Controle individual de envio por usuário';
COMMENT ON COLUMN user_video_notifications.is_sent IS 'Se a notificação foi enviada via WhatsApp';


-- =====================================================
-- 7. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para buscas frequentes
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

CREATE INDEX idx_global_channels_youtube_id ON global_youtube_channels(youtube_channel_id);
CREATE INDEX idx_global_channels_active ON global_youtube_channels(is_active);
CREATE INDEX idx_global_channels_last_check ON global_youtube_channels(last_check_at);

CREATE INDEX idx_user_subscriptions_user ON user_channel_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_channel ON user_channel_subscriptions(global_channel_id);
CREATE INDEX idx_user_subscriptions_active ON user_channel_subscriptions(is_active);

CREATE INDEX idx_global_videos_channel ON global_processed_videos(global_channel_id);
CREATE INDEX idx_global_videos_published ON global_processed_videos(published_at);
CREATE INDEX idx_global_videos_processed ON global_processed_videos(processed_at);

CREATE INDEX idx_notifications_user ON user_video_notifications(user_id);
CREATE INDEX idx_notifications_sent ON user_video_notifications(is_sent);
CREATE INDEX idx_notifications_sent_at ON user_video_notifications(sent_at);

CREATE INDEX idx_conversation_logs_user ON conversation_logs(user_id);
CREATE INDEX idx_conversation_logs_type ON conversation_logs(message_type);
CREATE INDEX idx_conversation_logs_created ON conversation_logs(created_at);

-- =====================================================
-- 8. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_channels_updated_at BEFORE UPDATE ON global_youtube_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- 9. FUNÇÕES PRINCIPAIS (ATUALIZADAS)
-- =====================================================

-- 9.1 Verificar se usuário pode adicionar canal (GLOBAL)
CREATE OR REPLACE FUNCTION can_add_global_channel(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM user_channel_subscriptions 
        WHERE user_id = user_uuid AND is_active = true
    ) < (
        SELECT COALESCE(max_channels, 3) FROM users WHERE id = user_uuid
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_add_global_channel IS 'Verifica se usuário pode adicionar mais canais (estrutura global)';

-- 9.2 Obter canais para verificação (GLOBAL)
CREATE OR REPLACE FUNCTION get_global_channels_to_check(check_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    channel_uuid UUID,
    youtube_channel_id VARCHAR,
    channel_name VARCHAR,
    last_video_id VARCHAR,
    last_check_at TIMESTAMPTZ,
    subscriber_count INTEGER,
    total_users INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gyc.id,
        gyc.youtube_channel_id,
        gyc.channel_name,
        gyc.last_video_id,
        gyc.last_check_at,
        gyc.subscriber_count,
        COUNT(ucs.user_id)::INTEGER as total_users
    FROM global_youtube_channels gyc
    JOIN user_channel_subscriptions ucs ON gyc.id = ucs.global_channel_id
    WHERE gyc.is_active = true 
      AND ucs.is_active = true
    GROUP BY gyc.id, gyc.youtube_channel_id, gyc.channel_name, gyc.last_video_id, gyc.last_check_at, gyc.subscriber_count
    ORDER BY gyc.last_check_at ASC
    LIMIT check_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_global_channels_to_check IS 'Retorna canais globais para monitoramento';

-- 9.3 Processar novo vídeo globalmente
CREATE OR REPLACE FUNCTION process_global_video(
    channel_uuid UUID,
    video_id VARCHAR,
    video_title VARCHAR,
    video_url VARCHAR,
    video_description TEXT DEFAULT NULL,
    transcript_text TEXT DEFAULT NULL,
    summary_text TEXT DEFAULT NULL,
    video_duration VARCHAR DEFAULT NULL,
    published_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    global_video_uuid UUID;
    user_record RECORD;
BEGIN
    -- Inserir vídeo na tabela global
    INSERT INTO global_processed_videos (
        global_channel_id, video_id, video_title, video_url, 
        video_description, transcript, summary, video_duration, published_at
    ) VALUES (
        channel_uuid, video_id, video_title, video_url,
        video_description, transcript_text, summary_text, video_duration, published_at
    ) RETURNING id INTO global_video_uuid;

    -- Criar notificações para todos os usuários do canal
    INSERT INTO user_video_notifications (user_id, global_video_id)
    SELECT ucs.user_id, global_video_uuid
    FROM user_channel_subscriptions ucs
    WHERE ucs.global_channel_id = channel_uuid 
      AND ucs.is_active = true;

    -- Atualizar último vídeo do canal
    UPDATE global_youtube_channels 
    SET last_video_id = video_id, last_check_at = now()
    WHERE id = channel_uuid;

    RETURN global_video_uuid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_global_video IS 'Processa novo vídeo e cria notificações para todos os usuários';

-- 9.4 Obter status completo do usuário (ATUALIZADA)
CREATE OR REPLACE FUNCTION get_user_status(phone VARCHAR)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'user_info', json_build_object(
            'id', u.id,
            'phone_number', u.phone_number,
            'name', u.name,
            'email', u.email,
            'created_at', u.created_at
        ),
        'subscription', json_build_object(
            'status', u.subscription_status,
            'subscription_id', u.subscription_id,
            'max_channels', u.max_channels
        ),
        'channels_global', (
            SELECT COALESCE(json_agg(json_build_object(
                'id', gyc.id,
                'youtube_channel_id', gyc.youtube_channel_id,
                'name', gyc.channel_name,
                'url', gyc.channel_url,
                'subscriber_count', gyc.subscriber_count,
                'subscribed_at', ucs.subscribed_at,
                'is_active', ucs.is_active
            )), '[]'::json)
            FROM user_channel_subscriptions ucs
            JOIN global_youtube_channels gyc ON ucs.global_channel_id = gyc.id
            WHERE ucs.user_id = u.id AND ucs.is_active = true
        ),
        'stats', json_build_object(
            'total_global_channels', (
                SELECT COUNT(*) FROM user_channel_subscriptions ucs 
                WHERE ucs.user_id = u.id AND ucs.is_active = true
            ),
            'pending_notifications', (
                SELECT COUNT(*) FROM user_video_notifications uvn 
                WHERE uvn.user_id = u.id AND uvn.is_sent = false
            ),
            'total_received_videos', (
                SELECT COUNT(*) FROM user_video_notifications uvn 
                WHERE uvn.user_id = u.id AND uvn.is_sent = true
            )
        )
    ) INTO result
    FROM users u
    WHERE u.phone_number = phone;
    
    RETURN COALESCE(result, '{"error": "user_not_found"}'::json);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_status IS 'Retorna status completo do usuário incluindo estrutura global e legacy';

-- 9.5 Limpeza de logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM conversation_logs 
    WHERE created_at < now() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_logs IS 'Remove logs de conversas com mais de 30 dias';

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Ativar RLS nas tabelas sensíveis
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_channel_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_video_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (podem ser refinadas conforme necessário)
-- Usuários só veem seus próprios dados
CREATE POLICY "Users can view own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own logs" ON conversation_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own channel subscriptions" ON user_channel_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON user_video_notifications FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 11. VIEWS ÚTEIS PARA ANALYTICS
-- =====================================================

-- View: Estatísticas gerais do sistema
CREATE OR REPLACE VIEW system_stats AS
SELECT 
    'Total Users' as metric,
    COUNT(*)::TEXT as value
FROM users
UNION ALL
SELECT 
    'Active Subscriptions',
    COUNT(*)::TEXT
FROM users WHERE subscription_status = 'active'
UNION ALL
SELECT 
    'Global Channels',
    COUNT(*)::TEXT
FROM global_youtube_channels
UNION ALL
SELECT 
    'Total Subscriptions',
    COUNT(*)::TEXT
FROM user_channel_subscriptions WHERE is_active = true
UNION ALL
SELECT 
    'Processed Videos',
    COUNT(*)::TEXT
FROM global_processed_videos
UNION ALL
SELECT 
    'Pending Notifications',
    COUNT(*)::TEXT
FROM user_video_notifications WHERE is_sent = false;

-- View: Canais mais populares
CREATE OR REPLACE VIEW popular_channels AS
SELECT 
    gyc.youtube_channel_id,
    gyc.channel_name,
    gyc.subscriber_count,
    COUNT(ucs.user_id) as followers,
    COUNT(gpv.id) as processed_videos,
    gyc.last_check_at
FROM global_youtube_channels gyc
LEFT JOIN user_channel_subscriptions ucs ON gyc.id = ucs.global_channel_id AND ucs.is_active = true
LEFT JOIN global_processed_videos gpv ON gyc.id = gpv.global_channel_id
GROUP BY gyc.id, gyc.youtube_channel_id, gyc.channel_name, gyc.subscriber_count, gyc.last_check_at
ORDER BY followers DESC, gyc.subscriber_count DESC;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

/*
RESUMO DA ESTRUTURA:

TABELAS PRINCIPAIS:
- users: Usuários do bot
- subscriptions: Pagamentos Stripe
- system_settings: Configurações gerais

ESTRUTURA GLOBAL (OTIMIZADA):
- global_youtube_channels: Canais únicos
- user_channel_subscriptions: Relacionamento usuário-canal
- global_processed_videos: Vídeos com resumos únicos
- user_video_notifications: Controle de envio


LOGS E ANALYTICS:
- conversation_logs: Interações do bot
- system_stats: View de estatísticas
- popular_channels: View de canais populares

BENEFÍCIOS:
✅ Resumos reutilizáveis (economia 90%+ OpenAI)
✅ Transcrições para qualidade superior
✅ Estrutura escalável
✅ Analytics e monitoramento
✅ Segurança RLS
✅ Código limpo sem legacy
*/