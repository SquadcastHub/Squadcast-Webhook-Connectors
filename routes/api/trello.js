
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();

// Create Card API
router.post('/trello',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.message) && (!request.body.description) && (!request.body.status)) {
        logger.error("Bad Request, Message, Description or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description or id not found"));
    }
    if ((!request.header("idList")) && (!request.header("key")) && (!request.header("token"))) {
        logger.error("Bad Request, idList, key or token Not Found");
        return response.status(400).json(errorResponse("Bad Request, idList, key or token Not Found"));
    }
    await axios({
      method: 'post',
      url: process.env.trelloURL,
      params : {
        idList : request.header("idList"),
        key : request.header("key"),
        token : request.header("token"),
        name : request.body.message,
        desc : request.body.description
      }
      })
      .then((res) => {
          //HANDLE SUCCESS
          logger.info("Returned Response - Trello Card created");
          return response.status(200).json(successResponse("Returned Response - Trello Card created",res.data));
      })
      .catch((err) => {
          //HANDLE INTERNAL SERVER ERROR
          logger.error("Internal Server Error - Trello Card creation unsuccessfull " + err);
          return response.status(500).json(errorResponse("Internal Server Error"));
      });
})

// EXPORT MODULE
module.exports = router;