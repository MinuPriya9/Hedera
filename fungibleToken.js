const {
  TokenCreateTransaction,
  Client,
  TokenType,
  TokenInfoQuery,
  AccountBalanceQuery,
  PrivateKey,
  Wallet,
  TokenAssociateTransaction,
  TokenSupplyType,
  TransferTransaction,
  TokenPauseTransaction,
  TokenUnpauseTransaction,
} = require('@hashgraph/sdk');

require('dotenv').config({ path: './.env' });

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(
  process.env.MY_PRIVATE_KEY
);

const supplyAccountId = process.env.ACCOUNT_ID_2;
const supplyPrivateKey = PrivateKey.fromString(
  process.env.PRIVATE_KEY_2
);
const myAccountId3 = process.env.ACCOUNT_ID_3;
const myPrivateKey3 = PrivateKey.fromString(
  process.env.PRIVATE_KEY_3
);

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

const adminUser = new Wallet(myAccountId, myPrivateKey);
const supplyUser = new Wallet(supplyAccountId, supplyPrivateKey);

const wallet = new Wallet(myAccountId3, myPrivateKey3);

async function createToken() {
  const transaction = await new TokenCreateTransaction()
    .setTokenName('Blockchain Game Token')
    .setTokenSymbol('K88S')
    .setTokenType(TokenType.FungibleCommon)
    .setTreasuryAccountId(myAccountId)
    .setDecimals(2)
    .setInitialSupply(35050)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(50000)
    .setPauseKey(myPrivateKey)
    .setAdminKey(adminUser.publicKey)
    .setSupplyKey(supplyUser.publicKey)
    .freezeWith(client);

  //Sign the transaction with the client, who is set as admin and treasury account
  const signTx = await transaction.sign(myPrivateKey);

  //Submit to a Hedera network
  const txResponse = await signTx.execute(client);

  //Get the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the token ID from the receipt
  const tokenId = receipt.tokenId;

  console.log('The new token ID is ' + tokenId);

  //Sign with the client operator private key, submit the query to the network and get the token supply

  const name = await queryTokenFunction('name', tokenId);
  const symbol = await queryTokenFunction('symbol', tokenId);
  const tokenSupply = await queryTokenFunction(
    'totalSupply',
    tokenId
  );
  console.log(
    'The total supply of the ' +
      name +
      ' token is ' +
      tokenSupply +
      ' of ' +
      symbol
  );

  //Create the query
  const balanceQuery = new AccountBalanceQuery().setAccountId(
    adminUser.accountId
  );

  //Sign with the client operator private key and submit to a Hedera network
  const tokenBalance = await balanceQuery.execute(client);

  console.log(
    'The balance of the user is: ' + tokenBalance.tokens.get(tokenId)
  );

  process.exit();
}

async function queryTokenFunction(functionName, tokenId) {
  //Create the query
  const query = new TokenInfoQuery().setTokenId(tokenId);

  console.log('retrieveing the ' + functionName);
  const body = await query.execute(client);

  //Sign with the client operator private key, submit the query to the network and get the token supply
  let result;
  if (functionName === 'name') {
    result = body.name;
  } else if (functionName === 'symbol') {
    result = body.symbol;
  } else if (functionName === 'totalSupply') {
    result = body.totalSupply;
  } else {
    return;
  }

  return result;
}

async function transferToken(tokenId) {
  let associateOtherWalletTx = await new TokenAssociateTransaction()
    .setAccountId(wallet.accountId)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(myPrivateKey3);

  //SUBMIT THE TRANSACTION
  let associateOtherWalletTxSubmit =
    await associateOtherWalletTx.execute(client);

  //GET THE RECEIPT OF THE TRANSACTION
  let associateOtherWalletRx =
    await associateOtherWalletTxSubmit.getReceipt(client);

  //LOG THE TRANSACTION STATUS
  console.log(
    `- Token association with the users account: ${associateOtherWalletRx.status} \n`
  );

  //Create the transfer transaction
  const transaction = await new TransferTransaction()
    .addTokenTransferWithDecimals(tokenId, myAccountId, -2525, 2)
    .addTokenTransferWithDecimals(tokenId, wallet.accountId, 2525, 2)
    .freezeWith(client);

  //Sign with the sender account private key
  const signTx = await transaction.sign(myPrivateKey);

  //Sign with the client operator private key and submit to a Hedera network
  const txResponse = await signTx.execute(client);

  //Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Obtain the transaction consensus status
  const transactionStatus = receipt.status;

  console.log(
    'The transaction consensus status ' + transactionStatus.toString()
  );

  process.exit();
}

async function pauseToken(tokenId) {
  const transaction = new TokenPauseTransaction()
    .setTokenId(tokenId)
    .freezeWith(client);

  //Sign with the pause key
  const signTx = await transaction.sign(myPrivateKey);

  //Submit the transaction to a Hedera network
  const txResponse = await signTx.execute(client);

  //Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the transaction consensus status
  const transactionStatus = receipt.status;

  console.log(
    'The transaction consensus status ' + transactionStatus.toString()
  );
}

async function unPauseToken(tokenId) {
  const transaction = new TokenUnpauseTransaction()
    .setTokenId(tokenId)
    .freezeWith(client);

  //Sign with the pause key
  const signTx = await transaction.sign(myPrivateKey);

  //Submit the transaction to a Hedera network
  const txResponse = await signTx.execute(client);

  //Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the transaction consensus status
  const transactionStatus = receipt.status;

  console.log(
    'The transaction consensus status ' + transactionStatus.toString()
  );
}

// createToken();
//  transferToken('0.0.10563469');
//  pauseToken('0.0.10563469');
 unPauseToken('0.0.10563469');
