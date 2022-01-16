/**
 * Flattens a double-nested array into a simple array
 * @param arr double-nested array to be flattene
 * @returns simple array
 */
export function arrayFlatening(arr: Array<Array<any>>): Array<any> {
  const output: Array<any> = []

  arr.forEach(_arr => {
    _arr.forEach(el => {
      output.push(el)
    })
  })

  return output
}