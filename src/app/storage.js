
require('sqlite3')
const { connect } = require('trilogy')

const storage = { }

/**
 * Create a database to store benchmark data
 *
 * @param {string} dbPath the database path
 *
 * @returns {Database}
 */
storage.create = async dbPath => {
  const db = connect(dbPath)

  return db.model('summary', {
    name: String,
    local: Boolean,
    commitId: String,
    benchmarkName: String,
    p1: Number,
    p5: Number,
    p25: Number,
    p50: Number,
    p75: Number,
    p95: Number,
    p99: Number,
    timestamp: String
  })
}

storage.add = { }

storage.add.summary = async (db, data) => {
  await db.create({
    name: data.name,
    local: data.local,
    commitId: data.commitId,
    benchmarkName: data.benchmarkName,
    p1: data.p1,
    p5: data.p5,
    p25: data.p25,
    p50: data.p50,
    p75: data.p75,
    p95: data.p95,
    p99: data.p99,
    timestamp: data.timestamp
  })
}

module.exports = storage
