CREATE TABLE IF NOT EXISTS t_p97156157_vitamin_assistant_pr.benefits_content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Почему выбирают нас',
  subtitle TEXT NOT NULL DEFAULT 'Современный подход к здоровью с научной точностью и персональным вниманием',
  benefits JSONB NOT NULL DEFAULT '[
    {
      "icon": "Brain",
      "title": "Умный алгоритм",
      "description": "AI анализирует 50+ параметров здоровья для точных рекомендаций",
      "color": "from-primary/20 to-primary/5"
    },
    {
      "icon": "UserCheck",
      "title": "Персональный подход",
      "description": "Учитываем ваш образ жизни, питание, цели и особенности здоровья",
      "color": "from-secondary/60 to-secondary/20"
    },
    {
      "icon": "Microscope",
      "title": "Научная база",
      "description": "Рекомендации основаны на клинических исследованиях и доказательной медицине",
      "color": "from-accent/60 to-accent/20"
    },
    {
      "icon": "TrendingUp",
      "title": "Отслеживание прогресса",
      "description": "Следите за результатами и корректируйте программу приема витаминов",
      "color": "from-muted/80 to-muted/30"
    }
  ]'::jsonb,
  stats JSONB NOT NULL DEFAULT '[
    {"value": "15 000+", "label": "Довольных клиентов"},
    {"value": "98%", "label": "Точность рекомендаций"},
    {"value": "60+", "label": "Витаминов в каталоге"}
  ]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p97156157_vitamin_assistant_pr.benefits_content (id, title, subtitle) 
VALUES (1, 'Почему выбирают нас', 'Современный подход к здоровью с научной точностью и персональным вниманием')
ON CONFLICT (id) DO NOTHING;