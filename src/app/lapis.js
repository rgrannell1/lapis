
const { codes } = require('../commons/constants')

const simpleGit = require('simple-git')
const path = require('path')
const tmp = require('tmp-promise')
const fs = require('fs').promises
const fse = require('fs-extra')

const validateRepo = require('./validate-repo')

const getRepoState = async () => {
  const status = await git.status()

  console.log(status.not_added)
}

const runBenchmarks = fpath => {
  
}

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

const lapis = async rawArgs => {
  const args = lapis.preprocess(rawArgs)

  const fpath = await createRepoClone(args)

  runBenchmarks(fpath)
}

lapis.preprocess = rawArgs => {
  return {
    repo: rawArgs['--repo'],
    target: rawArgs['<target>']
  }
}

module.exports = lapis
