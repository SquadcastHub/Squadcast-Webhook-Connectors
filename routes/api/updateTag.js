// IMPORTS
const axios = require('axios')
const authV1 = require('../../middlewares/v1/auth')
// UTILITIES
const logger = require('../../util/logger/loggerUtil')
const {
  errorResponse,
  successResponse,
} = require('../../util/response/responseUtil')
// ROUTER INITIALIZATION
const router = require('express').Router()

// Create Card API
router.post('/updateTag', authV1.auth, async (request, response) => {
  //HANDLE BAD REQUEST
  if (
    !request.body.data.resource_data.message &&
    !request.body.data.resource_data.description &&
    !request.body.data.resource_data.status
  ) {
    logger.error('Bad Request, Message, Description or id not found')
    return response
      .status(400)
      .json(errorResponse('Bad Request, Message, Description or id not found'))
  }
  if (!request.header('x-refresh-token')) {
    logger.error('Bad Request, x-refresh-token Not Found')
    return response
      .status(400)
      .json(errorResponse('Bad Request, x-refresh-token Not Found'))
  }
  let message1=request.body.data.resource_data.message
  let temp_tag =message1.split("Ticket #")[1].split(":")[0]
  let dataa = JSON.stringify({
    "tags": {
      "ticket": {
        "value": temp_tag,
        "color": "#0f61dd"
      }
    }
  })
  let apiUrl="https://api.squadcast.com/v3/incidents/"
  let authApiUrl = "https://auth.squadcast.com/oauth/access-token"
  if(!request.body.data.resource_data.url.includes("app.squadcast.com")){
    apiUrl="https://api.eu.squadcast.com/v3/incidents/"
    authApiUrl="https://auth.eu.squadcast.com/oauth/access-token"
  }
  let url=apiUrl +request.body.data.resource_data.id +'/tags'
  let config = {
    method: 'get',
    url: authApiUrl,
    headers: {
      'X-Refresh-Token': request.header('x-refresh-token'),
    },
  }
  const barer_token = await axios(config)
  const token = barer_token.data.data.access_token
//   logger.error(token)
  let config1 = {
    method: 'put',
    url: url,
    headers: {
      Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json'
    },
    data:dataa
  }
  await axios(config1)
    .then((res) => {
      //HANDLE SUCCESS
      logger.info('Returned Response - Tag Updated')
      return response
        .status(200)
        .json(
          successResponse('Returned Response - Tag Updated', res.data),
        )
    })
    .catch((res) => {
      //HANDLE INTERNAL SERVER ERROR
      logger.error(
        'Internal Server Error - Tag Updation unsuccessfull ' + res,
      )
      return response.status(500).json(errorResponse('Internal Server Error'))
    })
})

// EXPORT MODULE
module.exports = router
