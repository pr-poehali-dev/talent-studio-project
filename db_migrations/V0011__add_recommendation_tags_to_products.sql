-- Добавляем поле recommendation_tags для связи товаров с правилами подбора
ALTER TABLE products ADD COLUMN IF NOT EXISTS recommendation_tags JSONB DEFAULT '[]';

-- Добавляем комментарий для понимания назначения поля
COMMENT ON COLUMN products.recommendation_tags IS 'Массив тегов для алгоритма подбора витаминов. Пример: ["vitamin_d3", "omega_3"]';

-- Создаем индекс для быстрого поиска по тегам
CREATE INDEX IF NOT EXISTS idx_products_recommendation_tags ON products USING GIN (recommendation_tags);