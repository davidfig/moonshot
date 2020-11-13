import * as PIXI from 'pixi.js'

import { view } from '../view'
import { Words } from '../Words'
import { stars } from './stars'
import { title } from './title'
import { file } from '../file'
import { state } from '../state'
import { sounds } from '../sounds'

const framesToAdvance = 1000 / 60 * 0.5
const padding = 6
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
    }

    draw() {
        this.menu.removeChildren()
        this.menu.scale.set(0.4)
        this.shoot()
        this.story()
        this.sound()
        this.about()
        let longest = 0
        for (const item of this.menu.children) {
            longest = Math.max(longest, item.width)
        }
        let y = 0
        for (const item of this.menu.children) {
            item.x = longest / 2 - item.width / 2
            item.y = y
            y += item.height + padding
        }
        const top = title.height
        const remaining = view.height - top
        this.menu.position.set(view.width / 2 - this.menu.width / 2 , top + remaining / 2 - this.menu.height / 2)
    }

    shoot() {
        if (!file.shootMax) {
            this.play = this.menu.addChild(new Words('play'))
            this.level = null
        } else {
            const max = 34
            this.level = this.menu.addChild(new PIXI.Container())
            this.back = this.level.addChild(new Words('<', { shadow: true }))
            this.number = this.level.addChild(new Words(`level ${file.shootLevel + 1}`, { shadow: true }))
            this.number.x = 5 + max / 2 - this.number.width / 2
            this.next = this.level.addChild(new Words('>', { shadow: true }))
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

    story() {
        this.storyMenu = this.menu.addChild(new Words(file.noStory ? 'story off' : 'story on', { shadow: true }))
    }

    sound() {
        this.soundMenu = this.menu.addChild(new Words(file.sound ? 'sounds on' : 'sounds off', { shadow: true }))
    }

    about() {
        this.aboutMenu = this.menu.addChild(new Words('About', { shadow: true }))
    }

    reset() {}
    move() {}

    down(point) {
        if (this.back.containsPoint(point)) {
            if (this.back.tint === disabled) {
                sounds.play('buzzer')
            } else {
                this.changeLevel(-1)
                this.holding = 'back'
                this.holdingFrames = -framesToAdvance * 2
            }
        } else if (this.next.containsPoint(point)) {
            if (this.next.tint === disabled) {
                sounds.play('buzzer')
            } else {
                this.changeLevel(1)
                this.holding = 'next'
                this.holdingFrames = -framesToAdvance * 2
            }
        } else if (this.soundMenu.containsPoint(point)) {
            file.sound = !file.sound
            if (file.sound) {
                sounds.play('beep')
            }
            this.draw()
        } else if (this.aboutMenu.containsPoint(point)) {
            sounds.play('beep')
            window.open('https://yopeyopey.com/games/shoot-the-moon/', { target: '_blank' })
        } else if (this.storyMenu.containsPoint(point)) {
            file.noStory = !file.noStory
            sounds.play('beep')
            this.draw()
        }
    }

    up(point) {
        if ((this.play && this.play.containsPoint(point)) || (this.number && this.number.containsPoint(point))) {
            state.change('shoot')
            sounds.play('beep')
        }
        this.holding = ''
    }

    changeLevel(delta) {
        file.shootLevel += delta
        this.draw()
        sounds.play('beep')
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