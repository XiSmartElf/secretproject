var https = require('https');
var Promise = require('bluebird');
var binance = require('node-binance-api');
const fs = require("fs");
var spawn = require("child_process").spawn;

var Profolio = function () {
    global._base = __dirname + "";
    console.log(global._base);
    const content = fs.readFileSync(global._base + "/binance_encript.json");

    const obj = JSON.parse(content);
    const key = obj.key;
    const secret = obj.value;
    const passphrase = obj.phrase;

    binance.options({
        'APIKEY': key,
        'APISECRET': secret
    });

    this.getBalance = function () {
        return new Promise((resolve, reject) => {
            binance.balance(function (balances) {
                let assetBalances = {};
                for (let asset in balances) {
                    if (balances[asset].available == 0) continue;
                    assetBalances[asset] = balances[asset].available;
                }
                resolve(assetBalances);
            });
        });
    }

    this.getPrices = function () {
        return new Promise((resolve, reject) => {
            binance.prices(function (ticker) {
                let btcUsd = ticker.BTCUSDT;
                var prices = {};
                for (let asset in ticker) {
                    if (asset.substring(asset.length - 3) != "BTC") continue;
                    let assetName = asset.substring(0, asset.length - 3);
                    prices[assetName] = ticker[asset] * btcUsd;
                }
                prices.BTC = btcUsd;
                resolve(prices)
            });
        })
    }

    this.getProfolio = function () {
        var self = this;
        return self.getBalance()
            .then((balances) => {
                return self.getPrices().then((prices) => {
                    var allAssetVal = 0;
                    var snapshot = {};
                    snapshot.asset = {};
                    for (let b in balances) {
                        for (let p in prices) {
                            if (p === b) {
                                let val = balances[b] * prices[b];
                                allAssetVal += val;
                                snapshot.asset[b]={};
                                snapshot.asset[b].unit_price = prices[b];
                                snapshot.asset[b].units = balances[b];
                                snapshot.asset[b].totalVal = val;
                                //console.log(b + ":" + balances[b] + " price $" + prices[b] + " total: $" + );
                            }
                        }
                    }
                    snapshot.totalVal = allAssetVal;
                    snapshot.timestamp = (new Date()).getTime();
                    snapshot.time = (new Date()).toString();
                    console.log("Total asset $" + allAssetVal);
                    return snapshot;
                })
            });
    }

    // this.getTradeHistory = function(symbols){
    //     var getTask = (symbol)=>{
    //         new Promise((resolve, reject) => {
    //             binance.trades("SNMBTC", function(trades, symbol) {
    //                 console.log(symbol+" trade history", trades);
    //                 resolve(trades);
    //             });
    //     } 
    // }

}

var p = new Profolio();
p.getProfolio().then((data) => {
    var files = fs.readdirSync(global._base+'/pricesSnapshots/');
    let max = 0;
    for (let f of files) {
        if (Number(f) > max) max = Number(f);
    }

    fs.writeFile(global._base+"/pricesSnapshots/" + (max + 1), JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }
        let print = {};
        let smallCap = 0;
        for(let asset in data.asset){
            if(data.asset[asset].totalVal>3){
                print[asset] = data.asset[asset];
            }else{
                smallCap+=data.asset[asset].totalVal;
            }
        }

        console.log(print);
        console.log('small cap: $'+smallCap);
        var process = spawn('C:/Users/superxi/AppData/Local/Programs/Python/Python36-32/python',[global._base+"/../charting/profolio_snapshot.py", max+1 ]);
        process.stdout.on('data', function (data){
            console.log(data.toString());
        });
    });
});


module.exports = Profolio;