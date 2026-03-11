-- Таблица страниц
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false,
    blocks JSONB DEFAULT '[]',
    styles JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица шаблонов блоков
CREATE TABLE IF NOT EXISTS block_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    preview_image TEXT,
    component_data JSONB NOT NULL,
    default_styles JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица email-логов
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    email_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_block_templates_category ON block_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_logs_order ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- Вставка тестовых шаблонов блоков
INSERT INTO block_templates (name, category, component_data, default_styles) VALUES
('Hero с кнопками', 'hero', '{"type":"hero","title":"Заголовок","subtitle":"Подзаголовок","buttons":[{"text":"Начать","variant":"primary"},{"text":"Узнать больше","variant":"outline"}]}', '{"background":"linear-gradient(to bottom, white, #f3f4f6)","padding":"6rem 1rem"}'),
('Блок преимуществ', 'features', '{"type":"features","title":"Наши преимущества","items":[{"icon":"CheckCircle","title":"Качество","description":"Только проверенные продукты"},{"icon":"Shield","title":"Безопасность","description":"Сертифицированные добавки"},{"icon":"Heart","title":"Забота","title":"Персональный подход"}]}', '{"padding":"4rem 1rem","background":"white"}'),
('FAQ секция', 'faq', '{"type":"faq","title":"Частые вопросы","items":[{"question":"Как быстро доставка?","answer":"Доставка занимает 2-5 дней в зависимости от региона"},{"question":"Есть ли гарантия?","answer":"Да, мы гарантируем качество всех товаров"}]}', '{"padding":"4rem 1rem","background":"#f9fafb"}'),
('Карточки товаров', 'products', '{"type":"products","title":"Популярные товары","layout":"grid","itemsPerRow":3}', '{"padding":"4rem 1rem","background":"white"}'),
('Отзывы', 'testimonials', '{"type":"testimonials","title":"Отзывы клиентов","items":[{"name":"Анна","text":"Отличный сервис!","rating":5},{"name":"Иван","text":"Быстрая доставка","rating":5}]}', '{"padding":"4rem 1rem","background":"#f3f4f6"}'),
('CTA блок', 'cta', '{"type":"cta","title":"Готовы начать?","subtitle":"Пройдите тест и получите персональные рекомендации","buttonText":"Пройти тест","buttonLink":"/survey"}', '{"padding":"4rem 1rem","background":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)","color":"white"}')
ON CONFLICT DO NOTHING;

-- Вставка главной страницы по умолчанию
INSERT INTO pages (slug, title, meta_description, is_published, blocks, styles) VALUES
('home', 'Главная страница', 'Персональный подбор витаминов с AI помощником', true, 
'[{"id":"hero-1","type":"hero","content":{"title":"Персональные витамины для вашего здоровья","subtitle":"Умная система анализирует ваш образ жизни и подбирает идеальный комплекс"}},{"id":"benefits-1","type":"features","content":{"title":"Почему выбирают нас","items":[{"icon":"Sparkles","title":"AI подбор","description":"Персональные рекомендации"},{"icon":"Shield","title":"Безопасность","description":"Сертифицированные продукты"},{"icon":"Truck","title":"Доставка","description":"Быстро и надёжно"}]}}]',
'{"fontFamily":"Rubik","primaryColor":"#8B5CF6","backgroundColor":"#ffffff"}')
ON CONFLICT (slug) DO NOTHING;
