import * as PIXI from 'pixi.js'
import intersects from 'intersects'

import { view } from './view'

import random from 'yy-random'

const radius = 4
const colors = 2
const shakeTime = 250
const shakeDistance = 1
const explosionSpeed = [0.1, 0.3]

class Moon extends PIXI.Container {
    constructor() {
        super()
        this.moon = this.addChild(new PIXI.Container())
        this.leaving = this.addChild(new PIXI.Container())
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

    box(x, y, tint, alpha=1) {
        const point = this.moon.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        point.tint = tint
        point.alpha = alpha
        point.anchor.set(0.5)
        point.width = point.height = 1
        point.position.set(x, y)
        return point
    }

    draw() {
        this.moon.removeChildren()
        this.colors = []
        for (let i = 0; i < colors; i++) {
            this.colors.push(random.color())
        }
        const radiusSquared = radius * radius
        const center = radius
        this.middle = view.size / 2 - center
        for (let y = 0; y <= radius * 2; y++) {
            for (let x = 0; x <= radius * 2; x++) {
                const dx = x - center
                const dy = y - center
                const distanceSquared = dx * dx + dy * dy
                if (distanceSquared <= radiusSquared) {
                    const box = this.box(x + this.middle, y + this.middle, random.pick(this.colors))
                    box.coordinate = { x, y }
                }
            }
        }
    }

    detach(block) {
        this.leaving.addChild(block)
        const angle = Math.atan2(block.y - view.size / 2, block.x - view.size / 2) + random.middle(0, 0.25, true)
        const speed = random.range(...explosionSpeed, true)
        block.velocity = [Math.cos(angle) * speed, Math.sin(angle) * speed]
    }

    findNeighbor(tint) {
        for (const child of this.moon.children) {
            if (child.tint === tint) {
                for (const detach of this.list) {
                    if (Math.abs(child.x - detach.x) <= 1 && Math.abs(child.y - detach.y) <= 1) {
                        this.list.push(child)
                        this.detach(child)
                        return true
                    }
                }
            }
        }
    }

    target(block) {
        this.detach(block)
        this.list = [block]
        while (this.findNeighbor(block.tint)) {}
        this.shaking = Date.now()
        this.compress()
    }

    hasBlock(x, y) {
        for (const move of this.moving) {
            if (move.x === x && move.y === y) {
                return true
            }
        }
        for (const child of this.moon.children) {
            if (child.coordinate.x === x && child.coordinate.y === y) {
                return true
            }
        }
    }

    isCenter(block) {
        return Math.abs(block.coordinate.x - radius) < 1 && Math.abs(block.coordinate.y - radius) < 1
    }

    compress() {
        this.moving = []
        for (const block of this.moon.children) {
            if (!this.isCenter(block)) {
                const angle = Math.atan2(view.size / 2 - block.y, view.size / 2 - block.x)
                const x = Math.round(block.coordinate.x + Math.cos(angle))
                const y = Math.round(block.coordinate.y + Math.sin(angle))
                if (!this.hasBlock(x, y)) {
                    this.moving.push({ child: block, x, y })
                }
            }
        }
        for (const move of this.moving) {
            move.child.coordinate.x = move.x
            move.child.coordinate.y = move.y
            move.child.x = move.x + this.middle
            move.child.y = move.y + this.middle
        }
        if (this.moving.length) {
            this.compress()
        }
    }

    update() {
        for (const child of this.leaving.children) {
            child.position.set(child.x + child.velocity[0], child.y + child.velocity[1])
            if (child.x - 0.5 > view.width || child.x + 0.5 < 0 ||
                child.y - 0.5 > view.height || child.y + 0.5 < 0) {
                child.visible = false
            }
        }
        if (this.shaking) {
            if (Date.now() > this.shaking + shakeTime) {
                this.shaking = null
                this.moon.position.set(0)
            } else {
                this.moon.position.set(random.middle(0, shakeDistance, true), random.middle(0, shakeDistance, true))
            }
        }
    }
}

export const moon = new Moon()