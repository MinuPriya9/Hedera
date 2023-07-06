const {
  TopicCreateTransaction,
  Client,
  Wallet,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
  TopicInfoQuery,
  TopicMessageQuery,
} = require('@hashgraph/sdk');
require('dotenv').config({ path: './.env' });

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;

const myAccountId2 = process.env.ACCOUNT_ID_2;
const myPrivateKey2 = PrivateKey.fromString(
  process.env.PRIVATE_KEY_2
);

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

const walletUser = new Wallet(myAccountId, myPrivateKey);
const walletUser2 = new Wallet(myAccountId2, myPrivateKey2);

async function createTopic() {
  let transaction = new TopicCreateTransaction()
    .setSubmitKey(walletUser.publicKey)
    .setAdminKey(walletUser.publicKey)
    .setTopicMemo('Chain group');

  console.log(
    `Created a new TopicCreateTransaction with admin and submit key both set to: ${walletUser.publicKey}`
  );

  let txResponse = await transaction.execute(client);
  let receipt = await txResponse.getReceipt(client);

  let topicId = receipt.topicId;
  console.log(`Your topic ID is: ${topicId}`);

  await new Promise((resolve) => setTimeout(resolve, 5000));
}

async function subscribeTopic(topicId) {
  new TopicMessageQuery()
    .setTopicId(topicId)
    .setStartTime(0)
    .subscribe(client, (message) =>
      console.log(Buffer.from(message.contents, 'utf8').toString())
    );
}

async function submitMessage(topicId) {
  let sendResponse = await new TopicMessageSubmitTransaction({
    topicId: topicId,
    message: 'This is a very first message to my new topic!',
  }).execute(client);

  const getReceipt = await sendResponse.getReceipt(client);
  const transactionStatus = getReceipt.status;
  console.log('The message transaction status: ' + transactionStatus);

  process.exit();
}

async function topicInfo(topicId) {
  const query = new TopicInfoQuery().setTopicId(topicId);

  const info = await query.execute(client);
  console.log(info);
}

async function topicupdate(topicId) {
  const transaction = await new TopicUpdateTransaction()
    .setTopicId(topicId)
    .setSubmitKey(walletUser2.publicKey) // 2nd accout public key
    .freezeWith(client);

  const signTx = await transaction.sign(myPrivateKey);
  const txResponse = await signTx.execute(client);
  const receipt = await txResponse.getReceipt(client);

  const transactionStatus = receipt.status;
  console.log(
    'The transaction consensus status is ' + transactionStatus
  );
}

// createTopic();
// subscribeTopic('0.0.4559201');
// submitMessage('0.0.4559201');
// topicInfo('0.0.4559201');
// topicupdate('0.0.4559201');
