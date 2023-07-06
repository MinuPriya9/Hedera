const {
  FileCreateTransaction,
  FileAppendTransaction,
  FileContentsQuery,
  TransactionRecordQuery,
  Hbar,
  LocalProvider,
  Wallet,
} = require('@hashgraph/sdk');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;

const wallet = new Wallet(
  myAccountId,
  myPrivateKey,
  new LocalProvider()
);

async function createFile() {
  const data = fs.readFileSync('./car.jpg');

  console.log(`The size of the data is ${data.length}`);

  // Create a file on Hedera and store file
  let fileCreateTransaction = await new FileCreateTransaction()
    .setKeys([wallet.getAccountKey()])
    .setContents('')
    .setMaxTransactionFee(new Hbar(2))
    .freezeWithSigner(wallet);
  fileCreateTransaction = await fileCreateTransaction.signWithSigner(
    wallet
  );
  const txCreateResponse =
    await fileCreateTransaction.executeWithSigner(wallet);

  //Get the receipt of the transaction
  const createReceipt = await txCreateResponse.getReceiptWithSigner(
    wallet
  );

  //Grab the new file ID from the receipt
  const fileId = createReceipt.fileId;
  console.log(`Your file ID is: ${fileId}`);

  // Fees can be calculated with the fee estimator https://hedera.com/fees
  const txAppendResponse = await (
    await (
      await new FileAppendTransaction()
        .setNodeAccountIds([txCreateResponse.nodeId])
        .setFileId(fileId)
        .setContents(data)
        .setMaxTransactionFee(new Hbar(10))
        .freezeWithSigner(wallet)
    ).signWithSigner(wallet)
  ).executeWithSigner(wallet);

  const appendReceipt = await txAppendResponse.getReceiptWithSigner(
    wallet
  );

  const contents = await new FileContentsQuery()
    .setFileId(fileId)
    .executeWithSigner(wallet);

  console.log(
    `File content length according to \`FileInfoQuery\`: ${contents.length}`
  );

  // Get the fees
  const createQuery = await new TransactionRecordQuery()
    .setTransactionId(txCreateResponse.transactionId)
    .executeWithSigner(wallet);
  const appendQuery = await new TransactionRecordQuery()
    .setTransactionId(txAppendResponse.transactionId)
    .executeWithSigner(wallet);

  console.log(`Fee for create: ${createQuery.transactionFee}`);
  console.log(`Fee for append: ${appendQuery.transactionFee}`);

  // Those are in Hbar, what is the exchange rate?
  const exchangeRateCreate =
    createReceipt.exchangeRate.exchangeRateInCents;
  const exchangeRateAppend =
    appendReceipt.exchangeRate.exchangeRateInCents;

  console.log(
    `Exchange Rate create (USD Cents) TX ${exchangeRateCreate}, append TX ${exchangeRateAppend}`
  );

  process.exit();
}

async function retriveFile(fileId) {
  const query = new FileContentsQuery().setFileId(fileId);

  const contents = await query.executeWithSigner(wallet);

  console.log(`The size of the data is ${contents.length}`);

  fs.writeFileSync('./car2.jpg', contents);

  process.exit();
}

createFile();
// retriveFile('0.0.4567057');
