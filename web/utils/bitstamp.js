const WebSocket = require('ws')
const bitstamp = new WebSocket('wss://ws.bitstamp.net')

const CHANNEL = 'live_trades'
const CURRENCIES = ['btcusd', 'ethusd', 'xrpusd', 'ltcusd', 'bchusd', 'adausd', 'dogeusd', 'dashusd', 'linkusd', 'atomusd']


bitstamp.on('open', async () => {
    console.log('connected to Bitstamp WebSocket API')
})

bitstamp.on('error', async () => {
    console.log('connected to Bitstamp WebSocket API Error')
})

bitstamp.on('close', () => {
    console.log('disconnected from Bitstamp WebSocket API')
})

module.exports = {
    bitstamp,
    CHANNEL,
    CURRENCIES,
}
