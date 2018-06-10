'use strict'

const Path = require('path')
const yargs = require('yargs')

function main() {
  const { argv } = yargs
    .option('watch', {
      alias: 'w',
      type: 'string',
    })
    .version()
    .help()

  if (argv.watch) {
    Path.resolve(process.cwd(), argv.watch)
  }
}

module.exports = main
