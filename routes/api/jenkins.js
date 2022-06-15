
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();

// Trigger Job API
router.post('/jenkins',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.message) && (!request.body.description) && (!request.body.status)) {
        logger.error("Bad Request, Message, Description or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description or id not found"));
    }
    if ((!request.header("username")) && (!request.header("token")) && (!request.header("jenkinsURL")) && (!request.header("verbosity")) && (!request.header("id"))) {
        logger.error("Bad Request, jenkinsURL, username, token, verbosity or Id Not Found");
        return response.status(400).json(errorResponse("Bad Request, idList, key or token Not Found"));
    }
    await axios({
      method: 'post',
      url: request.header("jenkinsURL")+ "/job/JOB_NAME/buildWithParameters",
      auth: {
        username: request.header("username"),
        password: request.header("token")
      },
      data : {
        id : request.header("id"),
        verbosity : request.header("verbosity")
      }
      })
      .then((res) => {
          //HANDLE SUCCESS
          logger.info("Returned Response - Jenkins Job Initiated");
          return response.status(200).json(successResponse("Returned Response - Jenkins Job Initiated",res.data));
      })
      .catch((err) => {
          //HANDLE INTERNAL SERVER ERROR
          logger.error("Internal Server Error - Jenkins Job Initiation unsuccessfull " + err);
          return response.status(500).json(errorResponse("Internal Server Error"));
      });
})

// EXPORT MODULE
module.exports = router;