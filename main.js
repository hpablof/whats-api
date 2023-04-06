const express = require('express')
const bodyParser = require('body-parser')
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express()
app.use(bodyParser.json())
const port = 3000

const client = new Client();
client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});
client.on('ready', () => {
    console.log('Client Whatsapp is ready!');
    app.listen(port, () => {
        console.log(`Whatsapp API listening on port ${port}`)
    })
});
client.initialize();

const asyncHandler = (fun) => (req, res, next) => {
    Promise.resolve(fun(req, res, next))
      .catch(next)
  }

// ENPOINTS
app.get('/', (req, res) => {
  res.send('Whats-API!')
})

app.post('/send-alert', asyncHandler(
    async (req, res) => {
        const number = req.body.number;
        const message = req.body.message;

        const sanitized_number = number.toString().replace(/[- )(]/g, "");
        const final_number = `591${sanitized_number.substring(sanitized_number.length - 10)}`;

        const number_details = await client.getNumberId(final_number);

        if (number_details) {
            const sendMessageData = await client.sendMessage(number_details._serialized, message); // send message
            res.
                status(200)
                .send(sendMessageData)
        } else {
            res
                .status(409)
                .send({message: "Mobile number is not registered"});
        }
    }
))
