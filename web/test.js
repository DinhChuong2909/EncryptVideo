const LitJsSdk = require('@lit-protocol/lit-node-client-nodejs');
const { ethers } = require("ethers");
const siwe = require('siwe');

async function main() {
  // Initialize LitNodeClient
  const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
        alertWhenUnauthorized: false,
        litNetwork: 'cayenne',
    });
  await litNodeClient.connect();

  let nonce = litNodeClient.getLatestBlockhash();

  // Initialize the signer
  const wallet = new ethers.Wallet('03e2d7915cc58f7dca153a43a7231c6ac8529a51ae0e74c2ddf496e4eb043ac3');
  const address = await wallet.getAddress();

  // Craft the SIWE message
  const domain = 'localhost';
  const origin = 'https://localhost/login';
  const statement =
    'This is a test statement.  You can put anything you want here.';
    
  // expiration time in ISO 8601 format.  This is 7 days in the future, calculated in milliseconds
  const expirationTime = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 7 * 10000
  ).toISOString();
  
  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
    statement,
    uri: origin,
    version: '1',
    chainId: 1,
    nonce,
    expirationTime,
  });
  const messageToSign = siweMessage.prepareMessage();
  
  // Sign the message and format the authSig
  const signature = await wallet.signMessage(messageToSign);

  const authSig = {
    sig: signature,
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    address: address,
  };

  console.log('Done!')
}

main();