/* global __dirname */

require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT
const path = require('path')

const v1 = require('./versions/v1/main.js')

app.use(express.static('.', {
  extensions: ['html', 'xml', 'json']
}))
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/page.html'))
})

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', '*')
  next()
})

app.use('/v1', v1)

app.listen(port, () => {
  console.log(`API started at http://localhost:${port}`)
})