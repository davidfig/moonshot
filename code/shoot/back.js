import * as PIXI from 'pixi.js'

import { sheet } from '../sheet'
import { file } from '../file'
import { Words } from '../Words'
import { state } from '../state'
import { sounds } from '../sounds'

class Back extends PIXI.Container {
    constructor() {
        super()
        this.arrow = this.addChild(sheet.get('arrow'))
        this.arrow.anchor.set(0)
        this.arrow.tint = 0x888888
        this.arrow.width = this.arrow.height = 1 / 11 * 2
        this.level = this.addChild(new Words())
        this.x = 1
    }

    get size() {
        return this.x + this.width
    }

    getScale() {
        return this.level.scale.x
    }

    change() {
        this.level.change(`level ${file.shootLevel + 1}`)
        this.level.height = this.arrow.height
        this.level.scale.x = this.level.scale.y
        this.level.x = this.arrow.width + this.arrow.x + 1
    }

    down(local) {
        if (local.x <= this.width + 1 && local.y < this.height + 1) {
            state.change('menu')
            sounds.play('beep')
            return true
        }
    }
}

export const back = new Back()