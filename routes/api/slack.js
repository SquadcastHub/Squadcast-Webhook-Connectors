
// IMPORTS
const axios = require("axios");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();

// Slack channel API
router.post('/slack', async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.message) && (!request.body.description) && (!request.body.status) && (!request.body.id)) {
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
    if (request.body.event_type == "incident_resolved") {
        title = "<" + "https://app.squadcast.com/incident/" + request.body.id + "|*Resolved #" + request.body.id + "*>\n"
    }
    else if (request.body.event_type == "incident_reassigned") {
        title = "<" + "https://app.squadcast.com/incident/" + request.body.id + "|*Reassigned #" + request.body.id + "*>\n"
    }
    else if (request.body.event_type == "incident_acknowledged") {
        title = "<" + "https://app.squadcast.com/incident/" + request.body.id + "|*Acknowledged #" + request.body.id + "*>\n"
    }
    else if (request.body.event_type == "incident_triggered") {
        title = "<" + "https://app.squadcast.com/incident/" + request.body.id + "|*Triggered #" + request.body.id + "*>\n"
    }
    while(true){
        currenturl = request.header(count.toString());
        if (currenturl !== undefined) {
            var slackData = { "text" : "\n-------------------------------------\n" 
                + title
                + "*Incident Name* : " + request.body.message 
                + "\n" + "*Incident State* : " + request.body.status + "\n" 
                + "*Service Name* : " + request.body.service.name + "\n"
                + "*Alert soure* : " + request.body.alert_source.type + "\n\n"
                + "*Description* : " + request.body.description + "\n" 
                + "\n-------------------------------------\n"}
            await axios({
                method: 'post',
                url: currenturl,
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