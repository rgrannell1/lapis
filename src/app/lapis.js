
const constants = require('../commons/constants')
const { codes } = require('../commons/constants')

const errors = require('@rgrannell/errors')
const simpleGit = require('simple-git')
const path = require('path')
const tmp = require('tmp-promise')
const fs = require('fs').promises
const fse = require('fs-extra')
const sqlite3 = require('sqlite3')

const runBenchmark = require('./run-benchmark')
const validateRepo = require('./validate-repo')
const bench = require('../../bench')
const sql = require('./sql')

/**
 * 
 * @param {string} fpath 
 * @param {Object} args 
 */
const loadBenchmarks = async (fpath, args) => {
  const db = await sql.create(args.database)

  const git = simpleGit(fpath)
  const commitId = await git.revparse(['HEAD'])

  // -- require the benchmarks from a single export
  const benchmarkPath = path.join(fpath, args.folder)

  let benchmarks
  try {
    benchmarks = require(benchmarkPath)
  } catch (err) {
    console.log(err)
    throw errors.missingBenchmarks(`failed to load benchmarks from "${benchmarkPath}"; cannot run benchmarks for commit ${commitId.slice(0, 8)}`, codes.DATABASE_ERROR)
  }
  
  // -- the record to inset into the database.
  return {
    db,
    commitId,
    benchmarks
  }
}

/**
 * 
 * 
 * @param {Object} args CLI arguments
 * 
 * @return {string} the clone repository path
 */
const createRepoClone = async args => {
  // -- copy .git to a temporary directory.
  const repoStatus = await validateRepo(args)
  const { path: fpath, cleanup } = await tmp.dir()

  const gitPath = path.join(repoStatus.fpath, '.git')
  const targetGitPath = path.join(fpath, '.git')
  
  await fs.mkdir(targetGitPath)
  await fse.copy(gitPath, targetGitPath)

  // -- load HEAD from the commit.
  const git = simpleGit(fpath)
  await git.reset('hard')

  return fpath
}

const runBenchmarks = async (db, commitId, benchmarks) => {
  for (const [name, fileBenchmarks] of Object.entries(benchmarks)) {
    for (const [benchName, benchmark] of Object.entries(fileBenchmarks)) {
      const iter = runBenchmark({
        name,
        benchmarkName: benchName,
        benchmark
      })

      for await (let measurement of iter) {
        console.log(measurement)
      }
    }
  }
}

const lapis = async rawArgs => {
  const args = lapis.preprocess(rawArgs)

  if (args.local) {
    const localPath = path.resolve('.')
    const { db, commitId, benchmarks } = await loadBenchmarks(localPath, {
      database: args.database,
      folder: 'bench'
    })

    runBenchmarks(db, commitId, benchmarks)
    
  } else {
    const fpath = await createRepoClone(args)    
    const { commitId, benchmarks } = await loadBenchmarks(fpath, args)
  
    await runBenchmarks(db, commitId, benchmarks)
  
    await fs.rmdir(fpath, {
      recursive: true
    })
  }
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
