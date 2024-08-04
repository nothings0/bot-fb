const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const PAGE_ACCESS_TOKEN = "YOUR_PAGE_ACCESS_TOKEN";

app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  let body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

app.get("/webhook", (req, res) => {
  let VERIFY_TOKEN = "nothings0";
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

function handleMessage(sender_psid, received_message) {
  let response;

  if (received_message.text) {
    response = {
      text: `You sent the message: "${received_message.text}". Now send me an image!`,
    };
  }

  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  axios
    .post(
      `https://graph.facebook.com/v13.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: sender_psid },
        message: response,
      }
    )
    .then((response) => {
      console.log("Message sent!");
    })
    .catch((error) => {
      console.error("Unable to send message:", error);
    });
}

app.listen(1337, () => console.log("webhook is listening"));
