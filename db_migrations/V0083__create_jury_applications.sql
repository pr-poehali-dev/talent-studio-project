CREATE TABLE IF NOT EXISTS jury_applications (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    contest_id INTEGER NULL,
    contest_name VARCHAR(255) NOT NULL,
    ratings JSONB NOT NULL DEFAULT '[]'::jsonb,
    price INTEGER NOT NULL DEFAULT 0,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'paid',
    payment_id VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_settings (key, value) VALUES ('jury_application_price', '200')
ON CONFLICT (key) DO UPDATE SET key = EXCLUDED.key;
