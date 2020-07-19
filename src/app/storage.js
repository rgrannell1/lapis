
const fs = require('fs').promises
const path = require('path')

const errors = require('@rgrannell/errors')

const storage = { }

/**
 * Create a database to store benchmark data
 *
 * @param {string} dbPath the database path
 *
 * @returns {Database}
 */
storage.create = async dbPath => {
  let stat
  try {
    stat = await fs.lstat(dbPath)
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(dbPath)
    } else {
      throw new Error('aaaa')
    }
  }

  if (stat && !stat.isDirectory()) {
    throw new Error(`${dbPath} was not a folder`)
  }

  return dbPath
}

storage.writeMeasurements = async (db, data) => {
  return
  const measurements = data.measurements
  delete data.measurements

  const content = measurements
  .map(data => JSON.stringify(data))
  .join('\n')

  if (!data.commitId) {
    throw new Error('xxx')
  }

  const fpath = path.join(db, `${data.commitId}.jsonl`)
  await fs.appendFile(fpath, content)
}

storage.writeMetadata = async (db, data) => {

}

module.exports = storage
