const fs = require('fs-extra')

async function summary() {
    const shoot = await fs.readJSON('code/shoot/shoot.json')
    let s = ''
    for (let i = 0; i < shoot.length; i++) {
        const level = shoot[i]
        s += `${i + 1}. radius=${level.Radius} colors=${level.Colors.length} difficulty=${level.Difficulty}\n`
    }
    await fs.outputFile('generate/summary.md', s)
    console.log('wrote level summary to generate/summary.md.')
    process.exit(0)
}

summary()