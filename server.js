import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import moment from 'moment'
dotenv.config()

const app = express()
app.use(morgan('tiny'))
app.use(cors('*'))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('M-PESA Integration Project')
})

app.get('/', function (req, res) {
    res.send('Sorry, Page not found !')
})

app.post('/api/v1/mpesa/stk-push', async (req, res) => {
    try {
        if (!req.body.phone_number) {
            return res.status(400).json({ success: false, message: 'phone_number is required !' })
        }
        if (!req.body.amount) {
            return res.status(400).json({ success: false, message: 'amount is required !' })
        }
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const response = await fetch(`${process.env.MPESA_HOST_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
            method: 'get',
            headers: {'Authorization': `Basic ${new Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64')}`}
        });
        const { access_token } = await response.json();
        const stk_response = await fetch(`${process.env.MPESA_HOST_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                BusinessShortCode: parseInt(process.env.MPESA_SHORT_CODE),
                Password: new Buffer.from(`${process.env.MPESA_SHORT_CODE}${process.env.MPESA_PARSE_KEY}${timestamp}`).toString('base64'),
                Timestamp: `${timestamp}`,
                TransactionType: "CustomerPayBillOnline",
                Amount: parseInt(req.body.amount),
                PartyA: req.body.phone_number,
                PartyB: parseInt(process.env.MPESA_SHORT_CODE),
                PhoneNumber: req.body.phone_number,
                CallBackURL: `${process.env.MPESA_CALLbACK}`,
                AccountReference: "Test",
                TransactionDesc: "Test",
            })
        });
        const data = await stk_response.json();
        res.status(200).json({ success: true, message: 'Mpesa STK Push', data })
    } catch (error) {
        res.status(400).json({ success: false, message: 'Sorry, an error occurred !', error })
    }
});

app.post('/api/v1/mpesa/stk-callback', async (req, res) => {
    try {
        console.log(req.body)
    } catch (error) {
        res.status(400).json({ success: false, message: 'Sorry, an error occurred !', error })
    }
})

app.listen(process.env.PORT, () => console.log(`Server listening in port ${process.env.PORT}`))