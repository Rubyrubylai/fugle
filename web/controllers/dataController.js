const externalApi = require('../utils/externalApi')


const dataContoller = {
    getData: async(req, res, next) => {

        try {
            const result = await externalApi.dataApi()

            return res.json({
                result: result.data
            })
        }
        catch(err) {
            return next(err)
        }   
    }
}

module.exports = dataContoller
