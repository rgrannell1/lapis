
const sp = require('streaming-percentiles')

const stats = { }

//new sp.GK(0.001)

stats.update = (acc, measurement) => {
  const { measureId } = measurement

  if (acc[measureId]) {
    acc[measureId].percentilesAgg.insert(measurement.duration)
  } else {
    acc[measureId] = {
      percentilesAgg: new sp.GK(0.001)
    }
  }
}

stats.final = acc => {
  const output = { }
  for (const [id, value] of Object.entries(acc)) {
    const percentiles = {
      p1: value.percentilesAgg.quantile(0.01),
      p5: value.percentilesAgg.quantile(0.05),
      p25: value.percentilesAgg.quantile(0.25),
      p50: value.percentilesAgg.quantile(0.50),
      p75: value.percentilesAgg.quantile(0.75),
      p95: value.percentilesAgg.quantile(0.95),
      p99: value.percentilesAgg.quantile(0.99)
    }

    output[id] = percentiles
  }  

  return output
}

module.exports = stats
