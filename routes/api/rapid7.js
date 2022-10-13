
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();

// Change Escalation Policy API
router.post('/rapid7',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.data.resource_data.message) && (!request.body.data.resource_data.description) && (!request.body.data.resource_data.status)) {
        logger.error("Bad Request, Message, Description or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description or id not found"));
    }
    if ((!request.header("region")) && (!request.header("x-refresh-token")) && (!request.header("reassignId")) && (!request.header("reassignType"))) {
        logger.error("Bad Request; region, x-refresh-token, reassignType & reassignId not found");
        return response.status(400).json(errorResponse("Bad Request; region, x-refresh-token, reassignType & reassignId not found"));
    }
    var token = "";
    await axios({
      method: 'get',
      url: "https://"+request.header("region")+".api.insight.rapid7.com/idr/v2/investigations/"+request.body.data.resource_data.event_payload.investigationId,
      headers:{
        "Accept-version" : "investigations-preview",
        "X-Api-Key" : request.header("x-api-key")
      }
      })
      .then((res) => {
          //HANDLE SUCCESS
          var priority = res.data.priority;
          console.log("Priority : "+ priority);
          if ( (priority !== "CRITICAL") && (priority !== "HIGH")) {
            logger.info("Returned Response - Investigation Priority Low");
            return response.status(200).json(successResponse("Returned Response - Investigation Priority Low",res.data));
          }
          axios({
            method: 'get',
            url: "https://auth.squadcast.com/oauth/access-token",
            headers:{
              "X-Refresh-Token" : request.header("x-refresh-token")
            }
            })
            .then((resp) => {
                //HANDLE SUCCESS
                token = resp.data.data.access_token;
                axios({
                    method: 'put',
                    url: "https://api.squadcast.com/v3/incidents/"+request.body.data.resource_data.id+"/tags",
                    headers: {"Authorization" : `Bearer ${token}`},
                    data: {
                        "tags": {
                            "priority": {
                                "value": priority,
                                "color": "#0f61dd"
                            }
                        }
                    }
                    })
                    .then((responseData) => {
                        axios({
                            method: 'post',
                            url: "https://platform-backend.squadcast.com/v2/organizations/"+request.body.data.organization.id+"/incidents/"+request.body.data.resource_data.id+"/reassign",
                            headers: {"Authorization" : `Bearer ${token}`},
                            data: {
                                "reassignTo": {
                                    "id": request.header("reassignId"),
                                    "type": request.header("reassignType")
                                }
                            }
                            })
                            .then((respData) => {
                                //HANDLE SUCCESS
                                logger.info("Returned Response - Update Escalation Policy Successfull");
                                return response.status(200).json(successResponse("Returned Response - Update Escalation Policy Successfull",respData.data));
                            })
                            .catch((errrrr) => {
                                //HANDLE INTERNAL SERVER ERROR
                                logger.error("Internal Server Error - Update Escalation Policy API unsuccessfull " + errrrr);
                                return response.status(500).json(errorResponse("Internal Server Error - Update Escalation Policy API unsuccessfull"));
                            });
                    })
                    .catch((errrr) => {
                        //HANDLE INTERNAL SERVER ERROR
                        logger.error("Internal Server Error - Update Tags API unsuccessfull " + errrr);
                        return response.status(500).json(errorResponse("Internal Server Error - Update Tags API unsuccessfull"));
                    });
            })
            .catch((errr) => {
                //HANDLE INTERNAL SERVER ERROR
                logger.error("Internal Server Error - Access Token API Error " + errr);
                return response.status(500).json(errorResponse("Internal Server Error - Access Token API Error"));
            });
      })
      .catch((err) => {
          //HANDLE INTERNAL SERVER ERROR
          logger.error("Internal Server Error - GET Investigation API unsuccessfull " + err);
          return response.status(500).json(errorResponse("Internal Server Error - GET Investigation API unsuccessfull"));
      });
})

// EXPORT MODULE
module.exports = router;