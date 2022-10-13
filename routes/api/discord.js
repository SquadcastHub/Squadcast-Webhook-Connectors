
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
    if ((!request.body.data.resource_data.message) && (!request.body.data.resource_data.description) && (!request.body.data.resource_data.status) && (!request.body.data.resource_data.id)) {
        logger.error("Bad Request, Message, Description, Status or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description, Status or id not found"));
    }
    if ((!request.header("1"))) {
        logger.error("Bad Request, Discord URL not found");
        return response.status(400).json(errorResponse("Bad Request, Discord URL not found"));
    }
    var count = 1;
    var resp = title = color = "";
    url = request.body.data.resource_data.url;
    if (request.body.event.type == "incident.resolved") {
        title = "**Resolved **"+"[**#"+request.body.data.resource_data.id+"**]("+url+")\n";
        color = "2219410";
    }
    else if (request.body.event.type == "incident.reassigned") {
        title = "**Reassigned **"+"[**#"+request.body.data.resource_data.id+"**]("+url+")\n";
        color = "10027238";
    }
    else if (request.body.event.type == "incident.acknowledged") {
        title = "**Acknowledged **"+"[**#"+request.body.data.resource_data.id+"**]("+url+")\n";
        color = "14804480";
    }
    else if (request.body.event.type == "incident.triggered") {
        title = "**Triggered **"+"[**#"+request.body.data.resource_data.id+"**]("+url+")\n";
        color = "10027238";
    }
    while(true){
        currenturl = request.header(count.toString());
        if (currenturl !== undefined) {
            var discordData = {
                "embeds": [{
                  "color" : color,
                  "description": (title+request.body.data.resource_data.message).replace(/\n+/g, "\n")
                  +"\n\n**Incident State** : " + request.body.data.resource_data.status + "\n" 
                  + "**Service Name** : " + request.body.data.resource_data.service.name + "\n"
                  + "**Alert Source** : " + request.body.data.resource_data.alert_source.type + "\n\n"
                  + "**Description** : " + request.body.data.resource_data.description + "\n"
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