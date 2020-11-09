import { ease } from 'pixi-ease'
import * as PIXI from 'pixi.js'
import random from 'yy-random'

import { view } from '../view'
import { Words } from '../Words'
import { moon } from './moon'

const shakeTime = 250
const shakeDistance = 1
const helpFadeTime = 5000

class Meter extends PIXI.Container {
    init(total) {
        this.meter = this.addChild(new PIXI.Graphics())
        this.current = total
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
        const width = this.total * 2 + 1
        this.meter
            .clear()
            .beginFill(0xaaaaaa)
            .drawRect(view.width - width - 1, 1, width, 3)
            .endFill()
        let x = view.width - width
        for (let i = 0; i < this.total; i++) {
            this.meter
                .beginFill(i < this.current ? 0xff0000 : 0x888888)
                .drawRect(x, 2, 1, 1)
                .endFill()
            x += 2
        }
        this.left = view.width - width - 1
    }

    down(local) {
        if (local.x > this.left && local.y <= 4) {
            moon.reset()
            meter.reset()
            this.update(0)
            return true
        }
    }

    canFire() {
        const canFire = this.current !== this.total
        if (!canFire) {
            this.shaking = Date.now()
            this.showHelp()
            return false
        }
        return true
    }

    showHelp() {
        if (!this.help) {
            this.helpCount++
            if (this.helpCount > 1) {
                this.help = this.addChild(new Words('^ press here to reset'))
                this.help.width = this.meter.width * 0.9
                this.help.scale.y = this.help.scale.x
                this.help.position.set(view.width - this.total * 2 - 1.5, 4.5)
                const easing = ease.add(this.help, { alpha: 0 }, { duration: helpFadeTime, ease: 'easeInOutSine' })
                easing.on('complete', () => {
                    this.removeChild(this.help)
                    this.help = null
                })
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