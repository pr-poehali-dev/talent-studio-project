-- Создание таблицы для настроек синхронизации каталога
CREATE TABLE IF NOT EXISTS sync_settings (
    id SERIAL PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    source_url TEXT,
    schedule_minutes INTEGER DEFAULT 60,
    update_prices_only BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP,
    last_sync_status VARCHAR(50),
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы для логов синхронизации
CREATE TABLE IF NOT EXISTS sync_logs (
    id SERIAL PRIMARY KEY,
    sync_setting_id INTEGER REFERENCES sync_settings(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    status VARCHAR(50),
    items_processed INTEGER DEFAULT 0,
    items_added INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    items_skipped INTEGER DEFAULT 0,
    error_message TEXT,
    details JSONB
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_sync_settings_active ON sync_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_sync_logs_setting ON sync_logs(sync_setting_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started ON sync_logs(started_at DESC);