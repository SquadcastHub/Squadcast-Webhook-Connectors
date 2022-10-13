
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.telegram_bot_token, {polling: true});

// Telegram Bot API
router.post('/telegram',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.data.resource_data.message) && (!request.body.data.resource_data.description) && (!request.body.data.resource_data.status)) {
        logger.error("Bad Request, Message, Description or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description or id not found"));
    }
    if ((!request.header("chatId")) && (!request.header("token"))) {
        logger.error("Bad Request, chatId or token Not Found");
        return response.status(400).json(errorResponse("Bad Request, chatId or token Not Found"));
    }
    bot.sendMessage(request.header("chatId"), 
        "Incident Name : " + request.body.data.resource_data.message + "\n\n" + "Incident State : " + request.body.data.resource_data.status + "\n\n" 
        + "Description : " + request.body.data.resource_data.description + "\n\n" 
        + "Incident Link : " + request.body.data.resource_data.url)
    .then((res) => {
        //HANDLE SUCCESS
        logger.info("Returned Response - Telegram Bot - Message Sent");
        return response.status(200).json(successResponse("Returned Response - Telegram Bot - Message Sent",res.data));
    })
    .catch((err) => {
        //HANDLE INTERNAL SERVER ERROR
        logger.error("Internal Server Error - Telegram Bot - Message Sending Unsuccessfull" + err);
        return response.status(500).json(errorResponse("Internal Server Error"));
    });
})

// EXPORT MODULE
module.exports = router;