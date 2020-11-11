import { ease } from 'pixi-ease'
import * as PIXI from 'pixi.js'
import random from 'yy-random'

import { view } from '../view'
import { Words } from '../Words'
import { sounds } from '../sounds'
import { moon } from './moon'
import { back } from './back'

const shakeTime = 250
const shakeDistance = 1
const helpFadeTime = 5000

class Meter extends PIXI.Container {
    constructor() {
        super()
        this.meter = this.addChild(new PIXI.Graphics())
    }

    init(total) {
        this.current = 0
        this.total = total
        this.helpCount = 0
        this.draw()
    }

    reset() {
        this.current = 0
        this.helpCount = 0
        this.draw()
    }

    fire() {
        this.current++
        this.draw()
    }

    draw() {
        this.meter.scale.set(1)
        const width = this.total * 2 + 1
        this.meter
            .clear()
            .beginFill(0xaaaaaa)
            .drawRect(0, 0, width, 3)
            .endFill()
        let x = 1
        for (let i = 0; i < this.total; i++) {
            this.meter
                .beginFill(i < this.current ? 0xff0000 : 0x888888)
                .drawRect(x, 1, 1, 1)
                .endFill()
            x += 2
        }
        if (width + 2 > view.width - back.width) {
            this.meter.width = view.width - back.width - 2
            this.meter.scale.y = this.meter.scale.x
        }
        this.x = view.width - this.meter.width - 1
        this.left = view.width - this.meter.width - 1
    }

    down(local) {
        if (local.x > this.left && local.y <= this.height + 1) {
            if (this.current !== 0 && moon.canFire()) {
                moon.reset()
                meter.reset()
                this.update(0)
                sounds.play('whoosh')
                if (this.help) {
                    ease.removeEase(this.help)
                    this.removeChild(this.help)
                    this.help = null
                }
            }
            return true
        }
    }

    canFire() {
        const canFire = this.current !== this.total
        if (!canFire) {
            this.shaking = Date.now()
            sounds.play('buzzer')
            this.showHelp()
            return false
        }
        return true
    }

    showHelp(force) {
        if (!this.help) {
            this.helpCount++
            if (force || this.helpCount > 1) {
                this.help = this.addChild(new Words('reset ^'))
                this.help.scale.y = this.help.scale.x = 0.25
                this.help.position.set(-this.help.width + this.meter.width / 2 + 0.5, 3.5)
                if (!force) {
                    const easing = ease.add(this.help, { alpha: 0 }, { duration: helpFadeTime, ease: 'easeInOutSine' })
                    easing.on('complete', () => {
                        this.removeChild(this.help)
                        this.help = null
                    })
                }
            }
        }
    }

    update() {
        if (this.shaking) {
            if (Date.now() > this.shaking + shakeTime) {
                this.shaking = null
                this.meter.position.set(0)
            } else {
                this.meter.position.set(random.middle(0, shakeDistance, true), random.middle(0, shakeDistance, true))
            }
        }
    }
}

export const meter = new Meter()