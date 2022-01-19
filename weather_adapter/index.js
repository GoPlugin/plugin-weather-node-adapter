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
  console.log("inpututt",input.id, input.data.endpoint)
  console.log("endpoint",input.data.endpoint)
  console.log("envCheck",input.data.envCheck)

  //endpoint -> getlatesttemp
  const url = `http://3.14.27.65:5000/api/${input.data.endpoint}`

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
      if(envCheck=="WindDirection"){
        var resultData = response.data[0]['windDirection'];
      }else if(envCheck=="Temperature"){
        var resultData = response.data[0]['tempC'];
      }else if(envCheck=="WindChill"){
        var resultData = response.data[0]['windChillC'];
      }
      response.data.result =resultData.toString();
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