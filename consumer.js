const { PubSub } = require("@google-cloud/pubsub");
const mysql = require("mysql2/promise");

// Configuração do Google Cloud Pub/Sub
const projectId = "serjava-demo"; // Substitua pelo seu Project ID
const subscriptionName = "grupo-d-sub"; // Nome da sua assinatura do Pub/Sub
const keyFilename = "C:\\Atividadenuvem\\service-account-key.json"; // Caminho para a sua chave de conta de serviço

const pubSubClient = new PubSub({ projectId, keyFilename });

// Configuração do banco de dados MySQL (substitua com suas credenciais)
const dbConfig = {
  host: "127.0.0.1", // Use 127.0.0.1 ou localhost
  user: "root", // Usuário MySQL
  password: "sua_senha", // <<--- MUITO IMPORTANTE: COLOQUE A SENHA CORRETA DO SEU USUÁRIO ROOT DO MYSQL
  database: "mensageria_grupo_d", // Nome do banco de dados que você está usando
  port: 3306,
};

async function processReservation(reservationData) {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Conectado ao banco de dados MySQL.");

    // Extrair dados relevantes da reserva
    const roomReservation = reservationData.rooms[0] ? reservationData.rooms[0].number : null;
    const serviceReservation = reservationData.rooms[0] ? reservationData.rooms[0].category.name : null; // Exemplo de serviço
    const customerName = reservationData.customer ? reservationData.customer.name : null;
    const indexedAt = new Date();

    const query = `
            INSERT INTO reservations(
                reserva_quarto,
                reserva_servico,
                cliente,
                indexed_at
            )
            VALUES(?, ?, ?, ?)
        `;
    const values = [roomReservation, serviceReservation, customerName, indexedAt];

    const [result] = await connection.execute(query, values);
    console.log("Reserva processada e salva. ID:", result.insertId);
  } catch (err) {
    console.error("Erro ao processar reserva:", err);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Conexão com o banco de dados encerrada.");
    }
  }
}

function listenForMessages() {
  const subscription = pubSubClient.subscription(subscriptionName);

  let messageCount = 0;
  const messageHandler = async (message) => {
    console.log(`Received message ${message.id}:`);
    console.log(`\tData: ${message.data}`);
    console.log(`\tAttributes: ${JSON.stringify(message.attributes)}`);
    messageCount += 1;

    try {
      const reservationData = JSON.parse(message.data.toString());
      await processReservation(reservationData);
      message.ack(); // "Ack" (acknowledge) the message to remove it from the subscription
    } catch (error) {
      console.error("Erro ao processar mensagem do Pub/Sub:", error);
      message.nack(); // "Nack" (negative acknowledge) the message to re-deliver it later
    }
  };

  subscription.on("message", messageHandler);

  console.log(`Ouvindo mensagens na assinatura: ${subscriptionName}...`);
}

listenForMessages();