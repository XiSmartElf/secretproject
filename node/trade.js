'use strict'
const fs = require("fs");
const Gdax = require('gdax');

const apiURI = 'https://api.gdax.com';
const sandboxURI = 'https://api-public.sandbox.gdax.com';

global._base = __dirname + '/../';

const content = fs.readFileSync(global._base+"/node/encript.json");
const obj = JSON.parse(content);
const key = obj.key;
const secret = obj.value;
const passphrase = obj.phrase;

const authedClient = new Gdax.AuthenticatedClient(key, secret, passphrase, apiURI);

authedClient.getAccounts((data)=>{
    console.log(data);
});


// const accountID = '7d0f7d8e-dd34-4d9c-a846-06f431c381ba';
// authedClient.getAccountHolds(accountID, callback);

// console.log("123")