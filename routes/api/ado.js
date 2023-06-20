
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();

// Create Card API
router.post('/ado',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.header("api-version")) && (!request.header("service")) && (!request.header("Authorization")) && (!request.header("Content-Type"))) {
        logger.error("Bad Request, api-version, service, Authorization or Content-Type Not Found");
        return response.status(400).json(errorResponse("Bad Request, api-version, service, Authorization or Content-Type Not Found"));
    }
    await axios({
      method: 'post',
      url: process.env.adoURL + request.header("service") + _apis/wit/workitems + $issue,
      headers: {
        'Authorization': request.header("Authorization"),
        'Content-Type': 'application/json-patch+json',
        'service': request.header("service")
      },
      params : {
        'api-version' : request.header("api-version"),
      }
      })
      .then((res) => {
          //HANDLE SUCCESS
          logger.info("Returned Response - ADO WorkItem created");
          return response.status(200).json(successResponse("Returned Response - ADO WorkItem created",res.data));
      })
      .catch((err) => {
          //HANDLE INTERNAL SERVER ERROR
          logger.error("Internal Server Error - ADO WorkItem unsuccessfull " + err);
          return response.status(500).json(errorResponse("Internal Server Error"));
      });
})

// EXPORT MODULE
module.exports = router;
