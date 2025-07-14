-- ========================================
-- Seeds: Sample Data
-- Description: Sample data for testing and development
-- ========================================

-- Sample users (use real UUIDs from auth.users in production)
INSERT INTO users (id, name, email, subscription_status, max_channels) VALUES
('12345678-1234-1234-1234-123456789012', 'João Silva', 'joao@example.com', 'active', 10),
('12345678-1234-1234-1234-123456789013', 'Maria Santos', 'maria@example.com', 'inactive', 3),
('12345678-1234-1234-1234-123456789014', 'Pedro Costa', 'pedro@example.com', 'trialing', 5)
ON CONFLICT (id) DO NOTHING;

-- Sample YouTube channels
INSERT INTO youtube_channels (user_id, channel_id, channel_name, channel_url, channel_description, subscriber_count, video_count) VALUES
('12345678-1234-1234-1234-123456789012', 'UCrAOnWstSv8kfCcXgNg9VuA', 'MrBeast', 'https://youtube.com/@MrBeast', 'I want to make the world a better place before I die.', 329000000, 741),
('12345678-1234-1234-1234-123456789012', 'UC_x5XG1OV2P6uZZ5FSM9Ttw', 'Google for Developers', 'https://youtube.com/@GoogleforDevelopers', 'Subscribe to join a community of creative developers and learn the latest in Google technology.', 2340000, 4891),
('12345678-1234-1234-1234-123456789013', 'UCsooa4yRKGN_zEE8iknghZA', 'TED-Ed', 'https://youtube.com/@TEDEd', 'TED-Ed''s commitment to creating lessons worth sharing is an extension of TED''s mission of spreading great ideas.', 19200000, 1847)
ON CONFLICT (user_id, channel_id) DO NOTHING;

-- Sample summaries
INSERT INTO summaries (user_id, channel_id, video_id, video_title, video_url, summary_text, status) VALUES
(
    '12345678-1234-1234-1234-123456789012',
    (SELECT id FROM youtube_channels WHERE channel_id = 'UCrAOnWstSv8kfCcXgNg9VuA' LIMIT 1),
    'dQw4w9WgXcQ',
    'Sample Video Title',
    'https://youtube.com/watch?v=dQw4w9WgXcQ',
    'Este é um resumo de exemplo de um vídeo do YouTube. Contém os pontos principais e insights mais importantes do conteúdo.',
    'completed'
);

-- Update last_check_at for channels
UPDATE youtube_channels SET last_check_at = NOW() - INTERVAL '1 hour';

-- Show inserted data
SELECT 'Users inserted:' as info, COUNT(*) as count FROM users;
SELECT 'Channels inserted:' as info, COUNT(*) as count FROM youtube_channels;
SELECT 'Summaries inserted:' as info, COUNT(*) as count FROM summaries;