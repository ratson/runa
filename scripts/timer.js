'use strict'

function main() {
  setInterval(() => {
    process.stdout.write(`${new Date()}\n`)
    process.stderr.write('Error\n')
  }, 1000)
}

main()
