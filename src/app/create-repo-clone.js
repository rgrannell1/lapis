
const validate = require('./validate')

/**
 * Clone the repository locally
 * 
 * @param {Object} args CLI arguments
 * 
 * @return {string} the clone repository path
 */
const createRepoClone = async args => {
  // -- copy .git to a temporary directory.
  const repoStatus = await validate.repo(args)
  const { path: fpath } = await tmp.dir()

  const gitPath = path.join(repoStatus.fpath, '.git')
  const targetGitPath = path.join(fpath, '.git')
  
  await fs.mkdir(targetGitPath)
  await fse.copy(gitPath, targetGitPath)

  // -- load HEAD from the commit.
  const git = simpleGit(fpath)
  await git.reset('hard')

  return fpath
}

module.exports = createRepoClone
