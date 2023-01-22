const express = require('express')
const router = require('./routes/user-routes')
// const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
require('dotenv').config()
const MONGODB_PASSWORD=process.env.MONGODB_PASSWORD
const MONGODB_USER=process.env.MONGODB_USER

const app = express()

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))
app.use(cookieParser())
app.use(express.json())
// app.use(bodyParser())

const mongoose = require('mongoose')

app.use('/api', router)

mongoose.set("strictQuery", true)

mongoose
    .connect(`mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@cluster0.ixzh7.mongodb.net/nalcapitalBase?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(5000)
        console.log('Database is connected! Listening to Localhost 5000')
    })
    .catch((err) => {
        console.log(err)
    })
