const mysql = require("mysql2/promise");
const fs = require("fs/promises");
const path = require("path");

const dbConfig = {
  host: "127.0.0.1",
  user: "root",
  password: "sua_senha",
  database: "mensageria_grupo_d",
  port: 3306,
};

async function initializeDatabase() {
  let connection;
  try {
    // Conecta sem database
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    });

    // Cria o banco se não existir
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`Banco '${dbConfig.database}' verificado/criado.`);

    await connection.end();

    // Conecta já no banco, permitindo múltiplas instruções
    connection = await mysql.createConnection({
      ...dbConfig,
      multipleStatements: true,
    });

    const schemaPath = path.resolve(__dirname, "schema.sql");
    const schemaSql = await fs.readFile(schemaPath, "utf8");

    await connection.query(schemaSql);
    console.log("Tabelas criadas/verificadas com sucesso.");
  } catch (err) {
    console.error("Erro ao inicializar o banco de dados:", err);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Conexão encerrada.");
    }
  }
}

initializeDatabase();
