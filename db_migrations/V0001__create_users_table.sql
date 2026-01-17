CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 16 AND age <= 100),
    city VARCHAR(100),
    phone VARCHAR(20),
    about_me TEXT,
    avatar_url TEXT,
    skills TEXT[],
    experience TEXT,
    education TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_city ON users(city);
