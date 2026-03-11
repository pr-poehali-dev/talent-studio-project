-- Создание таблицы для истории рекомендаций пользователя
CREATE TABLE IF NOT EXISTS recommendations_history (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    survey_data JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Индекс для быстрого поиска по user_id
CREATE INDEX idx_recommendations_user_id ON recommendations_history(user_id);

-- Индекс для сортировки по дате
CREATE INDEX idx_recommendations_created_at ON recommendations_history(created_at DESC);
