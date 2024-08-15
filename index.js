require('dotenv').config();
const twilio = require('twilio');
const cors = require('cors');
const express = require('express');
const http = require('http')
const app = express();
const socketIO = require("socket.io");
const port = process.env.PORT || 3000;

app.use(cors());
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_ID;
const client = new twilio(accountSid, authToken);

app.get('/', (req, res) =>
  res.send('Welcom to Verfication service!'),
)

app.get('/verify/:to', async (req, res) => {
  const to = req.params.to

  client.verify
    .services(serviceId)
    .verifications.create({ to, channel: 'sms' })
    .then((verification) => {
      res.json(verification)
    })
    .catch((err) => {
      res.json(err)
    })
})

app.get('/check/:to/:code', async (req, res) => {
  const to = req.params.to
  const code = req.params.code
  client.verify
    .services(serviceId)
    .verificationChecks.create({ to, code })
    .then((verification) => {
      res.json(verification)
    })
    .catch((err) => {
      res.json(err)
    })
})


const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("request:sent", (data) => {
    socket.broadcast.emit("request:recieved", data);
  })
})

console.log(port);
app.listen(port)