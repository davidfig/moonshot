import * as PIXI from 'pixi.js'
import intersects from 'intersects'
import random from 'yy-random'

import { ease } from './ease'
import { stars } from './stars'
import { view } from '../view'
import { sounds } from '../sounds'
import { file } from '../file'
import { Words } from '../Words'
import { shoot } from './shoot'
import { meter } from './meter'
import { text } from './text'

const fadeTime = 400
const approachTime = 2000
const framesForSpread = 3
const resetTime = 826
const detachColorChangeTime = 500
const shakeTime = 250
const shakeDistance = 1
const explosionSpeed = [0.1, 0.3]

class Moon extends PIXI.Container {
    constructor() {
        super()
        this.moon = this.addChild(new PIXI.Container())
        this.leaving = this.addChild(new PIXI.Container())
        this.help = this.addChild(new Words())
        this.help.visible = false
    }

    get approachTime() {
        return approachTime
    }

    box(x, y, tint, alpha=1) {
        const point = this.moon.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        point.tint = tint
        point.alpha = alpha
        point.anchor.set(0.5)
        point.width = point.height = 1
        point.position.set(x, y)
        point.original = { x, y }
        return point
    }

    getScale() {
        let ratio = window.innerWidth / window.innerHeight
        if (ratio < 1) {
            ratio = 1 / ratio
        }
        return Math.min(view.width, view.height) / (this.radius * 2 + 1) * (ratio > 1.25 ? 0.75 : 0.5)
    }

    reset() {
        this.state = 'reset'
        while (this.leaving.children.length) {
            this.moon.addChild(this.leaving.children[0])
        }
        for (const block of this.moon.children) {
            ease.add(block, { x: block.original.x, y: block.original.y }, { duration: resetTime, ease: 'easeOutSine' })
            block.visible = true
            block.data.x = block.original.x
            block.data.y = block.original.y
            block.tint = this.colors[block.data.color]
        }
        if (file.shootLevel === 0 && !file.noStory) {
            this.help.visible = true
            this.help.change('<- press here')
            this.help.position.set(this.blockFirstHelp.original.x, this.blockFirstHelp.original.y - this.help.height / 2)
            this.help.alpha = 0
            ease.add(this.help, { alpha: 1 }, { duration: fadeTime, ease: 'easeInOutSine'} )
        }
    }

    approach() {
        this.scale.set(0)
        this.approaching = ease.add(this, { scale: this.getScale() }, { duration: approachTime, ease: 'easeOutSine' })
        this.approaching.on('complete', () => {
            if (file.shootLevel === 0 && !file.noStory && !this.oneColor()) {
                text.tutorial(() => {
                    this.help.visible = true
                    this.help.change('<- press here')
                    this.help.position.set(this.blockFirstHelp.x, this.blockFirstHelp.y - this.help.height / 2)
                    this.help.alpha = 0
                    ease.add(this.help, { alpha: 1 }, { duration: fadeTime, ease: 'easeInOutSine'} )
                }, 1)
            }
            this.approaching = null
        })
        sounds.play('approach')
    }

    draw(level) {
        this.complete = false
        this.moon.removeChildren()
        this.leaving.removeChildren()
        this.colors = level.Colors
        this.radius = level.Radius
        const size = this.radius * 2 + 1
        this.total = 0
        for (let y = 0; y <= this.radius * 2; y++) {
            for (let x = 0; x <= this.radius * 2; x++) {
                const color = level.Blocks[x + y * size]
                if (color !== -1) {
                    const box = this.box(x, y, this.colors[color])
                    box.data = { x, y, color }
                    this.total++
                }
            }
        }
        this.pivot.set(this.radius)
        this.position.set(view.width / 2, view.height / 2)
        this.scale.set(0)
        if (file.shootLevel === 0 && !file.noStory) {
            this.blockFirstHelp = this.moon.children[12]
        }
        this.help.scale.set(0.25 / this.getScale())
    }

    resize() {
        if (this.approaching) {
            ease.removeEase(this)
            this.approaching = null
        }
        this.scale.set(this.getScale())
        for (const child of this.moon.children) {
            child.position.set(child.data.x, child.data.y)
        }
        this.position.set(view.width / 2, view.height / 2)
        this.help.scale.set(0.25 / this.getScale())
    }

    detach(block) {
        this.leaving.addChild(block)
        const angle = Math.atan2(block.y - this.radius, block.x - this.radius) + random.middle(0, 0.25, true)
        const speed = random.range(...explosionSpeed, true)
        block.velocity = [Math.cos(angle) * speed, Math.sin(angle) * speed]
        block.tint = 0xff0000
    }

    inList(compare) {
        for (const entry of this.list) {
            if (compare === entry.block) {
                return true
            }
        }
    }

    findNeighbor(color, level) {
        let found
        do {
            const list = []
            found = false
            for (const block of this.moon.children) {
                if (!this.inList(block) && block.data.color === color) {
                    for (const detach of this.list) {
                        if (Math.abs(block.data.x - detach.block.data.x) <= 1 && Math.abs(block.data.y - detach.block.data.y) <= 1) {
                            list.push({ block, level })
                            found = true
                        }
                    }
                }
            }
            this.list.push(...list)
            level++
        } while (found)
        this.maxSpreadLevel = level
    }

