CREATE TABLE olympiad_applications (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  study_year INTEGER NOT NULL,
  teacher VARCHAR(255),
  institution VARCHAR(255),
  work_title VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  olympiad_type VARCHAR(100) NOT NULL DEFAULT 'palette',
  status VARCHAR(50) DEFAULT 'new',
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

INSERT INTO site_settings (key, value) VALUES ('olympiad_palette_price', '300');
INSERT INTO site_settings (key, value) VALUES ('olympiad_palette_description', 'Всероссийская интерактивная олимпиада по ИЗО для учащихся 1–9 классов. Проверьте свои знания в области изобразительного искусства и получите диплом!');
INSERT INTO site_settings (key, value) VALUES ('olympiad_palette_rules_url', '');
INSERT INTO site_settings (key, value) VALUES ('olympiad_palette_diploma_url', '');
INSERT INTO site_settings (key, value) VALUES ('olympiad_palette_gratitude_url', '');
