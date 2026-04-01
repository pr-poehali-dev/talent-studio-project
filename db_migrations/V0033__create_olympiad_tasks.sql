CREATE TABLE olympiad_tasks (
    id SERIAL PRIMARY KEY,
    olympiad_type VARCHAR(100) NOT NULL DEFAULT 'palette',
    title VARCHAR(500) NOT NULL,
    description TEXT,
    question TEXT NOT NULL,
    image_url TEXT,
    options JSONB,
    correct_answer TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);