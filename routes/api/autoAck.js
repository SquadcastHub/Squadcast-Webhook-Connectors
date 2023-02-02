const axios = require('axios')
const authV1 = require('../../middlewares/v1/auth')
const logger = require('../../util/logger/loggerUtil')
const {
  errorResponse,
  successResponse,
} = require('../../util/response/responseUtil')
const router = require('express').Router()

router.post('/autoAck', authV1.auth, async (request, response) => {
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
  let statuss = request.body.data.resource_data.event_payload.status
  let serviceId = request.body.data.resource_data.service.id
  let ownerId = request.body.data.resource_data.owner.id
  let alertSourceId = request.body.data.resource_data.alert_source.id
  let end_time = new Date(request.body.data.resource_data.created_at)
  let start_time = new Date(request.body.data.resource_data.created_at)
  let incidentId = request.body.data.resource_data.id
  let incidentMsg = request.body.data.resource_data.message
  start_time.setDate(start_time.getDate() - 2)
  let inc_status = 'triggered'
  let urll =
    'incidents/export/?start_time=' +
    start_time.toISOString() +
    '&end_time=' +
    end_time.toISOString() +
    '&status=' +
    inc_status +
    '&type=json&owner_id=' +
    ownerId +
    '&services=' +
    serviceId +
    '&sources=' +
    alertSourceId

  if (statuss === 'acknowledge') {
    let apiUrl = 'https://api.squadcast.com/v3/'
    let authApiUrl = 'https://auth.squadcast.com/oauth/access-token'
    if (!request.body.data.resource_data.url.includes('app.squadcast.com')) {
      apiUrl = 'https://api.eu.squadcast.com/v3/incidents/'
      authApiUrl = 'https://auth.eu.squadcast.com/oauth/access-token'
    }
    let config = {
      method: 'get',
      url: authApiUrl,
      headers: {
        'X-Refresh-Token': request.header('x-refresh-token'),
      },
    }
    const barer_token = await axios(config)
    const token = barer_token.data.data.access_token
    let config1 = {
      method: 'get',
      url: apiUrl + urll,
      headers: {
        Authorization: 'Bearer ' + token,
      },
    }
    let incidents_list = []
    try {
      const incidents = await axios(config1)
      incidents_list = incidents.data.incidents
    } catch (e) {
      if (e.response.data.hasOwnProperty('meta')) {
        if (
          e.response.data.meta.status == 400 &&
          e.response.data.meta.error_message ===
            'your query does not match any incidents. please tweak your query and try again'
        ) {
          console.log(e.response.data.meta.error_message)
          return response
            .status(400)
            .json(errorResponse('No open incident found for acknowledgement'))
        }
      }
    }
    if (incidents_list.length > 0) {
      for (let i = 0; i < incidents_list.length; i++) {
        if (
          incidents_list[i]['title'] === incidentMsg &&
          incidents_list[i]['id'] != incidentId
        ) {
          let ack_config = {
            method: 'post',
            url:
              apiUrl + 'incidents/' + incidents_list[i]['id'] + '/acknowledge',
            headers: {
              Authorization: 'Bearer ' + token,
            },
          }
          await axios(ack_config)
            .then((res) => {
              logger.info(
                'Incident acknowledged with Id:' + incidents_list[i]['id'],
              )
            })
            .catch((res) => {
              logger.error(
                'Internal Server Error - Incident acknowledgement unsuccessfull ' +
                  res,
              )
              return response
                .status(500)
                .json(errorResponse('Internal Server Error'))
            })
          let res_config = {
            method: 'post',
            url: apiUrl + 'incidents/' + incidentId + '/resolve',
            headers: {
              Authorization: 'Bearer ' + token,
            },
          }
          await axios(res_config)
            .then((res) => {
              logger.info('Incident resolved with Id:' + incidentId)
              return response
                .status(200)
                .json(
                  successResponse(
                    'Incident acknowledged with Id:' + incidents_list[i]['id'],
                  ),
                )
            })
            .catch((res) => {
              logger.error(
                'Internal Server Error - Incident resolve unsuccessfull ' + res,
              )
              return response
                .status(500)
                .json(errorResponse('Internal Server Error'))
            })
          console.log('found')
          return ''
        }
      }
    }
  } else {
    return response
      .status(500)
      .json(
        errorResponse(
          'this event is not processed since Event status is not acknowledge',
        ),
      )
  }
})
module.exports = router
