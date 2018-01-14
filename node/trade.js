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

const params = {
    'price': '227.96', // USD
    'size': '7',  // BTC
    'product_id': 'LTC-USD',
    'post_only':true
};

authedClient.buy(params)
.then((data)=>{
    console.log(data);
})

