// IMPORTS
const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs")

// DEFINING ENVIRONMENT CONFIG
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

//OPTIONS
const options = {
    key: fs.readFileSync("./certs/private-key.pem"),
    cert: fs.readFileSync("./certs/public-cert.pem")
};

// ROUTES
const slackRouter = require("./routes/api/slack");
app.use('/squadcast/connector', slackRouter);
const emailRouter = require("./routes/api/email");
app.use('/squadcast/connector', emailRouter);
const trelloRouter = require("./routes/api/trello");
app.use('/squadcast/connector', trelloRouter);
const clickUpRouter = require("./routes/api/clickUp");
app.use('/squadcast/connector', clickUpRouter);
const discordRouter = require("./routes/api/discord");
app.use('/squadcast/connector', discordRouter);
if( process.env.telegram_bot_start.toLowerCase() == "yes") {
    const telegramRouter = require("./routes/api/telegram");
    app.use('/squadcast/connector', telegramRouter);
}

// HTTPS SERVER
const port = process.env.PORT;
https.createServer(options, app).listen(port, () => {
    console.log("Squadcast - Webhooks - Connectors - HTTPS Server is running on port:" + port);
});