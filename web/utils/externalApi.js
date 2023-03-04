const axios = require('axios')

const dataRequest = axios.create({
	baseURL: 'https://hacker-news.firebaseio.com'
})


externalApi = {
	dataApi: () => dataRequest.get('/v0/topstories.json?print=pretty'),
}

module.exports = externalApi
