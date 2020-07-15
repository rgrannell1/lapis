
class LapisBenchmark {
  constructor (metadata) {
    this.metadata = metadata
    this.measures = [ ]
  }
  cases (cases) {
    this.cases = cases
    return this
  }
  metrics (metrics) {
    this.metrics = metrics
    return this
  }
  measure (fn) {
    this.measures = this.measures.push(fn)
    return this
  }
}

module.exports = LapisBenchmark
