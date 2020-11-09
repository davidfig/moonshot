import { ease } from 'pixi-ease'
import * as PIXI from 'pixi.js'
import random from 'yy-random'

import { view } from '../view'
import { Words } from '../Words'
import { sounds } from '../sounds'
import * as settings from '../settings'
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

    show() {
        ease.removeEase(this)
        if (this.top) {
            this.y = -4
            ease.add(this, { y: 1 }, { wait: moon.approachTime / 2, duration: settings.uiDropTime, ease: 'easeOutBounce'})
        } else {
            this.y = 4
            ease.add(this, { y: -1 }, { wait: moon.approachTime / 2, duration: settings.uiDropTime, ease: 'easeOutBounce'})
        }
    }

    hide() {
        ease.removeEase(this)
        if (this.top) {
            this.y = 1
            ease.add(this, { y: -4 }, { duration: settings.uiDropTime / 2, ease: 'easeInBounce'})
        }

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
        let y
        if (width + back.size + 1 > view.width) {
            y = view.height - 3
            this.y = -1
            this.top = false
        } else {
            this.y = 1
            y = 0
            this.top = true
        }
        this.meter
            .clear()
            .beginFill(0xaaaaaa)
            .drawRect(view.width - width, y, width, 3)
            .endFill()
        let x = view.width - width + 1
        for (let i = 0; i < this.total; i++) {
            this.meter
                .beginFill(i < this.current ? 0xff0000 : 0x888888)
                .drawRect(x, y + 1, 1, 1)
                .endFill()
            x += 2
        }
        this.left = view.width - width - 1
    }

    down(local) {
        if (local.x > this.left && ((this.top && local.y <= 4) || (!this.top && local.y > view.height - 4))) {
            moon.reset()
            meter.reset()
            this.update(0)
            sounds.play('whoosh')
            if (this.help) {
                ease.removeEase(this.help)
                this.removeChild(this.help)
                this.help = null
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

    showHelp() {
        if (!this.help) {
            this.helpCount++
            if (this.helpCount > 1) {
                this.help = this.addChild(new Words('reset ^'))
                this.help.scale.y = this.help.scale.x = back.getScale()
                this.help.position.set(view.width - this.meter.width / 2 - this.help.width, 4.5)
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