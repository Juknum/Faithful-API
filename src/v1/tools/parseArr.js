const parseArr = (arr) => {
  const output = {}
  let count = 0

  arr.forEach(el => {
    if (el.id) {
      const id = el.id
      delete el.id
      output[id ? id : count++] = el
    }

    else {
      const keys = Object.keys(el)
      keys.forEach(key => {
        output[key] = el[key]
      })
    }
  })

  return output
}

module.exports = parseArr