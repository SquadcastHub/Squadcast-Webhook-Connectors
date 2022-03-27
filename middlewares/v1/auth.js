// UTILITIES
const logger = require("../../util/logger/loggerUtil");
const { errorResponse, successResponse } = require("../../util/response/responseUtil");
const { v4: uuidv4 } = require('uuid');
var authKey = "";

auth = async (request, response, next) => {
    try {
        if (request.header("authKey") != authKey) {
            logger.error("Bad Request, Authentication Error");
            return response.status(401).json(errorResponse("Bad Request, authKey does not match"));
        }
        next();
    }
    catch (err) {
          //HANDLE INTERNAL SERVER ERROR
          logger.error("Internal Server Error - Authentication " + err);
          return response.status(500).json(errorResponse("Internal Server Error"));
    }
}

generate = () => { 
    authKey = uuidv4();
    return authKey;
}

module.exports =  {
    auth,
    generate
};