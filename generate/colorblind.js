const fs = require('fs-extra')
const safeDye = require('safe-dye')
const random = require('yy-random')
const Color = require('color')

// add back if needed
// const colorDiff = require('color-difference')

const file = 'code/shoot/shoot.json'

function toHex(n) {
    let s = n.toString(16)
    while (s.length < 6) {
        s = `0${s}`
    }
    return `#${s}`
}

async function start() {
    const shoot = await fs.readJSON(file)
    let count = 0
    for (let i = 0; i < shoot.length; i++) {
        const entry = shoot[i]
        let fail, first = true
        do {
            fail = false
            for (const c of entry.Colors) {
                const translate = Color(toHex(c))
                if (translate.luminosity() <= 0.179) {
                    fail = true
                    break
                }
            }
            if (!fail) {
                for (let j = 0; j < entry.Colors.length - 1; j++) {
                    for (let k = j + 1; k < entry.Colors.length; k++) {
                        const c1 = toHex(entry.Colors[j])
                        const c2 = toHex(entry.Colors[k])
                        if (!safeDye.validate(c1, c2)) { // || colorDiff.compare(c1, c2) < 10) {
                            fail = true
                            break
                        }
                    }
                    if (fail) {
                        break
                    }
                }
            }
            if (fail) {
                for (let k = 0; k < entry.Colors.length; k++) {
                    entry.Colors[k] = random.get(0xffffff)
                }
                if (first) count++
            }
            first = false
        } while (fail)
    }
    await fs.outputJSON(file, shoot)
    console.log(`Fixed ${count} color issues with shoot.json.`)
    process.exit(0)
}

start()