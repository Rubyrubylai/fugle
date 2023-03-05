const WebSocket = require('ws')

const redis = require('./models/redis')
const subscribeContoller = require('./controllers/subscribeContoller')
const { SUBSCRIBER_KEY } = require('./config/cacheKey')
const { bitstamp, CURRENCIES, CHANNEL } = require('./utils/bitstamp')


async function getCurrencyOhlcMap(currencies) {
    currencyOhlcMap = {}
    for (let currency of currencies) {
        const price = await redis.zrange(currency, 0, -1)
        currencyOhlcMap[currency] = {
            'open': Number(price[0]) || null,
            'close': Number(price[price.length-1]) || null,
            'min': Math.min(...price),
            'max': Math.max(...price),
        }
    }

    return currencyOhlcMap
}


module.exports = (server) => {
    const wss = new WebSocket.Server({server, path: '/streaming' })

    wss.on('connection', async (ws) => {
        ws.on('error', console.error)

        CURRENCIES.forEach(currency => {
            bitstamp.send(JSON.stringify({
                event: 'bts:subscribe',
                data: {
                    channel: `${CHANNEL}_${currency}`
                }
            }))
        })

        ws.on('message', async (message) => {
            const { type, data } = JSON.parse(message)
            const { userId } = data
            if (!userId) {
                return ws.send('missing userId')
            }

            const hasSubscribed = await redis.hexists(SUBSCRIBER_KEY, userId)

            if (type === 'unsubscribe') {
                await subscribeContoller.unsubscribe(userId)
            }
            else if (type === 'subscribe' || hasSubscribed) {
                await subscribeContoller.subscribe(userId, ws._socket._handle.fd)
            }
        })

        bitstamp.on('message', async (message) => {
            const trade = JSON.parse(message.toString())
            const currentTimeStamp = Number(trade.data.timestamp)
            const price = trade.data.price
            const currency = trade.channel.split('_')[2]
            if (!price) return

            // 最近一分鐘的 OHLC 資料
            const multi = redis.multi()
            await multi.zremrangebyscore(currency, 0, currentTimeStamp - 60)
            await redis.zadd(currency, currentTimeStamp, price)
            await multi.exec()

            const currencyOhlcMap = await getCurrencyOhlcMap(CURRENCIES)

            const subscribers = await redis.hvals(SUBSCRIBER_KEY)
            const clientArray = Array.from(wss.clients)

            subscribers.forEach(subscriber => {
                const ws = clientArray.find(client => client._socket._handle.fd === parseInt(subscriber))
                if (ws)
                    ws.send(JSON.stringify(currencyOhlcMap))
            })
        })

        ws.on('close', () => {
            console.log('disconnected WebSocket server')

            const clientArray = Array.from(wss.clients)
            if (clientArray.length > 0)
                return

            CURRENCIES.forEach(currency => {
                bitstamp.send(JSON.stringify({
                    event: 'bts:unsubscribe',
                    data: {
                        channel: `${CHANNEL}_${currency}`
                    }
                }))
            })
        })
    })

    return wss
}
