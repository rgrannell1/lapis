
const userFailingErrorMesasage = `Something has went terribly wrong!
Please report the following error message to https://github.com/rgrannell1/lapis/issues:
`

const handleErrors = err => {
  if (err.code) {
    console.error(err.message)
  } else {
    console.error(userFailingErrorMesasage)

    console.error(err.message)
    console.error(err.stack)
  }

  process.exit(1)
}

module.exports = handleErrors
