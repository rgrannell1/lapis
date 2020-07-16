
const { codes } = require('../commons/constants')

const errors = require('@rgrannell/errors')
const simpleGit = require('simple-git')
const url = require('url')
const fs = require('fs').promises

const validate = { }

/**
 * Validate the target git repository
 * 
 * @param {Object} args CLI arguments
 * 
 * @returns {Object} the repository data 
 */
validate.repo = async args => {
  let repo
  const parsed = url.parse(args.repo)

  // -- check the repo status
  if (parsed.protocol === 'https') {
    repo = {
      protocol: 'https',
      fpath: args.repo
    }
  } else if (parsed.protocol === null) {
    let stat
    try {
      stat = await fs.lstat(args.repo)
    } catch (err) {
      throw errors.invalidRepoProtocol(`failed to stat repository "${args.repo}"`, codes.INVALID_REPO)
    }

    if (!stat.isDirectory()) {
      throw errors.invalidRepoProtocol(`"${args.repo}" was not a directory`, codes.INVALID_REPO)
    }

    repo = {
      protocol: 'file',
      fpath: args.repo
    }
  } else {
    throw errors.invalidRepoProtocol('repo must be a folder or https address', codes.INVALID_REPO)
  }

  if (repo.protocol === 'https') {
    throw errors.invalidRepoProtocol('https protocol not yet supported for repos', codes.UNSUPPORTED)
  }

  const git = simpleGit(repo.fpath)

  // -- check that the folder actually is a git repo.
  await git.status()

  return repo
}

module.exports = validate
