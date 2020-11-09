import * as PIXI from 'pixi.js'

import { sheet } from '../sheet'
import { file } from '../file'
import { Words } from '../Words'
import { state } from '../state'
import { sounds } from '../sounds'
import * as settings from '../settings'
import { ease } from './ease'
import { moon } from './moon'

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

    show() {
        this.y = -4
        ease.removeEase(this)
        ease.add(this, { y: 1 }, { wait: moon.approachTime / 2, duration: settings.uiDropTime, ease: 'easeOutBounce'})
    }

    hide() {
        this.y = 1
        ease.removeEase(this)
        ease.add(this, { y: -4 }, { duration: settings.uiDropTime / 2, ease: 'easeInSine' })
    }

    get size() {
        return this.x + this.width
    }

    getScale() {
        return this.level.scale.x
    }

    change() {
        this.level.change(`level ${file.shoot.level + 1}`)
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