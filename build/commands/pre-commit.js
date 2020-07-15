const command = {
  name: 'pre-commit',
  // -- note lint is not wired in
  dependencies: ['depcheck']
}

command.cli = `
Usage:
  script pre-commit
Description:
  Run precommit checks against this repository.
`

command.task = async args => { }

module.exports = command
