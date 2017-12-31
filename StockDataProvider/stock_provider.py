from StockDataProvider import endpoints
from DataContract.fundemental import Fundemental
import requests

class RobinHoodStockProvider:
    def __init__(self):
        self._endpoints = endpoints.RobinhoodEnpoints

    def get_stock_price(self, symbol):
        url = self._endpoints.stock_price + symbol
        req = requests.get(url)
        req.raise_for_status()
        data = req.json()
        return data['results'][0]['last_trade_price']

    def get_stock_fundemental(self, symbol):
        url = self._endpoints.stock_fundemental.format(symbol)
        req = requests.get(url)
        req.raise_for_status()
        data = req.json()
        f = Fundemental(data['pe_ratio'])
        return f

class YahooStockProvider:
    def __init__(self):
        self._endpoints = endpoints.YahooEndpoints
     
    def get_chart(self, symbol):
        url = self._endpoints.stock_chart_data.format(symbol, 1509519600, 1510528865, '1d', 'false')
        req = requests.get(url)
        req.raise_for_status()
        data = req.json()
        return data

class GdaxProvider:
    def __init__(self):
        self._endpoints = endpoints.GdaxEndpoints
    
    def get_stock_price(self, symbol):
        url = self._endpoints.coin_price + symbol
        req = requests.get(url)
        req.raise_for_status()
        data = req.json()
        return data['results'][0]['last_trade_price']
