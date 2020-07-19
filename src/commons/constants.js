
const path = require('path')

const constants = {
  packageJson: require('../../package.json'),
  defaults: {
    repo: process.cwd(),
    database: path.join(process.cwd(), 'lapis-db'),
    folder: path.join(process.cwd(), 'bench/index.js')
  },
  codes: {
    INVALID_REPO: 'LAPIS_001',
    UNSUPPORTED: 'LAPIS_002',
    DATABASE_ERROR: 'LAPIS_003'
  }
}

module.exports = constants
