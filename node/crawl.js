var https = require('https');
var Promise = require('bluebird');
var HTMLParser = require('fast-html-parser');

var HttpClient = function (host, port) {
    this.host = host;
    this.port = port;

    var self = this;

    this.getWithoutAuth = function (partialUrl) {
        var options = {
            host: self.host,
            port: self.port,
            method: 'GET',
            path: partialUrl
        };
        return request(partialUrl, options);
    };

    var request = function (partialUrl, options, dataString) {
        return new Promise(function (resolve, reject) {
            var req = https.request(options, function (res) {
                var result = '';
                res.on('data', function (chunk) {
                    result += chunk;
                });
                res.on('end', function () {
                    var response = {
                        statusCode: res.statusCode,
                        data: result
                    };
                    resolve(response);
                });
                res.on('error', function (err) {
                    reject(err);
                })
            });
            req.on('error', function (err) {
                reject(err);
            });
            if (dataString) {
                req.write(dataString);
            }

            req.end();
        });
    };
}

var host = "coinmarketcap.com";
var binanceHost = "www.binance.com";
var client = new HttpClient(host, 443);

var binanceClient = new HttpClient(binanceHost, 443);

binanceClient.getWithoutAuth("/api/v1/ticker/allPrices").then((res) => {
    let data = JSON.parse(res.data);
    let symbols = [];

    for (let d of data) {
        symbols.push(d.symbol);
    }
    return symbols;
}).then((symbols) => {
    return client.getWithoutAuth("/all/views/all/").then((res) => {
        var root = HTMLParser.parse(res.data);
        var rawCoinRows = root.querySelectorAll(".currency-name-container");
       // var tasks = [];
        var promise = new Promise((r)=>{r();});

        for (let rawCoin of rawCoinRows) {
            let coinUrl = rawCoin.attributes.href;
            promise = promise.then(()=>{
                return client.getWithoutAuth(coinUrl).then((data) => {
                    var coinDom = HTMLParser.parse(data.data);
                    var rawCoinPage = coinDom.querySelector("#quote_price");
                    var symbol = coinDom.querySelector(".bold.hidden-xs").structuredText;
                    //var sc = coinDom.querySelector(".list-unstyled");
                    var c = symbol.substring(1, symbol.length-1);
                    if(!hasPrefixElem(symbols, c)) return;
                    var sourceCodeUrl = "";
                    if (data.data.includes("Source Code")) {
                        let index = data.data.search("https://github");
                        let i = index;
                        while (data.data.charAt(i) != '"') {
                            i++;
                        }
                        var sourceCodeUrl = data.data.substring(index, i);
                    }
    
                    console.log(symbol + "," + rawCoinPage.attributes['data-usd'] + "  @ " + sourceCodeUrl);
                });
            });
        }

        // if(tasks.length>100){
        //     let i = 0
        //     var promise = new Promise((r)=>{r();});
        //     while(i<tasks.length){
        //         promise = promise.then(()=>{
        //             return tasks[i];
        //             //return Promise.all(tasks.slice(i, (i+1)<=tasks.length? (i+1):tasks.length))
        //         });
        //         i+=1;
        //     }
        //     return promise;
        // }
        //return Promise.all(tasks);
        return promise;
    });
});

var hasPrefixElem = function(array, prefix){
    for(let a of array){
        if(isPrefix(prefix, a)){
            return true;
        }
    }
    return false;
}
var isPrefix = function(a, b){
    var index1 = 0;
    var index2 = 0
    while(index1<a.length){
        if(index2==b.length) return false;
        if(a.charAt(index1)!=b.charAt(index2)){
            return false;
        }
        index1++;
        index2++;
    }
    return true;
}

snapshots = [];

rankHistory = [];
var rank = function(coins){

    var sortedMarketCap = coins.sort((a, b)=>{
        return a.cap-b.cap;
    });

}