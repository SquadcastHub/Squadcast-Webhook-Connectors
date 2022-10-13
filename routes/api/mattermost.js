
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");

// ROUTER INITIALIZATION
const router = require("express").Router();

// Send Message API
router.post('/mattermost',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.message) && (!request.body.description) && (!request.body.id)) {
        logger.error("Bad Request, Message, Description or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description or id not found"));
    }
    if ((!request.header("webhook"))) {
        logger.error("Bad Request, webhook information not found");
        return response.status(400).json(errorResponse("Bad Request, webhook information not found"));
    }
    await axios({
        method: "post",
        url: request.header("webhook"),
        headers: {
            'Content-Type': 'application/json'
          },
        data: {
            "text": "<!channel>\n#### ["+request.body.message
            +"](https://app.squadcast.com/incident/"+request.body.id
            +")\n"+"\n\n**Incident State** : " + request.body.status + "\n" 
            + "**Service Name** : " + request.body.service.name + "\n"
            + "**Alert Source** : " + request.body.alert_source.type + "\n\n"
            + "**Description** :-\n" + request.body.description + "\n"
        }
        })
        .then((res) => {
            //HANDLE SUCCESS
            logger.info("Returned Response - MatterMost - Message Sent");
            return response.status(200).json(successResponse("Returned Response - MatterMost - Message Sent",res.data));
        })
        .catch((err) => {
            //HANDLE INTERNAL SERVER ERROR
            logger.error("Internal Server Error - MatterMost - Message Sending unsuccessfull " + err);
            return response.status(500).json(errorResponse("Internal Server Error"));
        });
})

// EXPORT MODULE
module.exports = router;