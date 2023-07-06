const {
  TransferTransaction,
  Client,
  ScheduleCreateTransaction,
  PrivateKey,
  Hbar,
  ScheduleInfoQuery,
  ScheduleSignTransaction,
  ScheduleId,
  Timestamp,
  AccountId,
  ScheduleDeleteTransaction,
} = require('@hashgraph/sdk');
require('dotenv').config({ path: './.env' });

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;

const myAccountId2 = process.env.ACCOUNT_ID_2;
const myPrivateKey2 = PrivateKey.fromString(
  process.env.PRIVATE_KEY_2
);

const myAccountId3 = process.env.ACCOUNT_ID_3;
const myPrivateKey3 = PrivateKey.fromString(
  process.env.PRIVATE_KEY_3
);

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

async function createScheduledTX() {
  const transaction = new TransferTransaction()
    .addHbarTransfer(myAccountId2, Hbar.fromTinybars(-10))
    .addHbarTransfer(myAccountId3, Hbar.fromTinybars(10));

  //Schedule a transaction
  const scheduleTransaction = await new ScheduleCreateTransaction()
    .setScheduledTransaction(transaction)
    .setScheduleMemo('Scheduled TX!')
    .execute(client);

  const receipt = await scheduleTransaction.getReceipt(client);

  const scheduleId = receipt.scheduleId;
  console.log('The schedule ID is ' + scheduleId);

  const scheduledTxId = receipt.scheduledTransactionId;
  console.log('The scheduled transaction ID is ' + scheduledTxId);

  const serializedScheduleTransaction = scheduleTransaction.serialize();
  const base64ScheduleTransaction = serializedScheduleTransaction.toString('base64');
  console.log(base64ScheduleTransaction);

  process.exit();
}
async function signScheduledTX(base64ScheduleTransaction) {
  const transaction = await new ScheduleSignTransaction()
    .setScheduleId(base64ScheduleTransaction)
    .freezeWith(client)
    .sign(myPrivateKey2);

  const txResponse = await transaction.execute(client);

  const receipt = await txResponse.getReceipt(client);

  const transactionStatus = receipt.status;
  console.log(
    'The transaction consensus status is ' + transactionStatus
  );

  process.exit();
}

async function getScheduledInfo(scheduleId) {
  const query = new ScheduleInfoQuery().setScheduleId(scheduleId);

  const info = await query.execute(client);
  console.log(
    'The scheduledId you queried for is: ',
    new ScheduleId(info.scheduleId).toString()
  );
  console.log('The memo for it is: ', info.scheduleMemo);
  console.log(
    'It got created by: ',
    new AccountId(info.creatorAccountId).toString()
  );
  console.log(
    'It got payed by: ',
    new AccountId(info.payerAccountId).toString()
  );
  console.log(
    'The expiration time of the scheduled tx is: ',
    new Timestamp(info.expirationTime).toDate()
  );
  if (
    new Timestamp(info.executed).toDate().getTime() ===
    new Date('1970-01-01T00:00:00.000Z').getTime()
  ) {
    console.log('The transaction has not been executed yet.');
  } else {
    console.log(
      'The time of execution of the scheduled tx is: ',
      new Timestamp(info.executed).toDate()
    );
  }

  process.exit();
}

async function deleteScheduled(scheduleId) {
  const transaction = await new ScheduleDeleteTransaction()
    .setScheduleId(scheduleId)
    .freezeWith(client)
    .sign(myPrivateKey);

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);

  const transactionStatus = receipt.status;
  console.log(
    'The transaction consensus status is ' + transactionStatus
  );

  process.exit();
}

createScheduledTX();
// signScheduledTX('0.0.4566893');
// getScheduledInfo('0.0.4566893');
// deleteScheduled('0.0.4566893');
