
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();

// Discord channel API
router.post('/discord',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.message) && (!request.body.description) && (!request.body.status) && (!request.body.id)) {
        logger.error("Bad Request, Message, Description, Status or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description, Status or id not found"));
    }
    if ((!request.header("1"))) {
        logger.error("Bad Request, Discord URL not found");
        return response.status(400).json(errorResponse("Bad Request, Discord URL not found"));
    }
    var count = 1;
    var resp = title = color = "";
    url = "https://app.squadcast.com/incident/" + request.body.id
    if (request.body.event_type == "incident_resolved") {
        title = "**Resolved **"+"[**#"+request.body.id+"**]("+url+")\n";
        color = "2219410";
    }
    else if (request.body.event_type == "incident_reassigned") {
        title = "**Reassigned **"+"[**#"+request.body.id+"**]("+url+")\n";
        color = "10027238";
    }
    else if (request.body.event_type == "incident_acknowledged") {
        title = "**Acknowledged **"+"[**#"+request.body.id+"**]("+url+")\n";
        color = "14804480";
    }
    else if (request.body.event_type == "incident_triggered") {
        title = "**Triggered **"+"[**#"+request.body.id+"**]("+url+")\n";
        color = "10027238";
    }
    while(true){
        currenturl = request.header(count.toString());
        if (currenturl !== undefined) {
            var discordData = {
                "embeds": [{
                  "color" : color,
                  "description": (title+request.body.message).replace(/\n+/g, "\n")
                  +"\n\n**Incident State** : " + request.body.status + "\n" 
                  + "**Service Name** : " + request.body.service.name + "\n"
                  + "**Alert Source** : " + request.body.alert_source.type + "\n\n"
                  + "**Description** : " + request.body.description + "\n"
                }]
            }
            await axios({
                method: 'post',
                url: currenturl.trim(),
                data: discordData,
                })
                .then((res) => {
                    //HANDLE SUCCESS
                    resp = res.data;
                    logger.info("Returned Response - Discord Channel");
                })
                .catch((err) => {
                    //HANDLE INTERNAL SERVER ERROR
                    logger.error("Internal Server Error - Discord Channel " + err);
                    return response.status(500).json(errorResponse("Internal Server Error"));
                });
                count = count+1;
        }else{break;}
    }
    return response.status(200).json(successResponse("Message Sent Successfully",resp));
})

// EXPORT MODULE
module.exports = router;