-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price INTEGER NOT NULL,
    dosage VARCHAR(100),
    count VARCHAR(100),
    description TEXT,
    emoji VARCHAR(10),
    rating DECIMAL(3,2) DEFAULT 0,
    popular BOOLEAN DEFAULT false,
    external_id VARCHAR(255),
    external_url TEXT,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    delivery_method VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    delivery_city VARCHAR(255),
    delivery_postal_code VARCHAR(20),
    total_amount INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_id VARCHAR(255),
    tracking_number VARCHAR(255),
    items JSONB NOT NULL,
    survey_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица администраторов
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_popular ON products(popular);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Вставка тестовых товаров
INSERT INTO products (name, category, price, dosage, count, description, emoji, rating, popular) VALUES
('Витамин D3', 'Витамины', 890, '2000 МЕ', '90 капсул', 'Поддержка иммунитета и настроения', '☀️', 4.8, true),
('Омега-3 премиум', 'Жирные кислоты', 1590, '1000 мг', '60 капсул', 'Здоровье сердца и мозга', '🐟', 4.9, true),
('Магний цитрат', 'Минералы', 690, '400 мг', '100 таблеток', 'Качественный сон и снятие стресса', '🌙', 4.7, false),
('B-комплекс', 'Витамины', 790, 'Комплекс', '60 капсул', 'Энергия и работа нервной системы', '⚡', 4.6, true),
('Цинк хелат', 'Минералы', 590, '15 мг', '90 таблеток', 'Иммунитет и здоровье кожи', '🛡️', 4.5, false),
('Коэнзим Q10', 'Коэнзимы', 1290, '100 мг', '60 капсул', 'Энергия клеток и антиоксидантная защита', '💎', 4.8, false),
('Витамин C', 'Витамины', 490, '1000 мг', '120 таблеток', 'Иммунитет и антиоксидантная защита', '🍊', 4.7, true),
('Кальций + D3', 'Минералы', 890, '600 мг + 400 МЕ', '90 таблеток', 'Здоровье костей и зубов', '🦴', 4.6, false)
ON CONFLICT DO NOTHING;

-- Вставка тестового администратора (пароль: admin123)
INSERT INTO admins (username, password_hash, email, role) VALUES
('admin', '$2b$10$rJWVGVz1VYxJ5y3kYhXx2.KJ5yLxPZ9cGxKh8hVJGkWxYZJQYxYxY', 'admin@vitamins.ru', 'admin')
ON CONFLICT (username) DO NOTHING;
