
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();

// Create Incident API
router.post('/servicenow',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.data.resource_data.message) && (!request.body.data.resource_data.description) && (!request.body.data.resource_data.id)) {
        logger.error("Bad Request, Message, Description or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description or id not found"));
    }
    if ((!request.header("subdomain")) && (!request.header("username")) && (!request.header("password")) 
        && (!request.header("urgency")) && (!request.header("impact"))) {
      logger.error("Bad Request, assignment_group/username/password/urgency/impact information not found");
      return response.status(400).json(errorResponse("Bad Request, username/password/urgency/impact information not found"));
    }
    if (!request.header("assignment_group")) {
      incidentData = {
        'urgency': request.header("urgency"),
        'impact': request.header("impact"),
        'short_description': "**"+request.body.data.resource_data.message+"**" 
                    + "\n\n"+"**Incident Description :-** \n" 
                    + request.body.data.resource_data.description
      };
    } 
    else {
      incidentData = {
        'assignment_group': request.header("assignment_group"),
        'urgency': request.header("urgency"),
        'impact': request.header("impact"),
        'short_description': "**"+request.body.data.resource_data.message+"**" 
                    + "\n\n"+"**Incident Description :-** \n" 
                    + request.body.data.resource_data.description
                    + "\n\n"+"**Incident URL : **"
                    + request.body.data.resource_data.url
      };
    }
    await axios({
      method: "post",
      url: "https://" + request.header("subdomain") + "/api/now/table/incident",
      auth: {
          username: request.header("username"),
          password: request.header("password")
      },
      data : incidentData
      })
      .then((res) => {
          //HANDLE SUCCESS
          logger.info("Returned Response - ServiceNow - Incident created");
          return response.status(200).json(successResponse("Returned Response - ServiceNow - Incident created",res.data));
      })
      .catch((err) => {
          //HANDLE INTERNAL SERVER ERROR
          logger.error("Internal Server Error - ServiceNow - Incident creation unsuccessfull " + err);
          return response.status(500).json(errorResponse("Internal Server Error"));
      });
})

// EXPORT MODULE
module.exports = router;