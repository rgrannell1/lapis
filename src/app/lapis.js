
const { codes } = require('../commons/constants')

const errors = require('@rgrannell/errors')
const simpleGit = require('simple-git')
const path = require('path')
const sqlite3 = require('sqlite3')
const url = require('url')
const tmp = require('tmp-promise')
const fs = require('fs').promises
const fse = require('fs-extra')

const getRepoState = async () => {
  const status = await git.status()

  console.log(status.not_added)
}

const validateRepo = async args => {
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

const lapis = async rawArgs => {
  const args = lapis.preprocess(rawArgs)

  // -- copy .git to a temporary directory.
  const repo = await validateRepo(args)
  const { path: fpath, cleanup } = await tmp.dir()

  const gitPath = path.join(args.repo, '.git')
  const targetGitPath = path.join(fpath, '.git')
  
  await fs.mkdir(targetGitPath)
  await fse.copy(gitPath, targetGitPath)

  // -- load HEAD from the commit.
  const git = simpleGit(fpath)
  await git.reset('hard')

}

lapis.preprocess = rawArgs => {
  return {
    repo: rawArgs['--repo'],
    target: rawArgs['<target>']
  }
}

module.exports = lapis
