class RateLimitError extends Error {
	constructor(body) {
	  super(body)
	  this.code = 429
	  this.body = body
	}
}

module.exports = {
    RateLimitError
}
