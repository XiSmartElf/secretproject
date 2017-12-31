class RobinhoodEnpoints:
    stock_price = 'https://api.robinhood.com/quotes/?symbols='
    stock_fundemental = 'https://api.robinhood.com/fundamentals/{0}/'

class YahooEndpoints:
    stock_chart_data = 'https://query1.finance.yahoo.com/v8/finance/chart/{0}?period1={1}&period2={2}&interval={3}&includePrePost={4}&corsDomain=finance.yahoo.com'

class GdaxEndpoints:
    coin_price = "https://api.gdax.com"
