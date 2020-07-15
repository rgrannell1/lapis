
const benchmarks = require('../../bench')
const isGenerator = require('is-generator-function')
const constants = require('../commons/constants')
const EventEmitter = require('events');




const adaptCaseGenerator = cases => {
  if (isGenerator(cases)) {
    let iter = cases()
    return () => {
      return iter.next()
    }
  } else {
    return () => {
      return{
        value: cases(),
        done: false
      }
    }
  }
}

const state = {
  count: 0,
  measurements: []
}

const invokeMetrics = (metrics, testCase) => {
  const measures = {

  }

  for (const [name, metricsDef] of Object.entries(metrics)) {
    const value = testCase.value[name]

    measures[name] = []

    for (const metric of metricsDef) {
      const measure = metric.definition(value)
      measures[name].push(measure)
    }    
  }

  return measures
}

/**
 * Run benchmark set and collect data.
 * 
 * @param {String} opts.name            the benchmark-set's name 
 * @param {Function} opts.benchmark     the benchmark- 
 * @param {String} opts.benchmarkName   the benchmark name 
 */

async function* runBenchmark ({ name, benchmarkName, benchmark }) {
  const {
    metadata,
    measures,
    cases,
    metrics
  } = benchmark

  const getTestCase = adaptCaseGenerator(cases)
  
  while (true) {
    const tcase = getTestCase()
    const testCaseMeasures = invokeMetrics(metrics, tcase)
  
    const start = process.hrtime()
  
    const end = process.hrtime()
    const diff = process.hrtime(start)
  
    const testCaseData = {
      count: state.count,
      testCase: tcase.value,
      duration: diff[0] * 1e9 + diff[1],
      measures: testCaseMeasures
    }
  
    state.count++

    if (tcase.done) {
      return
    } else {
      yield testCaseData
    }
  }
}

module.exports = runBenchmark
