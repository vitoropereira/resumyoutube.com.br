-- Atualizar função para permitir canais ilimitados
-- Agora o limite é baseado em resumos mensais, não em número de canais

CREATE OR REPLACE FUNCTION can_add_global_channel(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Canais agora são ilimitados, sempre retorna true
    -- O limite é baseado em resumos mensais, não em número de canais
    RETURN true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_add_global_channel IS 'Permite canais ilimitados - limite baseado em resumos mensais';