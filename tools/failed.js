const error = (res) => {
  return (err) => {
    const code = (err.response ? err.response.status : err.code) || 400
    const message = (err.response && err.response.data ? err.response.data.error : err.message) || err
    const stack = (process.env.VERBORSE ? err.stack ? err.stack : '' : '')

    if (process.env.VERBOSE) {
      console.error(code, message, stack)
    }

    res.status(code)
    res.json({ error: message, status: code, stack: stack })
    res.end()
  }
}

module.exports = error