    target(block) {
        this.list = [{ block, level: 0 }]
        this.findNeighbor(block.data.color, 1)
        this.level = 0
        this.spreadFrames = 0
        this.spreading = true
        if (file.shootLevel === 0 && !file.noStory && this.moon.children.length === 23) {
            ease.removeEase(this.help)
            const easing = ease.add(this.help, { alpha: 0 }, { duration: fadeTime, ease: 'easeInOutSine' })
            easing.on('complete', () => this.help.visible = false)
        }
    }

    hasBlock(x, y) {
        for (const move of this.moving) {
            if (move.x === x && move.y === y) {
                return true
            }
        }
        for (const child of this.moon.children) {
            if (child.data.x === x && child.data.y === y) {
                return true
            }
        }
    }

    isCenter(block) {
        return Math.abs(block.data.x - this.radius) < 1 && Math.abs(block.data.y - this.radius) < 1
    }

    compress(i) {
        this.moving = []
        for (const block of this.moon.children) {
            if (!this.isCenter(block)) {
                const angle = Math.atan2(this.radius - block.data.y, this.radius - block.data.x)
                const x = Math.round(block.data.x + Math.cos(angle))
                const y = Math.round(block.data.y + Math.sin(angle))
                if (!this.hasBlock(x, y)) {
                    this.moving.push({ child: block, x, y })
                }
            }
        }
        if (this.moving.length) {
            for (const move of this.moving) {
                move.child.data.x = move.x
                move.child.data.y = move.y
                move.child.x = move.x
                move.child.y = move.y
            }
            this.compress(i + 1)
        }
    }

    updateSpread() {
        this.spreadFrames++
        if (this.spreadFrames === framesForSpread) {
            this.spreadFrames = 0
            for (const entry of this.list) {
                if (entry.level === this.level) {
                    entry.block.tint = 0xff0000
                }
            }
            this.level++
            if (this.level === this.maxSpreadLevel) {
                for (const entry of this.list) {
                    this.detach(entry.block)
                    ease.add(entry.block, { blend: this.colors[entry.block.data.color] }, { duration: detachColorChangeTime, ease: 'easeInOutSine' })
                }
                this.spreading = false
                this.shaking = Date.now()
                this.compress(1)
                sounds.play('separate')
                if (file.shootLevel === 0 && !file.noStory) {
                    if (this.moon.children.length) {
                        if (this.oneColor()) {
                            if (!this.help.visible) {
                                this.help.visible = true
                                this.help.change('<- press here')
                            }
                            this.help.change('<- and here')
                            const block = this.moon.children[6]
                            this.help.position.set(block.x, block.y - this.help.height / 2)
                        } else {
                            meter.showHelp(true)
                            ease.removeEase(this.help)
                            const easing = ease.add(this.help, { alpha: 0 }, { duration: fadeTime, ease: 'easeInOutSine' })
                            easing.on('complete', () => this.help.visible = false)
                        }
                    }
                }
            }
        }
    }

    oneColor() {
        const colors = {}
        for (const moon of this.moon.children) {
            colors[moon.tint] = true
        }
        return Object.keys(colors).length === 1
    }

    updateShake() {
        if (Date.now() > this.shaking + shakeTime) {
            this.shaking = null
            this.moon.position.set(0)
        } else {
            this.moon.position.set(random.middle(0, shakeDistance, true), random.middle(0, shakeDistance, true))
        }
    }

    updateLeaving() {
        let leaving = false
        for (const child of this.leaving.children) {
            if (child.visible) {
                child.position.set(child.x + child.velocity[0], child.y + child.velocity[1])
                const bounds = child.getBounds()
                if (bounds.right < 0 || bounds.left > window.innerWidth ||
                    bounds.bottom < 0 || bounds.top > window.innerHeight) {
                    child.visible = false
                }
                leaving = true
            }
        }
        return leaving
    }

    update() {
        if (!stars.isWarping()) {
            if (this.spreading === true) {
                this.updateSpread()
            }
            if (this.leaving.children.length) {
                if (!this.updateLeaving() && this.leaving.children.length === this.total) {
                    shoot.complete()
                }
            }
            if (this.shaking) {
                this.updateShake()
            }
        }
    }

    closestTarget(point) {
        let dist = Infinity, target
        for (const block of this.moon.children) {
            const d = Math.pow(block.x - point.x, 2) + Math.pow(block.y - point.y, 2)
            if (d < dist) {
                target = block
                dist = d
            }
        }
        return target
    }

    closestOnLine(x0, y0, x1, y1) {
        const list = []
        for (const point of this.moon.children) {
            if (intersects.boxLine(point.x, point.y, 1, 1, x0, y0, x1, y1)) {
                list.push(point)
            }
        }
        let distance = Infinity, p
        for (const point of list) {
            const d = Math.pow(point.x + 0.5 - x0, 2) + Math.pow(point.y + 0.5 - y0, 2)
            if (d < distance) {
                distance = d
                p = point
            }
        }
        return p
    }

    canFire() {
        return this.moon.children.length
    }
}

export const moon = new Moon()