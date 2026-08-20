CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    location VARCHAR(200) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, role)
VALUES
('Amit Sharma', 'amit@example.com', 'manager')
ON CONFLICT (email) DO NOTHING;

INSERT INTO properties (title, location, price, status)
VALUES
('2 BHK Apartment', 'Varanasi', 2500000, 'available'),
('3 BHK Villa', 'Lucknow', 5500000, 'available'),
('1 BHK Flat', 'Delhi', 1800000, 'sold')
ON CONFLICT DO NOTHING;