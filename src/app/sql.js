
const sql = { }

const levelup = require('levelup')
const leveldown = require('leveldown')
const fs = require('fs').promises

/**
 * Create a database to store benchmark data
 *
 * @param {string} dbPath the database path
 *
 * @returns {Database}
 */
sql.create = async dbPath => {
  const db = levelup(leveldown(dbPath))

  return db
}

sql.createTables = async db => {

}

sql.writeMeasurements = (db, { name, commitId, benchmarkName, measurements }) => {
  console.log('sql.writeMeasurements -> measurements', measurements)
}

module.exports = sql
