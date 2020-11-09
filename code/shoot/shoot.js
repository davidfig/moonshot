import * as PIXI from 'pixi.js'

import { moon } from './moon'
import { laser } from './laser'
import { meter } from './meter'
import { stars } from './stars'
import { back } from './back'
import { ease } from './ease'
import { file } from '../file'
import { sounds } from '../sounds'

import levels from './shoot.json'

const starsFadeTime = 500
const frameTime = 1000 / 60

class Shoot extends PIXI.Container {
    init() {
        this.addChild(stars)
        this.addChild(moon)
        this.addChild(laser)
        this.addChild(meter)
        this.addChild(back)
    }

    change(fromMoon) {
        const level = levels[file.shoot.level]
        stars.draw(level.seed)
        moon.draw(level)
        laser.reset()
        back.change()
        meter.init(level.minimum)
        back.show()
        meter.show()
        if (fromMoon) {
            stars.warpIn()
        } else {
            stars.alpha = 0
            const starsEase = ease.add(stars, { alpha: 1 }, { duration: starsFadeTime, ease: 'easeInOutSine' })
            starsEase.on('complete', () => moon.approach())
        }
    }

    complete() {
        back.hide()
        meter.hide()
        stars.warpOut()
        sounds.play('warp')
    }

    down(point) {
        this.isDown = true
        const local = this.toLocal(point)
        if (!back.down(local) && !meter.down(local)) {
            laser.down(point)
        }
    }

    move(point) {
        if (this.isDown) {
            laser.move(point)
        }
    }

    up(point) {
        if (this.isDown) {
            laser.up(point)
            this.isDown = false
        }
    }

    update() {
        ease.update(frameTime)
        stars.update()
        moon.update()
        laser.update()
        meter.update()
    }

    reset() {
        laser.reset()
    }

    resize() {
        stars.resize()
        moon.resize()
        meter.draw()
    }
}

export const shoot = new Shoot()