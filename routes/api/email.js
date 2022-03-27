
// IMPORTS
const axios = require("axios");
const authV1 = require("../../middlewares/v1/auth");
// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
// ROUTER INITIALIZATION
const router = require("express").Router();
var nodemailer = require('nodemailer');

// Email API
router.post('/email',authV1.auth, async (request, response) => {
    //HANDLE BAD REQUEST
    if ((!request.body.message) && (!request.body.description) && (!request.body.status)) {
        logger.error("Bad Request, Message, Description or id not found");
        return response.status(400).json(errorResponse("Bad Request, Message, Description or id not found"));
    }
    if ((!request.header("from_email")) && (!request.header("from_password")) && (!request.header("to_email"))) {
      logger.error("Email or Password Not Found");
      return response.status(400).json(errorResponse("Bad Request, Email or Password Not Found"));
    }
    var from_email = request.header("from_email");
    var from_pass = request.header("from_password");
    var to_email = request.header("to_email");
    var transporter = nodemailer.createTransport({
        service: request.header("SMTP"),
        auth: {
          user: from_email,
          pass: from_pass
        }
      });
      
    var mailOptions = {
        from: from_email,
        to: to_email,
        subject: "Incident : " + request.body.message + " is " + request.body.status,
        text: request.body.description
      };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            //HANDLE INTERNAL SERVER ERROR
            logger.error("Internal Server Error - Email Sent Unsuccessfull " + error);
            return response.status(500).json(errorResponse("Internal Server Error"));
        } else {
            console.log('Email sent: ' + info.response);
            //HANDLE SUCCESS
            logger.info("Returned Response - Email Sent Successfully");
            return response.status(200).json(successResponse("Email Sent Successfully",res.data));
        }
      });
})

// EXPORT MODULE
module.exports = router;