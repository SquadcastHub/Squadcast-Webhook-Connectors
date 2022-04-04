
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");

// Linear INITIALIZATION
const { LinearClient } = require("@linear/sdk");
const client1 = new LinearClient({
    apiKey: process.env.linearAPIKey
  })
var priority = 0;

// ROUTER INITIALIZATION
const router = require("express").Router();

// Create Issue API
router.post('/linear',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.message) && (!request.body.description) && (!request.body.id)) {
        logger.error("Bad Request, Message, Description or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description or id not found"));
    }
    if ((request.header("priority"))) {
        if ((parseInt(request.header("priority")) < 5) && (parseInt(request.header("priority")) > -1)) {
            priority = parseInt(request.header("priority"));
        }
        else {
            logger.error("Bad Request, Priority must be greater than -1 and must not be greater than 4");
            return response.status(400).json(errorResponse("Bad Request, Priority must be greater than -1 and must not be greater than 4"));
        }
    }
    const teams = await client1.teams();
    const team = teams.nodes[0];
    if (team.id) {
        await client1.issueCreate({ teamId: team.id, title: request.body.message, description: request.body.description, priority: priority })
        .then((res) => {
            //HANDLE SUCCESS
            logger.info("Returned Response - Linear - Issue created");
            return response.status(200).json(successResponse("Returned Response - Linear - Issue created",res.data));
        })
        .catch((err) => {
            //HANDLE INTERNAL SERVER ERROR
            logger.error("Internal Server Error - Linear - Issue creation unsuccessfull " + err);
            return response.status(500).json(errorResponse("Internal Server Error"));
        });
    }
})

// EXPORT MODULE
module.exports = router;