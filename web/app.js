const express = require('express')

const app = express()
const port = 3000

require('./routes')(app)

app.use((err, req, res, next) => {
	console.error(err)
	res.status(500).json({
		code: 500,
		message: 'server error'
	})
})

app.listen(port, () => {
	console.log('app is running')
})

module.exports = app
