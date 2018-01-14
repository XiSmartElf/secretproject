const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient('LTC-USD');
const winston = require('winston');

//configure default logger.
winston.exitOnError = false;
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true,
    label: 'application',
    level: 'debug'
});
winston.add(require('winston-daily-rotate-file'), {
    name: 'applicationAll',
    filename: 'logs/application.log',
    level: 'verbose'
});
winston.add(require('winston-daily-rotate-file'), {
    name: 'applicationError',
    filename: 'logs/application_error.log',
    level: 'error'
});

//configure application logger.
winston.loggers.add('logger', {
    transports: [
        new(winston.transports.Console)({
            colorize: true,
            label: 'request',
            level: 'debug'
        }),
        new(require('winston-daily-rotate-file'))({
            name: 'applicationAll',
            filename: 'logs/application.log',
            level: 'verbose'
        }),
        new(require('winston-daily-rotate-file'))({
            name: 'applicationError',
            filename: 'logs/application_error.log',
            level: 'error'
        })
    ]
});
var logger = winston.loggers.get('logger');
//logger.remove(winston.transports.Console); //remove console to improve performance in prod.
//winston.remove(winston.transports.Console); //remove console to improve performance in prod

// Websocket Client
var RealTimeDataProvider = function() {
    const websocket = new Gdax.WebsocketClient(['LTC-USD']);
    var cachedPrice = null;
    var priceCallbacks = {};
    var callbackId = 0;
    this.cancelAllCallbacks = function() {
        priceCallbacks = {};callbackId = 0;
    }

    this.setPriceTest = function(testPrice){
        cachedPrice = {price:testPrice};
    }

    this.price = {

        getPrice: () => {
            if (cachedPrice == null) return null;
            return Number(cachedPrice.price);
        },

        registerPriceAlertCallBack: (price, callback) => {
            if (cachedPrice == null || price == cachedPrice.price) throw 'price the same or no cur price';
            priceCallbacks[callbackId++] = {
                target: price,
                condition: price < cachedPrice.price ? 'down' : 'up',
                callback: callback,
                old_price: Number(cachedPrice.price)
            };
            logger.verbose(`registered call for ${price}, current price ${cachedPrice.price}, trend: ${price < cachedPrice.price ? 'down' : 'up'}`)
        }
    }

    websocket.on('message', data => {
        //logger.info("Websocket data: " + `${data.side} ${data.size} ${data.product_id} @ ${data.price} @ ${data.time}`)
        if (data.type !== 'match') {
            return;
        }
        cachedPrice = data;

        //optimize finding callbacks. tree?
        logger.debug(Object.keys(priceCallbacks).length);
        for (var id in priceCallbacks) {
            var callbackInfo = priceCallbacks[id];
            if (callbackInfo.target < callbackInfo.old_price) { //expect price to go down to target
                if (data.price <= callbackInfo.target) {
                    logger.verbose(`wake up at ${cachedPrice.price}!! for ${callbackInfo.target}, condition of ${callbackInfo.condition}, oldpirce: ${callbackInfo.old_price}`);
                    callbackInfo.callback(callbackInfo, data.price);
                    delete priceCallbacks[id];
                }
            } else { //expect price to go up to target
                if (data.price >= callbackInfo.target) {
                    logger.verbose(`wake up at ${cachedPrice.price}!! for ${callbackInfo.target}, condition of ${callbackInfo.condition}, oldpirce: ${callbackInfo.old_price}`);
                    callbackInfo.callback(callbackInfo, data.price);
                    delete priceCallbacks[id];
                }
            }
        }
    });

    websocket.on('open', () => {
        logger.info("Websocket open");
    });

    websocket.on('error', err => {
        logger.error("Websocket error: " + err)
    });
}

var totalCoin = 0;
var money = 1000;
var boughtCount = 0;
var soldCount = 0;
var registered = false;

var engine = new RealTimeDataProvider();

var printCurrentStatus = function() {
    let value = totalCoin * engine.price.getPrice();
    logger.info('i have money:' + money + ' i have coin:' + totalCoin + ' coin worth: ' + value + ' total: ' + (value + money) + ' time: ' + (new Date()).toString());
}

var buy = () => {
    //make a purchase here
    if (totalCoin != 0) {
        logger.warn('has coin already, so not buy at this time');
        return;
    }
    money -= engine.price.getPrice();
    totalCoin++;
    boughtCount++;
    logger.warn('bought! at ' + engine.price.getPrice());
    printCurrentStatus();
}

