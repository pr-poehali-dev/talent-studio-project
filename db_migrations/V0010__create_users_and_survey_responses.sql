-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    gender VARCHAR(20),
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица ответов на анкету (первый этап)
CREATE TABLE IF NOT EXISTS user_surveys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    goals TEXT[], -- массив выбранных целей (максимум 3)
    stage INTEGER DEFAULT 1, -- этап заполнения (1 или 2)
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для редактируемых вопросов второго этапа
CREATE TABLE IF NOT EXISTS survey_questions_v2 (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL, -- 'personal', 'nutrition', 'lifestyle', 'complaints'
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'text', 'number', 'single_choice', 'multiple_choice', 'range'
    options JSONB, -- варианты ответов для choice типов
    placeholder VARCHAR(255),
    required BOOLEAN DEFAULT TRUE,
    order_index INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица ответов на вопросы второго этапа
CREATE TABLE IF NOT EXISTS survey_answers (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES user_surveys(id),
    question_id INTEGER REFERENCES survey_questions_v2(id),
    answer_value TEXT,
    answer_json JSONB, -- для сложных ответов
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_surveys_user_id ON user_surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_survey_id ON survey_answers(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_category ON survey_questions_v2(category, order_index);

-- Вставка начальных вопросов второго этапа
INSERT INTO survey_questions_v2 (category, question_text, question_type, options, order_index) VALUES
-- Личные параметры
('personal', 'Укажите ваш рост (см)', 'number', '{"min": 100, "max": 250, "unit": "см"}', 1),
('personal', 'Укажите ваш вес (кг)', 'number', '{"min": 30, "max": 300, "unit": "кг"}', 2),
('personal', 'Укажите обхват талии (см)', 'number', '{"min": 40, "max": 200, "unit": "см"}', 3),

-- Питание
('nutrition', 'Как часто вы употребляете мясо и птицу?', 'single_choice', '{"options": ["Ежедневно", "3-5 раз в неделю", "1-2 раза в неделю", "Редко или никогда"]}', 10),
('nutrition', 'Как часто вы употребляете рыбу и морепродукты?', 'single_choice', '{"options": ["Ежедневно", "3-5 раз в неделю", "1-2 раза в неделю", "Редко или никогда"]}', 11),
('nutrition', 'Как часто вы употребляете молочные продукты?', 'single_choice', '{"options": ["Ежедневно", "3-5 раз в неделю", "1-2 раза в неделю", "Редко или никогда"]}', 12),
('nutrition', 'Как часто вы едите свежие овощи и фрукты?', 'single_choice', '{"options": ["Ежедневно", "3-5 раз в неделю", "1-2 раза в неделю", "Редко или никогда"]}', 13),
('nutrition', 'Употребляете ли вы орехи и семена?', 'single_choice', '{"options": ["Ежедневно", "Несколько раз в неделю", "Редко", "Никогда"]}', 14),
('nutrition', 'Следуете ли вы какой-либо диете?', 'multiple_choice', '{"options": ["Веганская", "Вегетарианская", "Кето", "Низкоуглеводная", "Средиземноморская", "Не следую диете"]}', 15),

-- Образ жизни
('lifestyle', 'Опишите ваш тип работы', 'single_choice', '{"options": ["Сидячая работа (офис, компьютер)", "Умеренная активность", "Физически активная работа", "Работаю на дому"]}', 20),
('lifestyle', 'Как часто вы занимаетесь спортом или физическими упражнениями?', 'single_choice', '{"options": ["Ежедневно", "3-5 раз в неделю", "1-2 раза в неделю", "Редко или никогда"]}', 21),
('lifestyle', 'Какой тип физической активности вы предпочитаете?', 'multiple_choice', '{"options": ["Кардио (бег, плавание)", "Силовые тренировки", "Йога/пилатес", "Командные виды спорта", "Не занимаюсь"]}', 22),
('lifestyle', 'Сколько часов в день вы спите в среднем?', 'single_choice', '{"options": ["Менее 5 часов", "5-6 часов", "7-8 часов", "Более 8 часов"]}', 23),
('lifestyle', 'Оцените качество вашего сна', 'single_choice', '{"options": ["Отличное", "Хорошее", "Удовлетворительное", "Плохое", "Очень плохое"]}', 24),
('lifestyle', 'Курите ли вы?', 'single_choice', '{"options": ["Да, регулярно", "Иногда", "Бросил(а) недавно", "Никогда не курил(а)"]}', 25),
('lifestyle', 'Как часто вы употребляете алкоголь?', 'single_choice', '{"options": ["Ежедневно", "Несколько раз в неделю", "Раз в неделю", "Редко", "Никогда"]}', 26),
('lifestyle', 'Сколько воды вы выпиваете в день?', 'single_choice', '{"options": ["Менее 1 литра", "1-1.5 литра", "1.5-2 литра", "Более 2 литров"]}', 27),
('lifestyle', 'Как часто вы испытываете стресс?', 'single_choice', '{"options": ["Постоянно", "Часто", "Иногда", "Редко", "Никогда"]}', 28),

-- Жалобы и состояние здоровья
('complaints', 'Испытываете ли вы постоянную усталость?', 'single_choice', '{"options": ["Да, постоянно", "Часто", "Иногда", "Редко", "Нет"]}', 30),
('complaints', 'Есть ли у вас проблемы с концентрацией внимания?', 'single_choice', '{"options": ["Да, серьезные", "Да, небольшие", "Иногда", "Нет"]}', 31),
('complaints', 'Как часто вы болеете простудными заболеваниями?', 'single_choice', '{"options": ["Более 6 раз в год", "4-6 раз в год", "2-3 раза в год", "1 раз в год или реже"]}', 32),
('complaints', 'Есть ли у вас проблемы с кожей?', 'multiple_choice', '{"options": ["Акне", "Сухость", "Воспаления", "Пигментация", "Нет проблем"]}', 33),
('complaints', 'Есть ли у вас проблемы с волосами?', 'multiple_choice', '{"options": ["Выпадение", "Ломкость", "Сухость", "Медленный рост", "Нет проблем"]}', 34),
('complaints', 'Есть ли у вас проблемы с ногтями?', 'multiple_choice', '{"options": ["Ломкость", "Расслаивание", "Медленный рост", "Нет проблем"]}', 35),
('complaints', 'Есть ли у вас хронические заболевания?', 'text', '{"placeholder": "Укажите, если есть"}', 36),
('complaints', 'Принимаете ли вы какие-либо лекарства постоянно?', 'text', '{"placeholder": "Укажите, если принимаете"}', 37),
('complaints', 'Есть ли у вас аллергии?', 'text', '{"placeholder": "Укажите, если есть"}', 38),
('complaints', 'Планируете ли вы беременность в ближайшее время?', 'single_choice', '{"options": ["Да", "Нет", "Уже беременна", "Не применимо"]}', 39),
('complaints', 'Испытываете ли вы проблемы с пищеварением?', 'multiple_choice', '{"options": ["Вздутие", "Запоры", "Диарея", "Изжога", "Нет проблем"]}', 40);

COMMENT ON TABLE users IS 'Пользователи сервиса подбора витаминов';
COMMENT ON TABLE user_surveys IS 'Анкеты пользователей (основная информация)';
COMMENT ON TABLE survey_questions_v2 IS 'Редактируемые вопросы второго этапа анкеты';
COMMENT ON TABLE survey_answers IS 'Ответы на вопросы второго этапа';