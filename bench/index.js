
const LapisBenchmark = require('../src/app/framework')
const metrics = require('../src/app/metrics')

const benchmarks = {
  testFile: {}
}

benchmarks.testFile.addition = new LapisBenchmark({
  id: ['addition'],
  description: 'Profile addition over input sizes'
})
  .cases(() => {
    return {
      x: [1, 2, 3],
      y: [2, 3, 4]
    }
  })
  .metrics({
    x: [ metrics.length ],
    y: [ metrics.length ]
  })
  .measure(({x, y}) => {
    let _ = 1 + 1
  })

module.exports = benchmarks
