
const constants = require('../commons/constants')
const { codes } = require('../commons/constants')

const errors = require('@rgrannell/errors')
const simpleGit = require('simple-git')
const path = require('path')
const fs = require('fs').promises

const runBenchmark = require('./run-benchmark')
const storage = require('./storage')

const stats = require('./stats')


/**
 * Load lapis benchmarks from a provided export folder.
 * 
 * @param {Object} opts.fpath 
 * @param {Object} opts.commitID 
 * @param {Object} opts.db 
 * @param {Object} args 
 * 
 * @returns {Object} benchmark information
 */
const loadBenchmarks = async ({fpath, commitID, db}, args) => {
  // -- require the benchmarks from a single export
  const benchmarkPath = path.join(fpath, args.folder)

  let benchmarks
  try {
    benchmarks = require(benchmarkPath)
  } catch (err) {
    throw errors.missingBenchmarks(`failed to load benchmarks from "${benchmarkPath}"; cannot run benchmarks for commit ${commitId.slice(0, 8)}`, codes.DATABASE_ERROR)
  }
  
  return {
    benchmarks
  }
}

/**
 * Run each benchmarks
 * 
 * @param {db} opts.db 
 * @param {string} opts.commitId 
 * @param {Function} opts.until 
 * @param {Object} opts.benchmarks 
 * 
 * 
 */
const runBenchmarks = async ({db, local, commitId, until, benchmarks}) => {
  for (const [name, fileBenchmarks] of Object.entries(benchmarks)) {
    for (const [benchmarkName, benchmark] of Object.entries(fileBenchmarks)) {
      const metadata = {
        name,
        local,
        commitId,
        benchmarkName
      }      
      
      const iter = runBenchmark({
        name,
        benchmarkName,
        benchmark,
        until
      })

      const statState = { }

      for await (let measurement of iter) {
        stats.update(statState, measurement)
      }

      return Object.entries(stats.final(statState)).map(( [id, value] ) => {
        return {
          ...metadata,
          ...value
        }
      })
    }
  }
}

/**
 * Determine how long each benchmark should be run for
 * 
 * @param {Object} args command-line arguments 
 * @param {Object} benchmarks benchmark data
 * 
 * @return {Boolean} 
 */
const findBenchmarkRuntime = (args, benchmarks) => {
  return (count, time) => {
    return Date.now() - time > 5_000
  }
}

/**
 * The core program
 * 
 * @param {Object} rawArgs the raw arguments provided to lapis
 * 
 * @returns {Promise} returns a promise 
 */
const lapis = async rawArgs => {
  const args = lapis.preprocess(rawArgs)
  const db = await storage.create(args.database)

  return args.local
    ? lapis.local(args, db)
    : lapis.clone(args, db)
}

/**
 * Run lapis locally rather than in a cloned repository.
 *  
 * @param {Object} args CLI arguments
 * @param {Object} db   a database reference 
 * 
 * @returns {Promise<>} a result promise 
 */
lapis.local = async (args, db) => {
  const localPath = path.resolve('.')

  const git = simpleGit(localPath)
  const commitId = await git.revparse(['HEAD'])

  const { benchmarks } = await loadBenchmarks({fpath: localPath, db, commitId}, {
    database: args.database,
    folder: 'bench'
  })

  const summaries = await runBenchmarks({
    db, 
    commitId, 
    until: findBenchmarkRuntime(args, benchmarks), 
    benchmarks,
    local: true
  })    

  for (const summary of summaries) {
    await storage.add.summary(db, summary)
  }

  process.exit(0)
}

/**
 * Run lapis in a closed repository.
 *  
 * @param {Object} args CLI arguments
 * @param {Object} db   a database reference 
 * 
 * @returns {Promise<>} a result promise 
 */
lapis.clone = async (args, db) => {
  const fpath = await createRepoClone(args)    
  const { commitId, benchmarks } = await loadBenchmarks({fpath, db, commitId}, args)

  await runBenchmarks({
    db, 
    commitId, 
    benchmarks,
    local: false
  })

  await fs.rmdir(fpath, {
    recursive: true
  })
}

lapis.preprocess = rawArgs => {
  return {
    local: rawArgs['--local'],
    repo: rawArgs['--repo'],
    folder: rawArgs['<folder>'] || constants.defaults.folder,
    database: rawArgs['--database'],
    target: rawArgs['<target>']
  }
}

module.exports = lapis
