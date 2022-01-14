const success = (res) => {
  return (data) => {
    res.status(200)
    res.json(data)
    res.end()
  }
}

module.exports = success