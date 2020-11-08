import * as PIXI from 'pixi.js'

import { ease } from './ease'
import { moon } from './moon'
import { laser } from './laser'
import { meter } from './meter'
import { stars } from './stars'
import { back } from './back'
import { state } from '../state'
import { file } from '../file'

import levels from './shoot.json'

const starsFadeTime = 500
const frameTime = 1000 / 60
const topDownTime = 1000
const topUpTime = 500

class Shoot extends PIXI.Container {
    init() {
        this.addChild(stars)
        this.addChild(moon)
        this.addChild(laser)
        this.top = this.addChild(new PIXI.Container())
        this.top.addChild(meter)
        this.top.addChild(back)
        this.top.y = -4
    }

    change(fromMoon) {
        const level = levels[file.shoot.level]
        stars.draw(level.seed)
        moon.draw(level)
        back.change()
        meter.init(level.minimum)
        this.top.y = -4
        ease.removeEase(this.top)
        ease.add(this.top, { y: 0 }, { wait: moon.approachTime / 2, duration: topDownTime, ease: 'easeOutBounce'})
        if (fromMoon) {
            stars.warpIn()
        } else {
            stars.alpha = 0
            const starsEase = ease.add(stars, { alpha: 1 }, { duration: starsFadeTime, ease: 'easeInOutSine' })
            starsEase.on('complete', () => moon.approach())
        }
    }

    complete() {
        this.top.y = 0
        ease.removeEase(this.top)
        ease.add(this.top, { y: -4 }, { duration: topUpTime, ease: 'easeInSine' })
        stars.warpOut()
    }

    down(point) {
        const local = this.toLocal(point)
        if (back.down(local)) {
            // state.back()
        } else if (meter.down(local)) {
        } else {
            laser.down(point)
        }
    }

    move(point) {
        laser.move(point)
    }

    up(point) {
        laser.up(point)
    }

    update() {
        ease.update(frameTime)
        stars.update()
        moon.update()
        laser.update()
        meter.update()
    }

    resize() {
        stars.resize()
        moon.resize()
    }
}

export const shoot = new Shoot()