const express = require('express')
const bodyparser = require('body-parser')

const connectDb = require('./db')
const userRouter = require('./controllers/user.controller')
const {errorHandler} = require('./middlewares')

const app = express()

app.use(bodyparser.json())
app.use('/api/user', userRouter)
app.use(errorHandler)

connectDb()
    .then(() => {
        console.log('db connected successfully!')
        app.listen(3000, () => console.log('server started at 3000'))
    })
    .catch(err => console.log(err))