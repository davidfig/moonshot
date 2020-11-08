import * as PIXI from 'pixi.js'
import random from 'yy-random'

import { view } from '../view'
import { moon } from './moon'
import { laser } from './laser'

const shakeTime = 250
const shakeDistance = 1

class Meter extends PIXI.Graphics {
    init(total) {
        this.current = 0
        this.total = total
        this.draw()
    }

    reset() {
        this.current = 0
        this.draw()
    }

    fire() {
        this.current++
        this.draw()
    }

    draw() {
        const width = this.total * 2 + 1
        this
            .clear()
            .beginFill(0xaaaaaa)
            .drawRect(view.width - width - 1, 1, width, 3)
            .endFill()
        let x = view.width - width
        for (let i = 0; i < this.total; i++) {
            this
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
            return false
        }
        return true
    }

    update() {
        if (this.shaking) {
            if (Date.now() > this.shaking + shakeTime) {
                this.shaking = null
                this.position.set(0)
            } else {
                this.position.set(random.middle(0, shakeDistance, true), random.middle(0, shakeDistance, true))
            }
        }
    }
}

export const meter = new Meter()