
const metrics = { }

metrics.length = {
  description: 'measure the length of an array',
  definition (val) {
    return val.length
  }
}

metrics.cardinality = {
  description: 'measure the cardinality (number of unique values) in a set or array',
  defintiion (val) {
    if (Array.isArray(val)) {
      return (new Set(val)).size
    } else if (val.size) {
      return val.size
    }
  }
}

module.exports = metrics
