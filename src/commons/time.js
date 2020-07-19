
const time = {}

time.hrDiffToSeconds = diff => {
  return diff[0] * 1e9 + diff[1]
}

module.exports = time
