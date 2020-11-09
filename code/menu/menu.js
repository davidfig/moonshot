import * as PIXI from 'pixi.js'

import { view } from '../view'
import { Words } from '../Words'
import { stars } from './stars'
import { title } from './title'
import { file } from '../file'
import { state } from '../state'

const framesToAdvance = 1000 / 60 * 0.5
const padding = 8
const disabled = 0x555555

class Menu extends PIXI.Container {
    constructor() {
        super()
        this.addChild(stars)
        this.title = this.addChild(title)
        this.menu = this.addChild(new PIXI.Container())
    }

    init() {
        stars.draw()
        title.init()
        this.draw()
        this.menu.scale.set(0.5)
        this.menu.position.set(view.width / 2 - this.menu.width / 2, view.height / 2 - this.menu.height / 2)
    }

    draw() {
        let y = 0, longest = 0
        this.menu.removeChildren()
        this.shoot()
        for (const item of this.menu.children) {
            longest = Math.max(longest, item.width)
        }
        for (const item of this.menu.children) {
            item.x = longest / 2 - item.width / 2
            item.y = y
            y += item.height + padding
        }
    }

    shoot() {
        if (!file.shootMax) {
            this.play = this.menu.addChild(new Words('play'))
            this.level = null
        } else {
            const max = 34
            this.level = this.menu.addChild(new PIXI.Container())
            this.back = this.level.addChild(new Words('<'))
            this.number = this.level.addChild(new Words(`level ${file.shootLevel + 1}`))
            this.number.x = 5 + max / 2 - this.number.width / 2
            this.next = this.level.addChild(new Words('>'))
            this.next.x = max + 7
            this.play = null
            if (file.shootLevel === 0) {
                this.back.tint = disabled
            }
            if (file.shootMax === file.shootLevel) {
                this.next.tint = disabled
            }
        }
    }

    reset() {}
    move() {}

    down(point) {
        if (this.back.containsPoint(point)) {
            if (this.back.tint === disabled) {
                console.log('left disabled')
            } else {
                this.changeLevel(-1)
                this.holding = 'back'
                this.holdingFrames = -framesToAdvance * 2
            }
        } else if (this.next.containsPoint(point)) {
            if (this.next.tint === disabled) {
                console.log('right disabled')
            } else {
                this.changeLevel(1)
                this.holding = 'next'
                this.holdingFrames = -framesToAdvance * 2
            }
        }
    }

    up(point) {
        if ((this.play && this.play.containsPoint(point)) || (this.number && this.number.containsPoint(point))) {
            state.change('shoot')
        }
        this.holding = ''
    }

    changeLevel(delta) {
        file.shootLevel += delta
        this.draw()
    }

    resize() {
        stars.resize()
    }

    change() {
        this.draw()
    }

    update() {
        stars.update()
        if (this.holding) {
            this.holdingFrames++
            if (this.holdingFrames > framesToAdvance) {
                this.cancelUp = true
                this.holdingFrames = 0
                if (this.holding === 'next') {
                    if (this.next.tint === disabled) {
                        this.holding = ''
                    } else {
                        this.changeLevel(1)
                    }
                } else if (this.holding === 'back') {
                    if (this.back.tint === disabled) {
                        this.holding = ''
                    } else {
                        this.changeLevel(-1)
                    }
                }
            }
        }
    }
}

export const menu = new Menu()