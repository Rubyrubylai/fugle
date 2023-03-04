const redis = require('redis');

const client = redis.createClient({
    url: 'redis://redis:6379'
});

client.on('error', (err) => {
    console.error(err)
});

(async function () {
    await client.connect()
})();

module.exports = client;
