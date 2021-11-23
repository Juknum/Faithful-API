/* global __dirname */

require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT

const v1 = require('./versions/v1/main.js')

app.get('/', (req, res) => {
  res.send('Welcome to the Official Compliance API!')
})

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', '*')
  next()
})

app.use('/v1', v1)

app.listen(port, () => {
  console.log(`API started at http://localhost:${port}`)
})