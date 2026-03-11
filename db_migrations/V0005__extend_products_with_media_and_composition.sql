-- Расширение таблицы products для хранения изображений, документов и состава

-- Добавление колонок для изображений и медиа
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS main_image TEXT;

-- Добавление колонок для раздела "О продукте"
ALTER TABLE products ADD COLUMN IF NOT EXISTS about_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS about_usage TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]';

-- Добавление колонок для раздела "Состав"
ALTER TABLE products ADD COLUMN IF NOT EXISTS composition_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS composition_table JSONB DEFAULT '[]';

-- Создание индекса для поиска по изображениям
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);

-- Комментарии к новым полям
COMMENT ON COLUMN products.images IS 'Массив URL изображений товара';
COMMENT ON COLUMN products.main_image IS 'URL основного изображения';
COMMENT ON COLUMN products.about_description IS 'Описание в разделе "О продукте"';
COMMENT ON COLUMN products.about_usage IS 'Применение в разделе "О продукте"';
COMMENT ON COLUMN products.documents IS 'Массив документов {name, url}';
COMMENT ON COLUMN products.videos IS 'Массив видео {title, url}';
COMMENT ON COLUMN products.composition_description IS 'Описание состава';
COMMENT ON COLUMN products.composition_table IS 'Таблица состава [{component, mass, percentage}]';