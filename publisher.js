// publisher.js
const { PubSub } = require("@google-cloud/pubsub");

// Configs
const projectId = "serjava-demo";
const topicName = "grupo-d-sub"; // mesmo nome do seu tópico
const keyFilename = "C:\\Atividadenuvem\\service-account-key.json";

const pubSubClient = new PubSub({ projectId, keyFilename });

// JSON de teste
const testReservation = {
  uuid: "123e4567-e89b-12d3-a456-426614174000",
  created_at: "2025-09-18T10:00:00Z",
  updated_at: "2025-09-18T10:00:00Z",
  type: "IJ",
  reservation_status: "confirmed",
  total_amount: 1200.50,
  currency: "BRL",
  customer: {
    id: 1,
    name: "Ana Costa",
    email: "ana.costa@example.com",
    document: "503.779.392-56",
    phone: "(89) 94918-1666",
    country: "Brazil",
    loyalty_tier: 1
  },
  hotel: {
    id: 101,
    name: "Hotel Paradise",
    city: "São Paulo",
    state: "SP"
  },
  rooms: [
    {
      room_number: "268",
      daily_rate: 400.0,
      number_of_days: 3,
      checkin_date: "2025-09-26",
      checkout_date: "2025-09-29",
      category: {
        name: "Room Category AM",
        sub_category: {
          id: "BCRU",
          name: "SubCategory ABCD"
        }
      },
      status: "confirmed",
      guests: 2,
      breakfast_included: true,
      currency: "BRL"
    }
  ],
  payment: {
    method: "debit_card",
    status: "processing",
    transaction_id: "txn_1407508378",
    amount: 1200.50
  },
  metadata: {
    source: "mobile_app",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
    ip_address: "192.168.231.130",
    version: "1.4"
  }
};

async function publishMessage() {
  try {
    const dataBuffer = Buffer.from(JSON.stringify(testReservation));
    const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
    console.log(`Mensagem enviada com ID: ${messageId}`);
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
  }
}

publishMessage();
