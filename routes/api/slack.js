
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();

// Slack channel API
router.post('/slack',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.data.resource_data.message) && (!request.body.data.resource_data.description) && (!request.body.data.resource_data.status) && (!request.body.data.resource_data.id)) {
        logger.error("Bad Request, Message, Description, Status or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description, Status or id not found"));
    }
    if ((!request.header("1"))) {
        logger.error("Bad Request, Slack URL not found");
        return response.status(400).json(errorResponse("Bad Request, Slack URL not found"));
    }
    var count = 1;
    var resp = "";
    var title = "";
    if (request.body.event.type == "incident.resolved") {
        title = "<" + request.body.data.resource_data.url + "|*Resolved #" + request.body.data.resource_data.id + "*>\n"
    }
    else if (request.body.event.type == "incident.reassigned") {
        title = "<" + request.body.data.resource_data.url + "|*Reassigned #" + request.body.data.resource_data.id + "*>\n"
    }
    else if (request.body.event.type == "incident.acknowledged") {
        title = "<" + request.body.data.resource_data.url + "|*Acknowledged #" + request.body.data.resource_data.id + "*>\n"
    }
    else if (request.body.event.type == "incident.triggered") {
        title = "<" + request.body.data.resource_data.url + "|*Triggered #" + request.body.data.resource_data.id + "*>\n"
    }
    while(true){
        currenturl = request.header(count.toString());
        if (currenturl !== undefined) {
            var slackData = { "text" : "\n-------------------------------------\n" 
                + title
                + "*Incident Name* : " + request.body.data.resource_data.message 
                + "\n" + "*Incident State* : " + request.body.data.resource_data.status + "\n" 
                + "*Service Name* : " + request.body.data.resource_data.service.name + "\n"
                + "*Alert Source* : " + request.body.data.resource_data.alert_source.type + "\n\n"
                + "*Description* : " + request.body.data.resource_data.description + "\n" 
                + "\n-------------------------------------\n"}
            await axios({
                method: 'post',
                url: currenturl.trim(),
                data: slackData,
                })
                .then((res) => {
                    //HANDLE SUCCESS
                    resp = res.data;
                    logger.info("Returned Response - Slack Channel");
                })
                .catch((err) => {
                    //HANDLE INTERNAL SERVER ERROR
                    logger.error("Internal Server Error - Slack Channel " + err);
                    return response.status(500).json(errorResponse("Internal Server Error"));
                });
                count = count+1;
        }else{break;}
    }
    return response.status(200).json(successResponse("Message Sent Successfully",resp));
})

// EXPORT MODULE
module.exports = router;