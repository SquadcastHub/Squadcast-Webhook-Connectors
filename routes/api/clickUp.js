
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();

// Create TASK API
router.post('/clickup',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.data.resource_data.message) && (!request.body.data.resource_data.description) && (!request.body.data.resource_data.id)) {
        logger.error("Bad Request, Message, Description or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description or id not found"));
    }
    if ((!request.header("listId")) && (!request.header("token")) && (!request.header("priority"))) {
        logger.error("Bad Request, listId, Priority or Token Not Found");
        return response.status(400).json(errorResponse("Bad Request, listId, Priority or Token Not Found"));
    }
    var date = new Date().getTime();
    await axios({
      method: 'post',
      url: process.env.clickUpURL + request.header("listId") + "/task",
      headers: {
        'Authorization': request.header("token"),
        'Content-Type': 'application/json'
      },
      data: {
            "name": request.body.data.resource_data.message,
            "description": request.body.data.resource_data.description +"\n"+ "Incident Link : " + request.body.data.resource_data.url,
            "assignees": [
            ],
            "tags": [],
            "status": "",
            "priority": request.header("priority"),
            "due_date": 0,
            "due_date_time": false,
            "time_estimate": 0,
            "start_date": date,
            "start_date_time": false,
            "notify_all": true,
            "parent": null,
            "links_to": null,
            "check_required_custom_fields": false
        }
      })
      .then((res) => {
          //HANDLE SUCCESS
          logger.info("Returned Response - Click Up - Task created");
          return response.status(200).json(successResponse("Returned Response - Click Up - Task created",res.data));
      })
      .catch((err) => {
          //HANDLE INTERNAL SERVER ERROR
          logger.error("Internal Server Error - Click Up - Task creation unsuccessfull " + err);
          return response.status(500).json(errorResponse("Internal Server Error"));
      });
})

// EXPORT MODULE
module.exports = router;