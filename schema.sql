-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    document VARCHAR(50),
    phone VARCHAR(50),
    country VARCHAR(50),
    loyalty_tier INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Quartos Reservados
CREATE TABLE IF NOT EXISTS reserved_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    hotel_id INT,
    hotel_name VARCHAR(255),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    daily_rate DECIMAL(10, 2),
    currency VARCHAR(10),
    checkin_date DATE,
    checkout_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Reservas
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT,
    reserved_room_id INT,
    status VARCHAR(50),
    number_of_guests INT,
    breakfast_included BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    transaction_id VARCHAR(100),
    source VARCHAR(50),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (reserved_room_id) REFERENCES reserved_rooms(id) ON DELETE SET NULL
);
