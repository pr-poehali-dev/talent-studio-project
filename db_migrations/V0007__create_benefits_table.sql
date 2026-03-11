CREATE TABLE IF NOT EXISTS benefits (
  id SERIAL PRIMARY KEY,
  icon VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  color VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO benefits (icon, title, description, color, display_order) VALUES
  ('Brain', 'Умный алгоритм', 'AI анализирует 50+ параметров здоровья для точных рекомендаций', 'from-primary/20 to-primary/5', 1),
  ('UserCheck', 'Персональный подход', 'Учитываем ваш образ жизни, питание, цели и особенности здоровья', 'from-secondary/60 to-secondary/20', 2),
  ('Microscope', 'Научная база', 'Рекомендации основаны на клинических исследованиях и доказательной медицине', 'from-accent/60 to-accent/20', 3),
  ('TrendingUp', 'Отслеживание прогресса', 'Следите за результатами и корректируйте программу приема витаминов', 'from-muted/80 to-muted/30', 4);
