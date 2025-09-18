const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const port = 3000;

// Configuração do banco de dados MySQL (substitua com suas credenciais)
const dbConfig = {
  host: "127.0.0.1",
  user: "root", // Seu usuário MySQL
  password: "sua_senha", // Sua senha MySQL
  database: "mensageria_grupo_d", // Nome do banco de dados
  port: 3306,
};

// Middleware para parsing JSON
app.use(express.json());

// Rota para consultar reservas com joins das tabelas relacionadas
app.get("/reserves", async (req, res) => {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Construir query com filtros opcionais
    let query = `
      SELECT 
        r.id as reserva_id,
        r.uuid,
        r.status,
        r.numero_hospedes,
        r.cafe_incluso,
        r.metodo_pagamento,
        r.status_pagamento,
        r.transaction_id,
        r.fonte,
        r.ip_address,
        r.created_at as reserva_created_at,
        r.indexed_at,
        c.id as cliente_id,
        c.nome as cliente_nome,
        c.email as cliente_email,
        c.documento as cliente_documento,
        c.created_at as cliente_created_at,
        qr.id as quarto_id,
        qr.numero_quarto,
        qr.hotel_id,
        qr.hotel_nome,
        qr.categoria,
        qr.subcategoria,
        qr.valor_diaria,
        qr.moeda,
        qr.data_checkin,
        qr.data_checkout,
        qr.created_at as quarto_created_at
      FROM reservas r
      LEFT JOIN clientes c ON r.cliente_id = c.id
      LEFT JOIN quartos_reservados qr ON r.quarto_reservado_id = qr.id
      WHERE 1=1
    `;

    const queryParams = [];

    // Filtros opcionais baseados nos query parameters
    if (req.query.uuid) {
      query += " AND r.uuid = ?";
      queryParams.push(req.query.uuid);
    }

    if (req.query.cliente_id) {
      query += " AND c.id = ?";
      queryParams.push(parseInt(req.query.cliente_id));
    }

    if (req.query.cliente_email) {
      query += " AND c.email = ?";
      queryParams.push(req.query.cliente_email);
    }

    if (req.query.hotel_id) {
      query += " AND qr.hotel_id = ?";
      queryParams.push(parseInt(req.query.hotel_id));
    }

    if (req.query.numero_quarto) {
      query += " AND qr.numero_quarto = ?";
      queryParams.push(req.query.numero_quarto);
    }

    if (req.query.status) {
      query += " AND r.status = ?";
      queryParams.push(req.query.status);
    }

    // Ordenar por data de criação da reserva (mais recente primeiro)
    query += " ORDER BY r.created_at DESC";

    // Executar query
    const [rows] = await connection.execute(query, queryParams);

    // Transformar os resultados em um formato mais estruturado
    const reservas = rows.map(row => ({
      reserva: {
        id: row.reserva_id,
        uuid: row.uuid,
        status: row.status,
        numero_hospedes: row.numero_hospedes,
        cafe_incluso: row.cafe_incluso,
        metodo_pagamento: row.metodo_pagamento,
        status_pagamento: row.status_pagamento,
        transaction_id: row.transaction_id,
        fonte: row.fonte,
        ip_address: row.ip_address,
        created_at: row.reserva_created_at,
        indexed_at: row.indexed_at
      },
      cliente: row.cliente_id ? {
        id: row.cliente_id,
        nome: row.cliente_nome,
        email: row.cliente_email,
        documento: row.cliente_documento,
        created_at: row.cliente_created_at
      } : null,
      quarto_reservado: row.quarto_id ? {
        id: row.quarto_id,
        numero_quarto: row.numero_quarto,
        hotel_id: row.hotel_id,
        hotel_nome: row.hotel_nome,
        categoria: row.categoria,
        subcategoria: row.subcategoria,
        valor_diaria: row.valor_diaria,
        moeda: row.moeda,
        data_checkin: row.data_checkin,
        data_checkout: row.data_checkout,
        created_at: row.quarto_created_at
      } : null
    }));

    res.json({
      total: reservas.length,
      reservas: reservas
    });

  } catch (err) {
    console.error("Erro ao consultar reservas:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Rota para consultar apenas clientes
app.get("/clientes", async (req, res) => {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    let query = "SELECT * FROM clientes WHERE 1=1";
    const queryParams = [];

    if (req.query.email) {
      query += " AND email = ?";
      queryParams.push(req.query.email);
    }

    if (req.query.documento) {
      query += " AND documento = ?";
      queryParams.push(req.query.documento);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await connection.execute(query, queryParams);
    res.json({ total: rows.length, clientes: rows });

  } catch (err) {
    console.error("Erro ao consultar clientes:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Rota para consultar apenas quartos reservados
app.get("/quartos-reservados", async (req, res) => {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    let query = "SELECT * FROM quartos_reservados WHERE 1=1";
    const queryParams = [];

    if (req.query.hotel_id) {
      query += " AND hotel_id = ?";
      queryParams.push(parseInt(req.query.hotel_id));
    }

    if (req.query.numero_quarto) {
      query += " AND numero_quarto = ?";
      queryParams.push(req.query.numero_quarto);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await connection.execute(query, queryParams);
    res.json({ total: rows.length, quartos_reservados: rows });

  } catch (err) {
    console.error("Erro ao consultar quartos reservados:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.listen(port, () => {
  console.log(`API de reservas rodando em http://localhost:${port}`);
  console.log("Rotas disponíveis:");
  console.log("  GET /reserves - Consultar reservas completas");
  console.log("  GET /clientes - Consultar clientes");
  console.log("  GET /quartos-reservados - Consultar quartos reservados");
});