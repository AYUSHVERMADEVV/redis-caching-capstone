-- 1. USER TABLE

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CACHE ENTRIES TABLE

CREATE TABLE chache_entries(
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    cache_value TEXT NOT NULL,
    expiration INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cache_user
    FOREIGN KEY (created_by)
    REFERENCES users(id),

    CONSTRAINT check_cache_status
    CHECK(status IN('active','expired','deleted'))
);

-- 3. CAHCHE OPERATIONS TABLE

CREATE TABLE chache_operations(
    id SERIAL PRIMARY KEY,
    chache_entry_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    opeartion_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_operation_cache
    FOREIGN KEY (cache_entry_id)
    REFERENCES chache_entries(id),

    CONSTRAINT
    FOREIGN KEY (user_id)
    REFERENCES users(id),

    CONSTRAINT check_operation_type
    CHECK (
        opeartion_type IN (
            'GET',
            'SET',
            'UPDATE',
            'DELETE'

        )
    )
);

-- 4. AUDIT LOG TABLE

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100),
    entity_id INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
);

-- INDEXES

CRAETE INDEX idx_cache_key
ON chache_entries(cache_key);

CRAETE INDEX idx_cache_status
ON chache_entries(status);

CREATE INDEX idx_operation_user
ON chache_operations(user_id);

CREATE INDEX idx_audit_user
ON audit_logs(user_id);