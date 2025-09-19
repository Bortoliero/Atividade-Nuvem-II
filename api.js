const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const port = 3000;

// Configuração do banco de dados MySQL
const dbConfig = {
  host: "127.0.0.1",
  user: "root",
  password: "sua_senha",
  database: "mensageria_grupo_d",
  port: 3306,
};

// Middleware para parsing JSON
app.use(express.json());

// Rota raiz com links para endpoints
app.get("/", (req, res) => {
  res.send(`
    <h1>API de Reservas</h1>
    <ul>
      <li><a href="/reserves">/reserves</a> - Consultar reservas completas</li>
      <li><a href="/clientes">/clientes</a> - Consultar clientes</li>
      <li><a href="/quartos-reservados">/quartos-reservados</a> - Consultar quartos reservados</li>
    </ul>
  `);
});

// Rota para consultar reservas completas
app.get("/reserves", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
const [rows] = await connection.execute("SELECT * FROM reservations LIMIT 50"); // Ajuste conforme necessidade
    res.json({ total: rows.length, reservas: rows });
  } catch (err) {
    console.error("Erro ao consultar reservas:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  } finally {
    if (connection) await connection.end();
  }
});

// Rota para consultar clientes
app.get("/clientes", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM customers LIMIT 50");
    res.json({ total: rows.length, clientes: rows });
  } catch (err) {
    console.error("Erro ao consultar clientes:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  } finally {
    if (connection) await connection.end();
  }
});

// Rota para consultar quartos reservados
app.get("/quartos-reservados", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM reserved_rooms LIMIT 50");
    res.json({ total: rows.length, quartos_reservados: rows });
  } catch (err) {
    console.error("Erro ao consultar quartos reservados:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  } finally {
    if (connection) await connection.end();
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`API de reservas rodando em http://localhost:${port}`);
});
