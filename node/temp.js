// publicClient
//   .getProductTradeStream()
//   .then(data => {
//     console.log(data);
//    })
//   .catch(error => {
//     // handle the error
//   });

// // Get Product
// publicClient
// .getProductOrderBook("BTC-USD", {level: 2})
// .then(data => {
//     data.asks.map(v => {
//         console.log('asks: ' + v);
//     });
//     data.bids.map(v => {
//         console.log('bids: ' + v);
//     });
//     console.log('sequence: ' + data.sequence);
// })
// .catch(error => {
//     console.log("Get gdax product error: " + error);
// });

//Orderbook sync
// const orderbook = new Gdax.Orderbook();
// console.log(Object.keys(orderbook.state()));
// console.log('LTC-USD' + orderbookSync.books['LTC-USD'].state());
