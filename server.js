const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config()

app.use(morgan('tiny'))
app.use(cors('*'))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('M-PESA Integration Project')
})

app.listen(process.env.PORT, () => console.log(`Server listening in port ${process.env.PORT}`))