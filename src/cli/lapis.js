#!/usr/bin/env node

const neodoc = require('neodoc')

const lapis = require('../app/lapis')
const constants = require('../commons/constants')
const handleErrors = require('../commons/handle-errors')

const docs = `
Name:
  lapis – git-aware benchmarking
Usage:
  lapis [--repo <url>] [--database <fpath>] [<folder>]
  lapis --local [--repo <url>] [--database <fpath>] [<folder>]

Description:
  .  

Arguments:
  <folder>             the relative-path to the exported benchmark [default: ${constants.defaults.folder}]

Options:
  --repo <url>          a file-path or url of the repository to benchmark. If not set, defaults to the 
                          current working directory. [default: ${constants.defaults.repo}]
  --database <fpath>    a file-path pointing to the benchmark data. [default: ${constants.defaults.database}]

Authors:
  ${constants.packageJson.author}
Version:
  v${constants.packageJson.version}
Copyright:
  The MIT License
  Copyright (c) 2020 Róisín Grannell
  Permission is hereby granted, free of charge, to any person obtaining a copy of this
  software and associated documentation files (the "Software"), to deal in the Software
  without restriction, including without limitation the rights to use, copy, modify, merge,
  publish, distribute, sublicense, and/or sell copies of the Software, and to permit
  persons to whom the Software is furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in all copies
  or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
  PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT
  OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  OTHER DEALINGS IN THE SOFTWARE.
 
`

const args = neodoc.run(docs)

lapis(args).catch(handleErrors)
