# Atividade de Mensageria - Faculdade

Este projeto implementa um consumidor de mensagens de reserva e uma API para consulta de reservas, conforme os requisitos da atividade da faculdade.

## Integrantes
*   Gabriel Abraovick Bortoliero de Souza
*   Fabio Antimo Modesto Salvatore


## Tecnologias Utilizadas

*   Node.js
*   Express.js (para a API)
*   MySQL (para o banco de dados)
*   Google Cloud Pub/Sub (para mensageria)

## Configuração do Google Cloud Pub/Sub

1.  **Chave da Conta de Serviço**: O arquivo `service-account-key.json` foi gerado com as credenciais fornecidas. Ele será usado para autenticar o consumidor com o Google Cloud Pub/Sub.

2.  **Nome da Assinatura**: O consumidor está configurado para escutar a assinatura `grupo-d-sub` no projeto `serjava-demo`. Se o nome da assinatura ou do projeto for diferente, você precisará atualizar as variáveis `projectId` e `subscriptionName` no arquivo `consumer.js`.

    ```javascript
    const projectId = "serjava-demo"; // Substitua pelo seu Project ID
    const subscriptionName = "grupo-d-sub"; // Nome da sua assinatura do Pub/Sub
    ```

3.  **Variável de Ambiente**: Certifique-se de que a variável de ambiente `GOOGLE_APPLICATION_CREDENTIALS` esteja definida para o caminho completo do seu arquivo `service-account-key.json` antes de executar o `consumer.js`.

    ```powershell
    $env:GOOGLE_APPLICATION_CREDENTIALS="C:\caminho\completo\para\service-account-key.json"
    ```

## Configuração do Banco de Dados MySQL

1.  **Instale o MySQL**: Certifique-se de ter o MySQL Server instalado e rodando em sua máquina.

2.  **Atualize as Credenciais do Banco de Dados**: Edite os arquivos `consumer.js`, `api.js` e `init-db.js` e substitua as credenciais do banco de dados (`your_user`, `your_password`, `your_database`) pelas suas credenciais reais do MySQL.

    Exemplo de `dbConfig`:

    ```javascript
    const dbConfig = {
        host: "127.0.0.1",
        user: "root",
        password: "sua_senha",
        database: "mensageria_grupo_d",
        port: 3306,
    };
    ```

3.  **Inicialize o Banco de Dados e Crie a Tabela**: Execute o script `init-db.js` para criar o banco de dados `atividade_mensageria` (se não existir) e a tabela `reservations`.

    ```bash
    node init-db.js
    ```

## Instalação das Dependências

No diretório raiz do projeto (`atividade_mensageria`), execute o seguinte comando para instalar as dependências:

```bash
npm install
```

## Executando o Consumidor de Mensagens

O arquivo `consumer.js` agora escuta mensagens do Google Cloud Pub/Sub e salva os dados no MySQL. Para executá-lo:

```bash
node consumer.js
```

O consumidor começará a ouvir mensagens na assinatura configurada. Quando uma mensagem for recebida, ela será processada e os dados da reserva serão salvos no banco de dados MySQL.

## Executando a API de Consulta de Reservas

O arquivo `api.js` expõe uma rota GET `/reserves` para consultar as reservas salvas no banco de dados MySQL.

1.  **Inicie a API**:

    ```bash
    node api.js
    ```

    A API estará disponível em `http://localhost:3000`.

2.  **Consulte as Reservas**: Você pode usar seu navegador ou uma ferramenta como `curl` ou Postman para fazer requisições à API.

    *   **Todas as reservas**:

        ```
        GET http://localhost:3000/reserves
        ```

    *   **Filtrar por ID do Cliente** (exemplo: `id_do_cliente=123`):

        ```
        GET http://localhost:3000/reserves?id_do_cliente=123
        ```

    *   **Filtrar por ID do Quarto** (exemplo: `id_do_quarto=101`):

        ```
        GET http://localhost:3000/reserves?id_do_quarto=101
        ```

    *   **Filtrar por UUID** (exemplo: `uuid=3030-499F-39F949`):

        ```
        GET http://localhost:3000/reserves?uuid=3030-499F-39F949
        ```

    *   **Filtrar por ID do Hotel** (exemplo: `id_do_hotel=123`):

        ```
        GET http://localhost:3000/reserves?id_do_hotel=123
        ```

## Principais Diferenças do MySQL em relação ao PostgreSQL

1.  **Sintaxe de Auto-incremento**: MySQL usa `AUTO_INCREMENT` em vez de `SERIAL`.
2.  **Placeholders**: MySQL usa `?` em vez de `$1, $2, etc.` para parâmetros preparados.
3.  **Conexões**: MySQL usa `mysql2/promise` com `createConnection()` e `execute()`.
4.  **Timestamps**: MySQL usa `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`.

## Próximos Passos (Sugestões para a Atividade)

*   **Validação de dados**: Adicionar validação de entrada para os dados recebidos pelo consumidor e pela API.
*   **Tratamento de erros robusto**: Implementar um tratamento de erros mais sofisticado e logging.
*   **Autenticação e Autorização**: Para a API, adicionar mecanismos de segurança como autenticação e autorização.
*   **Pool de Conexões**: Implementar um pool de conexões MySQL para melhor performance.
*   **Testes**: Escrever testes unitários e de integração para o consumidor e a API.
*   **Dockerização**: Empacotar a aplicação em containers Docker para facilitar a implantação.
