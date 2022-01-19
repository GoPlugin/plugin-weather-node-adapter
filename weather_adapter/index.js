const { Requester, Validator } = require('@goplugin/external-adapter')
require("dotenv").config();

const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

const customParams = {
  endpoint:['endpoint']
}

const createRequest = (input, callback) => {
  
  const url = `http://<host>/api/${input.data.endpoint}`

  const config = {
    url
  }

  if (process.env.API_KEY) {
    config.headers = {
      Authorization: process.env.API_KEY
    }
  }
  Requester.request(config, customError)
    .then(response => {
      console.log("response is sisis",response)
      if(input.data.envCheck=="WindDirection"){
        var resultData = response.data[0]['windDirection'];
      }else if(input.data.envCheck=="Temperature"){
        var resultData = response.data[0]['tempC'];
      }else if(input.data.envCheck=="WindChill"){
        var resultData = response.data[0]['windChillC'];
      }
      response.data.result =resultData.toString();

      console.log("resultData is",resultData);
      console.log("response is",response.data.result);
      const res = {
        data: {
                "result": response.data.result.toString()
            }
      }
      callback(response.status, Requester.success(input.id, res));
    })
    .catch(error => {
      callback(500, Requester.errored(input.id, error))
    })
}

module.exports.createRequest = createRequest