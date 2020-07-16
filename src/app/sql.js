
const sqlite3 = require('sqlite3').verbose()

const sql = { }

/**
 * Create a database to store benchmark data
 *
 * @param {string} dbPath the database path
 *
 * @returns {Database}
 */
sql.create = async dbPath => {
  const db = new sqlite3.Database(dbPath)

  db.run(`CREATE TABLE IF NOT EXISTS measurements (
    raw_text TEXT
  )`)

  return db
}

sql.writeMeasurements = async (db, { name, commitId, benchmarkName, measurements }) => {
  for (let measurement of measurements) {
    if (!measurement) {
      continue
    }
    db.run('INSERT INTO measurements VALUES (?)', measurement)
  }
}

module.exports = sql
