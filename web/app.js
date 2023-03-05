const express = require('express')

const rateLimitMiddleware = require('./middleware/rateLimit')

const app = express()
const port = 3000

app.use(rateLimitMiddleware)

require('./routes')(app)

app.use((err, req, res, next) => {
	// 統一處理自定義的 error
	if (err.code)
		return res.status(err.code).json(err.body)

	console.error(err)
	res.status(500).json({
		message: 'server error'
	})
})

const server = app.listen(port, () => {
	console.log('app is running')
})

require('./websocket')(server)

module.exports = app
