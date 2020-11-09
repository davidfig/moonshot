import * as PIXI from 'pixi.js'

import { sheet } from './sheet'
import { shadow, shadowTint } from './settings'

const COLOR = 0xffffff
const BACKGROUND = 0

export class Words extends PIXI.Container {
    /**
     * @param {string} words
     * @param {object} [options]
     * @param {number} [options.color]
     * @param {bool} [options.shadow]
     * @param {(bool|number)} [options.background]
     * @param {number} [options.backgroundAlpha]
     */
    constructor(words, options={}) {
        super()
        this.color = (typeof options.color === 'undefined') ? COLOR : options.color
        this.background = this.addChild(new PIXI.Sprite(PIXI.Sprite.WHITE))
        this.background.anchor.set(0)
        if (options.background) {
            this.background.alpha = options.backgroundAlpha || 0.25
            this.background.tint = options.background === true ? BACKGROUND : options.background
        } else {
            this.background.alpha = 0
        }
        if (options.shadow) {
            this.shadow = this.addChild(new PIXI.Container())
            this.shadow.position.set(shadow)
        }
        this.words = this.addChild(new PIXI.Container())
        if (words) {
            this.change(words)
        }
    }

    containsPoint(point) {
        return this.background.containsPoint(point)
    }

    wrap(max) {
        let x = 0, y = 0, actual = 0
        const letters = this.words.children
        for (let i = 0; i < this.text.length; i++) {
            const letter = this.text[i]
            if (letter === '#') {
                x = 0
                y += 7
            } else if (letter === ' ') {
                if (x !== 0) {
                    x += 3
                    if (x >= max) {
                        x = 0
                        y += 7
                    }
                }
            } else {
                if (x + letters[actual].width > max) {
                    while (x > 0) {
                        i--
                        if (this.text[i] === ' ') {
                            break
                        } else {
                            x -= letters[actual].width
                            actual--
                        }
                    }
                    x = 0
                    y += 7
                } else {
                    let adjustY = 0
                    if (letter === '$') {
                        adjustY = -1
                    } else if (letter === '@') {
                        adjustY = 0.5
                    }
                    letters[actual].position.set(x, y + adjustY)
                    x += letters[actual].width + 1
                    actual++
                }
            }
        }
    }

    write(words) {
        this.words.removeChildren()
        if (this.shadow) {
            this.shadow.removeChildren()
        }
        words = words + ''
        this.text = words
        let x = 0, y = 0
        for (let letter of words) {
            if (letter === '#') {
                y += 7
                x = 0
            } else if (letter === ' ') {
                x += 3
            } else {
                const sprite = this.words.addChild(this.getLetter(letter))
                let adjustY = 0
                if (letter === '$') {
                    adjustY = -1
                } else if (letter === '@') {
                    adjustY = 0.5
                }
                sprite.position.set(x, y + adjustY)
                if (this.shadow) {
                    const shadow = this.shadow.addChild(this.getLetter(letter))
                    shadow.tint = shadowTint
                    shadow.position.set(x, y + adjustY)
                }
                x += (sprite.n === -1 ? sheet.textures['asteroid-1'].width : sheet.textures['letters-' + sprite.n].width) + 1
            }
        }
    }

    change(text) {
        if (this.text !== text) {
            this.write(text)
            if (this.background) {
                this.background.width = this.words.width
                this.background.height = this.words.height
            }
        }
    }

    getLetter(letter) {
        letter = letter.toUpperCase()
        const code = letter.charCodeAt()
        let n
        if (code >= 65 && code <= 90) {
            n = code - 65
        } else if (code == 48) {
            n = 14
        } else if (code === 49) {
            n = 8
        } else if (code >= 50 && code <= 57) {
            n = 26 + code - 50
        } else if (letter === '.') {
            n = 34
        } else if (letter === '!') {
            n = 35
        } else if (letter === '?') {
            n = 36
        } else if (letter === ',') {
            n = 37
        } else if (letter === '$') {
            n = 38
        } else if (letter === '\'') {
            n = 39
        } else if (letter === '(') {
            n = 40
        } else if (letter === ')') {
            n = 41
        } else if (letter === ':') {
            n = 42
        } else if (letter === '/') {
            n = 43
        } else if (letter === '-') {
            n = 44
        } else if (letter === '^') {
            n = 46
        } else if (letter === '_') {
            n = 47
        } else if (letter === '@') {
            n = -1
        } else if (letter === '|') {
            n = 48
        } else if (letter === '<') {
            n = 49
        } else if (letter === '>') {
            n = 50
        } else {
            console.warn('Unknown letter in words.js: ' + letter)
            n = 35
        }
        const sprite = n === -1 ? sheet.get('asteroid-1') : sheet.get('letters-' + n)
        sprite.n = n
        sprite.letter = letter
        sprite.anchor.set(0)
        sprite.tint = this.color
        return sprite
    }

    get tint() {
        return this.color
    }
    set tint(value) {
        if (this.color !== value) {
            for (let letter of this.words.children) {
                letter.tint = value
            }
            this.color = value
        }
    }

    getContainsPointIndex(point) {
        for (let i = 0; i < this.words.children.length; i++) {
            if (this.words.children[i].containsPoint(point)) {
                return i
            }
        }
    }

    getFirstLetter() {
        return this.words.children[0]
    }
    getLastLetter() {
        return this.words.children[this.words.children.length - 1]
    }
}