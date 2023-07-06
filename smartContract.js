const {
  Client,
  FileCreateTransaction,
  ContractCreateTransaction,
  PrivateKey,
  ContractFunctionParameters,
  ContractCallQuery,
  ContractExecuteTransaction,
  Hbar,
} = require('@hashgraph/sdk');
require('dotenv').config({ path: './.env' });

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = process.env.MY_PRIVATE_KEY;

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

async function deployContract() {
  let storeInfoCompiled = require('./artifacts/ArithmeticOperations.sol/ArithmeticOperations.json');
  const bytecode = storeInfoCompiled.bytecode;
  // console.log(bytecode);

  //Create a file on Hedera and store the hex-encoded bytecode
  const fileCreateTx = new FileCreateTransaction()
    //Set the bytecode of the contract
    .setContents(bytecode);

  //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
  const submitTx = await fileCreateTx.execute(client);

  //Get the receipt of the file create transaction
  const fileReceipt = await submitTx.getReceipt(client);

  //Get the file ID from the receipt
  const bytecodeFileId = fileReceipt.fileId;

  //Log the file ID
  console.log(
    'The smart contract byte code file ID is ' + bytecodeFileId
  );

  // Instantiate the contract instan
  const contractTx = await new ContractCreateTransaction()
    //Set the file ID of the Hedera file storing the bytecode
    .setBytecodeFileId(bytecodeFileId)
    //Set the gas to instantiate the contract
    .setGas(100000);
  //Provide the constructor parameters for the contract
  // .setConstructorParameters(
  //   new ContractFunctionParameters().addString('Hello from Hedera!')
  // );

  //Submit the transaction to the Hedera test network
  const contractResponse = await contractTx.execute(client);

  //Get the receipt of the file create transaction
  const contractReceipt = await contractResponse.getReceipt(client);

  //Get the smart contract ID
  const newContractId = contractReceipt.contractId;

  //Log the smart contract ID
  console.log('The smart contract ID is ' + newContractId);

  process.exit();
}

async function add(newContractId) {
  const contractExecTx = await new ContractExecuteTransaction()
    //Set the ID of the contract
    .setContractId(newContractId)
    //Set the gas for the contract call
    .setGas(100000)
    //Set the contract function to call
    .setFunction(
      'add',
      new ContractFunctionParameters().addUint256(10,10)
    );

  //Submit the transaction to a Hedera network and store the response
  const submitExecTx = await contractExecTx.execute(client);

  //Get the receipt of the transaction
  const receipt2 = await submitExecTx.getReceipt(client);

  //Confirm the transaction was executed successfully
  console.log(
    'The transaction status is ' + receipt2.status.toString(),
    receipt2
  );
}


async function subtract(newContractId) {
  const contractExecTx = await new ContractExecuteTransaction()
    //Set the ID of the contract
    .setContractId(newContractId)
    //Set the gas for the contract call
    .setGas(100000)
    //Set the contract function to call
    .setFunction(
      'subtract',
      new ContractFunctionParameters().addUint256(10,10)
    );

  //Submit the transaction to a Hedera network and store the response
  const submitExecTx = await contractExecTx.execute(client);

  //Get the receipt of the transaction
  const receipt2 = await submitExecTx.getReceipt(client);

  //Confirm the transaction was executed successfully
  console.log(
    'The transaction status is ' + receipt2.status.toString(),
    receipt2
  );
}


async function multiply(newContractId) {
  const contractExecTx = await new ContractExecuteTransaction()
    //Set the ID of the contract
    .setContractId(newContractId)
    //Set the gas for the contract call
    .setGas(100000)
    //Set the contract function to call
    .setFunction(
      'multiply',
      new ContractFunctionParameters().addUint256(10,10)
    );

  //Submit the transaction to a Hedera network and store the response
  const submitExecTx = await contractExecTx.execute(client);

  //Get the receipt of the transaction
  const receipt2 = await submitExecTx.getReceipt(client);

  //Confirm the transaction was executed successfully
  console.log(
    'The transaction status is ' + receipt2.status.toString(),
    receipt2
  );
}


async function divide(newContractId) {
  const contractExecTx = await new ContractExecuteTransaction()
    //Set the ID of the contract
    .setContractId(newContractId)
    //Set the gas for the contract call
    .setGas(100000)
    //Set the contract function to call
    .setFunction(
      'divide',
      new ContractFunctionParameters().addUint256(20,10)
    );

  //Submit the transaction to a Hedera network and store the response
  const submitExecTx = await contractExecTx.execute(client);

  //Get the receipt of the transaction
  const receipt2 = await submitExecTx.getReceipt(client);

  //Confirm the transaction was executed successfully
  console.log(
    'The transaction status is ' + receipt2.status.toString(),
    receipt2
  );
}

//  deployContract();

 add('0.0.15050560');
// subtract('0.0.15048693');
// multiply('0.0.15048693');
// divide('0.0.15048693');

//  setData('0.0.15048693');
//  getData('0.0.15048693');
 

//  setData('0.0.15044991');
//  getData('0.0.15044991');
