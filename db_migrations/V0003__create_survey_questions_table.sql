-- Создание таблицы для вопросов анкеты-опроса
CREATE TABLE IF NOT EXISTS survey_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'text',
    options JSONB,
    is_required BOOLEAN DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных вопросов
INSERT INTO survey_questions (question_text, question_type, options, is_required, display_order) VALUES
('Как вас зовут?', 'text', NULL, true, 1),
('Ваш возраст', 'number', NULL, true, 2),
('Какие у вас есть хронические заболевания?', 'textarea', NULL, false, 3),
('Принимаете ли вы какие-то витамины сейчас?', 'radio', '["Да", "Нет", "Иногда"]', true, 4),
('Какие витамины вас интересуют?', 'checkbox', '["Витамин D", "Витамин C", "Магний", "Омега-3", "Кальций", "Группа B"]', false, 5),
('Ваша основная цель', 'select', '["Укрепление иммунитета", "Улучшение сна", "Больше энергии", "Здоровье костей", "Поддержка сердца"]', true, 6);