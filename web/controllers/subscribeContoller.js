const redis = require('../models/redis')
const { SUBSCRIBER_KEY } = require('../config/cacheKey')


const subscribeContoller = {
    subscribe: async (userId, socketId) => {
        await redis.hset(SUBSCRIBER_KEY, userId, socketId)
    },

    unsubscribe: async (userId) => {
        await redis.hdel(SUBSCRIBER_KEY, userId)
    }
}

module.exports = subscribeContoller
