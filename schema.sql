-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    documento VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Quartos Reservados
CREATE TABLE IF NOT EXISTS quartos_reservados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_quarto VARCHAR(50) NOT NULL,
    hotel_id INT,
    hotel_nome VARCHAR(255),
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),
    valor_diaria DECIMAL(10, 2),
    moeda VARCHAR(10),
    data_checkin DATE,
    data_checkout DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Reservas
CREATE TABLE IF NOT EXISTS reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(100) UNIQUE NOT NULL,
    cliente_id INT,
    quarto_reservado_id INT,
    status VARCHAR(50),
    numero_hospedes INT,
    cafe_incluso BOOLEAN DEFAULT FALSE,
    metodo_pagamento VARCHAR(50),
    status_pagamento VARCHAR(50),
    transaction_id VARCHAR(100),
    fonte VARCHAR(50),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (quarto_reservado_id) REFERENCES quartos_reservados(id) ON DELETE SET NULL
);