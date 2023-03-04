const externalApi = require('../utils/externalApi')

const dataContoller = {
    getData: async(req, res) => {
        const result = await externalApi.dataApi()

        return res.json({
            result: result.data
        })
    }
}

module.exports = dataContoller
