
const isGenerator = require('is-generator-function')
const constants = require('../commons/constants')
const EventEmitter = require('events')
const createRepoClone = require('../app/create-repo-clone')





/**
 * Provide a common interface for functions and generators; retrieve test-cases
 * 
 * @param {Function | GeneratorFunction} cases a test-case function 
 * 
 * @returns {Function} a function that returns test-cases
 */
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

/**
 * Call each metric to measure the test-case.
 * 
 * @param {Object} metrics 
 * @param {Object} testCase 
 * 
 * @returns {Object} an object containing metric measurements
 */
const invokeMetrics = (metrics, testCase) => {
  const measures = { }

  for (const [name, metricsDef] of Object.entries(metrics)) {
    const value = testCase.value[name]

    measures[name] = []

    for (const metric of metricsDef) {
      const measure = metric.definition(value)
      measures[name].push({
        measure,
        definition: metric.description
      })
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
 * 
 * @yields {Object} testcase benchmark data
 */

async function* runBenchmark ({ name, benchmarkName, benchmark, until }) {
  const {
    metadata,
    measures,
    cases,
    metrics
  } = benchmark

  const startTime = Date.now()
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

    if (until(state.count, startTime)) {
      return
    }

    if (tcase.done) {
      return
    } else {
      yield testCaseData
    }
  }
}

module.exports = runBenchmark
