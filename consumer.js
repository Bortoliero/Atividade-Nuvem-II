const { PubSub } = require("@google-cloud/pubsub");
const mysql = require("mysql2/promise");

// Configurações
const projectId = "serjava-demo";
const subscriptionName = "grupo-d-sub";
const keyFilename = "C:\\Atividadenuvem\\service-account-key.json";

const pubSubClient = new PubSub({ projectId, keyFilename });

const dbConfig = {
  host: "127.0.0.1",
  user: "root",
  password: "sua_senha",
  database: "mensageria_grupo_d",
  port: 3306,
};

// Conexão MySQL com retry
async function getDbConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      return connection;
    } catch (err) {
      console.error(`Falha ao conectar MySQL. Tentativa ${i + 1}:`, err.message);
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  throw new Error("Não foi possível conectar ao MySQL após várias tentativas.");
}

// Salva cliente e retorna o ID
async function saveCustomer(customerData, connection) {
  const [result] = await connection.execute(
    `INSERT INTO customers (name, email, document, phone, country, loyalty_tier)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), phone=VALUES(phone), country=VALUES(country), loyalty_tier=VALUES(loyalty_tier)`,
    [
      customerData.name,
      customerData.email,
      customerData.document,
      customerData.phone,
      customerData.country,
      customerData.loyalty_tier
    ]
  );

  // Retorna ID do cliente (novo ou existente)
  if (result.insertId) return result.insertId;
  const [rows] = await connection.execute(`SELECT id FROM customers WHERE document = ?`, [customerData.document]);
  return rows[0].id;
}

// Salva quarto reservado e retorna o ID
async function saveReservedRoom(roomData, hotelData, connection) {
  const [result] = await connection.execute(
    `INSERT INTO reserved_rooms (room_number, hotel_id, hotel_name, category, subcategory, daily_rate, currency, checkin_date, checkout_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE daily_rate=VALUES(daily_rate), category=VALUES(category), subcategory=VALUES(subcategory)`,
    [
      roomData.room_number,
      hotelData.id,
      hotelData.name,
      roomData.category.name,
      roomData.category.sub_category.name,
      roomData.daily_rate,
      roomData.currency || "BRL",
      roomData.checkin_date,
      roomData.checkout_date
    ]
  );

  if (result.insertId) return result.insertId;
  const [rows] = await connection.execute(
    `SELECT id FROM reserved_rooms WHERE room_number = ? AND hotel_id = ?`,
    [roomData.room_number, hotelData.id]
  );
  return rows[0].id;
}

// Salva reserva
async function saveReservation(reservationData, customerId, reservedRoomId, connection) {
  const [result] = await connection.execute(
    `INSERT INTO reservations (
      uuid, customer_id, reserved_room_id, status, number_of_guests,
      breakfast_included, payment_method, payment_status, transaction_id,
      source, ip_address, created_at, indexed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reservationData.uuid,
      customerId,
      reservedRoomId,
      reservationData.reservation_status,
      reservationData.rooms[0].guests,
      reservationData.rooms[0].breakfast_included,
      reservationData.payment.method,
      reservationData.payment.status,
      reservationData.payment.transaction_id,
      reservationData.metadata.source,
      reservationData.metadata.ip_address,
      reservationData.created_at,
      new Date() // indexed_at
    ]
  );
  return result.insertId;
}

// Processa cada reserva
async function processReservation(reservationData) {
  if (!reservationData.rooms || reservationData.rooms.length === 0) {
    console.warn(`Reserva ${reservationData.uuid} ignorada: sem quartos.`);
    return;
  }

  let connection;
  try {
    connection = await getDbConnection();

  const customerId = await saveCustomer({
  name: reservationData.customer.name || null,
  email: reservationData.customer.email || null,
  document: reservationData.customer.document || null,
  phone: reservationData.customer.phone || null,
  country: reservationData.customer.country || null,
  loyalty_tier: reservationData.customer.loyalty_tier || null
}, connection);
    const reservedRoomId = await saveReservedRoom({
  room_number: reservationData.rooms[0].room_number || null,
  category: { name: reservationData.rooms[0].category.name || null,
              sub_category: { name: reservationData.rooms[0].category.sub_category.name || null } },
  daily_rate: reservationData.rooms[0].daily_rate || null,
  currency: reservationData.rooms[0].currency || null,
  checkin_date: reservationData.rooms[0].checkin_date || null,
  checkout_date: reservationData.rooms[0].checkout_date || null
}, {
  id: reservationData.hotel.id || null,
  name: reservationData.hotel.name || null
}, connection);

    const reservationId = await saveReservation({
  uuid: reservationData.uuid,
  reservation_status: reservationData.reservation_status || null,
  rooms: [{
    guests: reservationData.rooms[0].guests || null,
    breakfast_included: reservationData.rooms[0].breakfast_included || null
  }],
  payment: {
    method: reservationData.payment.method || null,
    status: reservationData.payment.status || null,
    transaction_id: reservationData.payment.transaction_id || null,
    amount: reservationData.payment.amount || null
  },
  metadata: {
    source: reservationData.metadata.source || null,
    ip_address: reservationData.metadata.ip_address || null
  },
  created_at: reservationData.created_at || null
}, customerId, reservedRoomId, connection);

    console.log(`Reserva UUID ${reservationData.uuid} salva com ID ${reservationId}`);
  } catch (err) {
    console.error(`Erro ao processar reserva UUID ${reservationData.uuid}:`, err.message);
  } finally {
    if (connection) await connection.end();
  }
}

// Ouve mensagens do Pub/Sub
function listenForMessages() {
  const subscription = pubSubClient.subscription(subscriptionName);

  subscription.on("message", async (message) => {
    try {
      const data = JSON.parse(message.data.toString());
      await processReservation(data);
      message.ack();
    } catch (err) {
      console.error("Erro ao processar mensagem do Pub/Sub:", err.message);
      message.nack();
    }
  });

  console.log(`Ouvindo mensagens na assinatura: ${subscriptionName}...`);
}

listenForMessages();
