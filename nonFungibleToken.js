const {
  TokenCreateTransaction,
  Client,
  TokenType,
  TokenSupplyType,
  PrivateKey,
  AccountBalanceQuery,
} = require('@hashgraph/sdk');

require('dotenv').config({ path: './.env' });

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(
  process.env.MY_PRIVATE_KEY
);
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);
