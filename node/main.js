const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();

// // Get Product
publicClient
.getProductOrderBook("BTC-USD")
.then(data => {
    console.log(data.asks.length);
})
.catch(error => {
    console.log("Get gdax product error: " + error);
});

// // Websocket Client
// const websocket = new Gdax.WebsocketClient(['BTC-USD', 'ETH-USD', 'LTC-USD']);

// websocket.on('message', data => { console.log("Websocket data: " + `${data.side} ${data.size} ${data.product_id} @ ${data.price} @ ${data.time}`) });
// websocket.on('error', err => { console.log("Websocket error: " + err) });

// Orderbook sync
//const orderbook = new Gdax.Orderbook();
//console.log(Object.keys(orderbook.state()));
//console.log('LTC-USD' + orderbookSync.books['LTC-USD'].state());

