CREATE TABLE word_search_puzzles (
    id SERIAL PRIMARY KEY,
    olympiad_type VARCHAR(100) NOT NULL DEFAULT 'palette',
    title VARCHAR(500) NOT NULL,
    study_years TEXT[] NULL,
    words JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);