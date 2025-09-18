const mysql = require("mysql2/promise");
const fs = require("fs/promises");

const dbConfig = {
  host: "127.0.0.1",
  user: "root", // Seu usuário MySQL
  password: "sua_senha", // Sua senha MySQL
  database: "mensageria_grupo_d", // Nome do banco de dados
  port: 3306,
};

async function initializeDatabase() {
  let connection;
  try {
    // Conectar sem especificar o banco de dados para criá-lo se não existir
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    });

    // Criar o banco de dados se não existir
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`Banco de dados '${dbConfig.database}' verificado/criado.`);

    // Conectar ao banco de dados específico
    await connection.end(); // Fechar a conexão sem banco de dados
    connection = await mysql.createConnection(dbConfig); // Abrir nova conexão com o banco de dados

    const schemaSql = await fs.readFile("./schema.sql", "utf8");
    const sqlStatements = schemaSql.split(";").filter(statement => statement.trim() !== "");

    for (const statement of sqlStatements) {
      await connection.execute(statement);
    }
    console.log("Tabelas 'clientes', 'quartos_reservados' e 'reservas' criadas/verificadas com sucesso.");
  } catch (err) {
    console.error("Erro ao inicializar o banco de dados:", err);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Conexão com o banco de dados encerrada.");
    }
  }
}

initializeDatabase();