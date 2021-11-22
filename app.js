/* global __dirname */

require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('Welcome to the Official Compliance API!')
})

app.listen(port, () => {
  console.log(`API started at http://localhost:${port}`)
})