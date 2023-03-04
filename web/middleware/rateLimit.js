const moment = require('moment')

const redis = require('../models/redis')
const { RateLimitError } = require('../models/error')

const DATA_LIMIT_CONFIG = {
    limit: {
        ip: {
            key: (req) => {
                if (!req.socket.remoteAddress)
                    return false
                return `rateLimit:${req.socket.remoteAddress}`
            },
            count: 10,
        },
        id: {
            key: (req) => {
                if (!req.query.user)
                    return false
                return `rateLimit:${req.query.user}`
            },
            count: 5,
        },
    },
    intervals: 60,
}

class rateLimiter {
    constructor(key) {
        this.key = key
    }

    async addCount(currentTimeStamp) {
        const multi = redis.multi()
        await multi.zremrangebyscore(this.key, 0, currentTimeStamp - DATA_LIMIT_CONFIG.intervals)
        await multi.zadd(this.key, currentTimeStamp, currentTimeStamp)
        await multi.exec()
    }

    async getCount() {
        return await redis.zcard(this.key)
    }
}

const rateLimit = async (req, res, next) => {
    const currentTimeStamp = moment().unix()
    const userRateCountMap = {}
    let isExceedRateLimit = false

    for (let [key, config] of Object.entries(DATA_LIMIT_CONFIG.limit)) {
        let rateLimitKey = config.key(req)
        if (!rateLimitKey) continue

        const limiter = new rateLimiter(rateLimitKey)
        limiter.addCount(currentTimeStamp)
        const rateCount = await limiter.getCount()
        userRateCountMap[key] = rateCount
        if (rateCount > config.count) {
            isExceedRateLimit = true
        }
    }

    if (isExceedRateLimit) {
        return next(new RateLimitError(userRateCountMap))
    }

    return next()
}

module.exports = rateLimit
