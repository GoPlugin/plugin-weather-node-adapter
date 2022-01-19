const { Requester, Validator } = require('@goplugin/external-adapter')

const customError = (data) => {
    if (data.Response === 'Error') return true
    return false
}

const createRequest = (input, callback) => {
    console.log("dataendpoint",input.data.endpoint)
    const jobRunID = input.id;
    const url      = `http://18.117.124.88:5000/api/${input.data.endpoint}`
    console.log("Testinginititit",input)
    // https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD
    const params = {
        fsym: "ETH",
        tsyms: "USD",
    }
    const config = {
        url: url
    }
    Requester.request(config, customError)
        .then(response => {
            console.log("Response value is",response,response.data.Temperature.toString())
            const res = {
                data: {
                        // symbol: "ETH-USD",
                        "Temperature": response.data.Temperature.toString()
                        // timestamp: Date.now()
                    }
                
            }
            callback(response.status, {jobRunID, ...res});
        })
        .catch(error => {
            callback(500, Requester.errored(jobRunID, error))
        })
}

module.exports.createRequest = createRequest