
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");

// ROUTER INITIALIZATION
const router = require("express").Router();
const qs = require('qs');

// Create Topic API
router.post('/zulip',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.message) && (!request.body.description) && (!request.body.id)) {
        logger.error("Bad Request, Message, Description or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description or id not found"));
    }
    if ((!request.header("stream")) && (!request.header("username")) && (!request.header("password"))) {
        logger.error("Bad Request, Stream/username/password information not found");
        return response.status(400).json(errorResponse("Bad Request, Stream information not found"));
    }
    let incidentURL = "https://app.squadcast.com/incident/"+request.body.id
    // Send a Stream message
    let data = qs.stringify({
        'type': 'stream',
        'to': request.header("stream"),
        'topic': request.body.id,
        'content': "[#"+request.body.id+"]("+incidentURL+")"
                    +"\n\n"+request.body.message
                    + "\n\n"+"**Incident Status : **"+request.body.status
                    + "\n\n"+"**Incident Description :-** \n" 
                    + request.body.description
      });
    let subdomain = request.header("username").split('@').pop()
    await axios({
        method: "post",
        url: "https://" + subdomain + "/api/v1/messages",
        auth: {
            username: request.header("username"),
            password: request.header("password")
        },
        data : data
        })
        .then((res) => {
            //HANDLE SUCCESS
            logger.info("Returned Response - Zulip - Stream created");
            return response.status(200).json(successResponse("Returned Response - Zulip - Stream created",res.data));
        })
        .catch((err) => {
            //HANDLE INTERNAL SERVER ERROR
            logger.error("Internal Server Error - Zulip - Stream creation unsuccessfull " + err);
            return response.status(500).json(errorResponse("Internal Server Error"));
        });
})

// EXPORT MODULE
module.exports = router;