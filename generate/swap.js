const fs = require('fs-extra')

const filename = 'code/shoot/shoot.json'

async function swap() {
    const l1 = parseInt(process.argv[2]) - 1
    const l2 = parseInt(process.argv[3]) - 1
    if (isNaN(l1) || isNaN(l2)) {
        console.log('node swap <level1> <level2>')
        process.exit(0)
    }
    const shoot = await fs.readJSON(filename)
    const swap = shoot[l1]
    shoot[l1] = shoot[l2]
    shoot[l2] = swap
    await fs.outputJSON(filename, shoot)
    console.log(`swapped levels ${l1 + 1} with ${l2 + 1} and wrote shoot.json.`)
    process.exit(0)
}

swap()