var sell = () => {
    if (totalCoin == 0) {
        logger.warn('does not have coin, so not sell at this time');
        return;
    }
    //make a sell here TODO: Limit order? maker fee.
    totalCoin--;
    money += engine.price.getPrice();
    soldCount++;
    logger.warn('sold! at ' + engine.price.getPrice());
    printCurrentStatus();
}

var PriceModel = function() {
    var support = 240.8;
    var resistence = 241.5;
    var curPrice;

    this.getSupport = function(){
        return support;
    }
    
    this.getResistence = function(){
        return resistence;
    }

    this.updateCurPrice = (price) => {
        curPrice = price;
        //update model
    }

    this.getToDoAtPriceAlertV1 = function(metadata) {
        if (metadata.condition == 'up') {
            if (curPrice <= resistence && curPrice >= resistence * 0.999) {
                //near resistence by 0.02 percent, sell now
                //and watch the go beyond resistence to buy
                logger.warn("near sell point! current price:" + curPrice + " resistence at: " + resistence);
                sell();
                engine.price.registerPriceAlertCallBack(resistence+0.01, priceCallback);
                //todo:
                //watch go near the support to buy
                engine.price.registerPriceAlertCallBack(support * 1.001, priceCallback); //TODO: near 0.2 percent
            } else if (curPrice > resistence) {
                //the increased price is now above the resistence means:
                //1. if we have shares not sold, we don't sell it.
                //2. if we have shares that are sold already, but then went above resistence, we should buy back
                //3. TODO: this could also mean we sell it consider other factors.
                logger.warn("break resistence! current price:" + curPrice + " old resistence at: " + resistence);
                if (totalCoin == 0) buy();
                //update next support
                support = resistence * 0.999 //TODO: new support 0.01 
                    //update next resistence
                resistence *= 1.003; //TODO: currently we try get 0.3 percent gain
                logger.warn("new support: " + support + " new resistence: " + resistence);

                engine.cancelAllCallbacks();
                //watch the new support,and new resistence 
                engine.price.registerPriceAlertCallBack(resistence * 0.999, priceCallback);
                engine.price.registerPriceAlertCallBack(support * 1.001, priceCallback);
            }
            //Is possible that curPrice smaller than old price due to latency price change? 
        } else {
            if (curPrice >= support && curPrice <= support * 1.001) {
                //near support, buy it.
                buy();
                //and watch the go below support to sell
                engine.price.registerPriceAlertCallBack(support-0.01, priceCallback);
                //todo:
                //watch go near the support to buy
                engine.price.registerPriceAlertCallBack(resistence * 0.999, priceCallback); //TODO: near 0.2 percent
            } else if (curPrice < support) {
                //the price below support means:
                //1. if we don't have shares, don't buy.
                //2. if we have shares, sell it, stop loss
                logger.warn("below support! current price:" + curPrice + " old support at: " + support);
                if (totalCoin > 0) sell();
                //update next support
                resistence = support * 1.001 //TODO: new resistence 0.01
                    //update next resistence
                support *= 0.997; //TODO: currently we try get 0.3 percent loss
                logger.warn("new support: " + support + " new resistence: " + resistence);

                engine.cancelAllCallbacks();
                //watch the new suport,and new resistence 
                engine.price.registerPriceAlertCallBack(resistence * 0.999, priceCallback);
                engine.price.registerPriceAlertCallBack(support * 1.001, priceCallback);
            }
        }
    }
}

var model = new PriceModel();

var priceCallback = function(metadata, curPrice) {
    //analyze and determine what to do now.
    model.updateCurPrice(curPrice);
    model.getToDoAtPriceAlertV1(metadata);
}

var work = () => {
    let curPrice = engine.price.getPrice();
    if (curPrice != null) {
        // buy();
        // sell();
        logger.debug( `${curPrice} support ${model.getSupport()}  wake at: ${model.getSupport()*1.001}  resist at ${model.getResistence()} wake at ${model.getResistence()*0.999} time: ${(new Date()).toString()}`);
        if (!registered) {
            engine.setPriceTest(model.getSupport()*1.0011);
            engine.price.registerPriceAlertCallBack(model.getSupport()*1.001, priceCallback);
            registered = true;
        }
    }
}

setInterval(work, 3000);

module.export = RealTimeDataProvider;