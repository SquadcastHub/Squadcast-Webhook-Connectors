
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();

// Create TASK API
router.post('/jira',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.message) && (!request.body.description) && (!request.body.id)) {
        logger.error("Bad Request, Message, Description or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description or id not found"));
    }
    if ((!request.header("email")) && (!request.header("token")) && (!request.header("priority")) && (!request.header("domain"))) {
        logger.error("Bad Request, listId, Priority or Token Not Found");
        return response.status(400).json(errorResponse("Bad Request, listId, Priority or Token Not Found"));
    }
    await axios({
      method: 'post',
      url: "https://"+request.header("domain")+".atlassian.net/rest/api/3/issue",
      headers: {
        "Authorization": `Basic ${Buffer.from(request.header("email")+":"+request.header("token")).toString('base64')}`,
        "Accept": 'application/json',
        "Content-Type": 'application/json'
      },
      data: {
        "fields": {
           "project":
           {
              "key": "TEST"
           },
           "summary": request.body.message,
           "description": request.body.description,
           "issuetype": {
              "name": "Bug"
           },
           "priority": {
            "name": request.header("priority")
           }
        }
      }})
      .then((res) => {
          //HANDLE SUCCESS
          logger.info("Returned Response - JIRA - Issue created");
          return response.status(200).json(successResponse("Returned Response - JIRA - Issue created",res.data));
      })
      .catch((err) => {
          //HANDLE INTERNAL SERVER ERROR
          logger.error("Internal Server Error - JIRA - Issue creation unsuccessfull " + err);
          return response.status(500).json(errorResponse("Internal Server Error"));
      });
})

// EXPORT MODULE
module.exports = router;