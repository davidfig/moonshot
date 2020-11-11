import * as PIXI from 'pixi.js'

import { moon } from './moon'
import { laser } from './laser'
import { meter } from './meter'
import { stars } from './stars'
import { back } from './back'
import { text } from './text'
import { ease } from './ease'
import { file } from '../file'
import { sounds } from '../sounds'
import * as settings from '../settings'

import levels from './shoot.json'

const starsFadeTime = 500
const frameTime = 1000 / 60

class Shoot extends PIXI.Container {
    init() {
        this.addChild(stars)
        this.addChild(moon)
        this.addChild(laser)
        this.top = this.addChild(new PIXI.Container())
        this.top.y = -4
        this.isComplete = false
        this.top.addChild(meter)
        this.top.addChild(back)
        this.addChild(text)
    }

    change(fromMoon) {
        if (settings.shoot !== false) {
            file.shoot.level = settings.shoot
        }
        const level = levels[file.shoot.level]
        console.log(`ID: ${level.Seed}-${level.Radius} Difficulty: ${level.Difficulty}`)
        stars.draw(level.Seed)
        moon.draw(level)
        laser.reset()
        back.change()
        meter.init(level.Minimum)
        if (file.shootLevel === 0 && !file.noStory) {
            text.tutorial(() => this.start(fromMoon), 0)
        } else {
            this.start(fromMoon)
        }
    }

    start(fromMoon) {
        this.showTop()
        if (fromMoon) {
            stars.warpIn()
        } else {
            stars.alpha = 0
            const starsEase = ease.add(stars, { alpha: 1 }, { duration: starsFadeTime, ease: 'easeInOutSine' })
            starsEase.on('complete', () => moon.approach())
        }
    }

    complete() {
        if (!this.isComplete) {
            this.hideTop()
            this.isComplete = true
            if (file.shootLevel === 0 && !file.noStory) {
                text.tutorial(() => {
                    stars.warpOut()
                    sounds.play('warp')
                }, 1)
            } else {
                stars.warpOut()
                sounds.play('warp')
            }
        }
    }

    down(point) {
        if (text.visible) {
            text.down(point)
        } else {
            this.isDown = true
            const local = this.toLocal(point)
            if (!back.down(local) && !meter.down(local)) {
                laser.down(point)
            }
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

    showTop() {
        this.top.y = -4
        ease.removeEase(this.top)
        ease.add(this.top, { y: 1 }, { wait: moon.approachTime / 2, duration: settings.uiDropTime, ease: 'easeOutBounce'})
    }

    hideTop() {
        this.top.y = 1
        ease.removeEase(this.top)
        ease.add(this.top, { y: -4 }, { duration: settings.uiDropTime / 2, ease: 'easeInSine' })
    }
}

export const shoot = new Shoot()