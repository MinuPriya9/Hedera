const {
  Client,
  AccountBalanceQuery,
  TransferTransaction,
  Hbar,
  PrivateKey,
  AccountCreateTransaction,
  AccountAllowanceApproveTransaction,
} = require('@hashgraph/sdk');
require('dotenv').config({ path: './.env' });

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(
  process.env.MY_PRIVATE_KEY
);

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

const client2 = Client.forTestnet();
client2.setOperator(myAccountId2, myPrivateKey2);
async function accountInfo(accId) {
  const query = new AccountBalanceQuery().setAccountId(accId);
  const accountBalance = await query.execute(client);

  if (accountBalance) {
    console.log(
      `The account balance for account ${accId} is ${accountBalance.hbars} HBar`
    );

    console.log('All account Info:');
    console.log(JSON.stringify(accountBalance));
  }
}

async function createNewAccount() {
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;
  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);
  const getReceipt = await newAccount.getReceipt(client);
  const newAccountId = getReceipt.accountId;
  console.log(newAccountPrivateKey.toString());
  console.log('The new account ID is: ' + newAccountId);
}

async function transferHbar(accToId) {
  const transaction = new TransferTransaction()
    .addHbarTransfer(myAccountId, new Hbar(-10))
    .addHbarTransfer(accToId, new Hbar(10));

  console.log(`Doing transfer from ${myAccountId} to ${accToId}`);

  const txId = await transaction.execute(client);

  const receipt = await txId.getReceipt(client);
  const transactionStatus = receipt.status;

  console.log(
    'The transaction consensus status is ' + transactionStatus
  );

  // Create the queries
  const queryMine = new AccountBalanceQuery().setAccountId(
    myAccountId
  );
  const queryOther = new AccountBalanceQuery().setAccountId(accToId);

  const accountBalanceMine = await queryMine.execute(client);
  const accountBalanceOther = await queryOther.execute(client);

  console.log(
    `My account balance ${accountBalanceMine.hbars} HBar, other account balance ${accountBalanceOther.hbars}`
  );
}

async function multiSig() {
  //Create the transaction
  //   const transaction = new AccountAllowanceApproveTransaction()
  //     .approveHbarAllowance(myAccountId, myAccountId2, Hbar.from(100))
  //     .freezeWith(client);

  //   //Sign the transaction with the owner account key
  //   const signTx = await transaction.sign(myPrivateKey);

  //   //Sign the transaction with the client operator private key and submit to a Hedera network
  //   const txResponse = await signTx.execute(client);

  //   //Request the receipt of the transaction
  //   const receipt = await txResponse.getReceipt(client);

  //   //Get the transaction consensus status
  //   const transactionStatus = receipt.status;

  //   console.log(
  //     'The transaction consensus status is ' +
  //       transactionStatus.toString()
  //   );

  const transaction = new TransferTransaction()
    .addApprovedHbarTransfer(myAccountId, new Hbar(-100))
    .addApprovedHbarTransfer(myAccountId3, new Hbar(100));

  console.log(
    `Doing transfer from ${myAccountId} to ${myAccountId3}`
  );

  const txId = await transaction.execute(client2);

  const receipt = await txId.getReceipt(client2);
  const transactionStatus = receipt.status;

  console.log(
    'The transaction consensus status is ' + transactionStatus
  );

  // Create the queries
  const queryMine = new AccountBalanceQuery().setAccountId(
    myAccountId
  );
  const queryOther = new AccountBalanceQuery().setAccountId(
    myAccountId3
  );

  const accountBalanceMine = await queryMine.execute(client2);
  const accountBalanceOther = await queryOther.execute(client2);

  console.log(
    `My account balance ${accountBalanceMine.hbars} HBar, other account balance ${accountBalanceOther.hbars}`
  );
}
// accountInfo('0.0.4307639');
// transferHbar('0.0.4307639');
 createNewAccount(); // Run 5 times to create 5 accounts nd 1 primary account
// multiSig();
