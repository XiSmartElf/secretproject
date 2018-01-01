#!/usr/bin/python3

from StockDataProvider.stock_provider import RobinHoodStockProvider
from StockDataProvider.stock_provider import YahooStockProvider

class Stock:
    
    def __init__(self, stock_provider, symbol):
        self._symbol = symbol
        self._provider = stock_provider

    def get_last_price(self):
        return self._provider.get_stock_price(self._symbol)

    def get_pe(self):
        return self._provider.get_stock_fundemental(self._symbol)
    
    def get_chart(self):
        charProvider = YahooStockProvider()
        return charProvider.get_chart(self._symbol)

# a = ['a','2','dsadasda']
# def testMethod(data = len(a)):
#     print(data)

# testMethod()

provider = RobinHoodStockProvider()
stock = Stock(provider, 'NVDA')
price = stock.get_last_price()
pe = stock.get_pe().pe_ratio
print(price)
print(pe)
print(stock.get_chart())
s = pe+'dsdsds'
print(s)