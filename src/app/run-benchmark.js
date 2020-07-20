
const isGenerator = require('is-generator-function')

const constants = require('../commons/constants')
const createRepoClone = require('../app/create-repo-clone')
const string = require('../commons/string')
const time = require('../commons/time')



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
  const metricVals = { }

  // -- order negates the need for ids in output
  const orderedMetrics = Object.entries(metrics).sort((elem0, elem1) => {
    return string.compare(elem0[0], elem1[0])
  })

  for (const [name, metricsDef] of orderedMetrics) {
    const value = testCase.value[name]

    metricVals[name] = [ ]

    // -- measure the test case and push the results.
    for (const metric of metricsDef) {
      const measure = metric.definition(value)
      metricVals[name].push({ measure })
    }    
  }

  return metricVals
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
    for (let ith = 0; ith < measures.length; ++ith) {
      const measure = measures[ith]
      const tcase = getTestCase()
      const testCaseMeasures = invokeMetrics(metrics, tcase)
    
      const start = process.hrtime()
              
      await measure(tcase)

      const diff = process.hrtime(start)
    
      const testCaseData = {
        measureId: `measure-${ith}`,
        count: state.count,
        testCase: tcase.value,
        duration: time.hrDiffToSeconds(diff),
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
}

module.exports = runBenchmark
