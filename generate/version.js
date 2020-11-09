const bump = require('json-bump')
const readline = require('readline')

const packageJson = require('../package.json')

async function start() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    const version = packageJson.version
    const parts = version.split('.')
    const updated = `${parts[0]}.${parts[1]}.${parseInt(parts[2]) + 1}`
    rl.question(
        `Current version: ${version}\nUpdated version: `,
        async selected => {
            if (selected !== version) {
                await bump('package.json', {
                    replace: selected
                })
                console.log(
                    `Writing version ${selected} to package.json`
                )
            }
            rl.close()
            process.exit(0)
        }
    )
    rl.write(updated)
}

start()