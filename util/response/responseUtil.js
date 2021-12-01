
// ERROR RESPONSE FUNCTION
function errorResponse(message) {
    return { "status": "error", "message": message };
}

// SUCCESS RESPONSE FUNCTION
function successResponse(message, data) {
    return { "status": "success", "message": message, "data": data };
}

// EXPORT MODULE
module.exports = {
    errorResponse,
    successResponse
};
