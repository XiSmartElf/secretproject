'use strict'
const fs = require("fs");
const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient('LTC-USD');
const apiURI = 'https://api.gdax.com';
const sandboxURI = 'https://api-public.sandbox.gdax.com';

global._base = __dirname + "";
console.log(global._base);
const content = fs.readFileSync(global._base + "/encript.json");
const Provider = require(global._base + "main.js");
const engine = new Provider();

const obj = JSON.parse(content);
const key = obj.key;
const secret = obj.value;
const passphrase = obj.phrase;

const authedClient = new Gdax.AuthenticatedClient(key, secret, passphrase, apiURI);

const sellParams = {
    'price': '13600.0', // USD
    'size': '0.0001', // BTC
    'product_id': 'BTC-USD',
};


authedClient.sell(sellParams)
    .then((data) => {
        console.log(data);
    })



var getPriceAsync = function() {
    return publicClient.getProductTicker()
        .then(data => {
            return data;
        })
        .catch(error => {
            // handle the error
        });
}

while(true){


}