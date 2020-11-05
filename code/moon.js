import * as PIXI from 'pixi.js'
import intersects from 'intersects'
import random from 'yy-random'
import { ease } from 'pixi-ease'

import { view } from './view'

const framesForSpread = 3
const detachColorChangeTime = 500
const shakeTime = 250
const shakeDistance = 1
const explosionSpeed = [0.1, 0.3]

class Moon extends PIXI.Container {
    constructor() {
        super()
        this.moon = this.addChild(new PIXI.Container())
        this.leaving = this.addChild(new PIXI.Container())
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

    draw(data) {
        this.moon.removeChildren()
        this.colors = []
        this.radius = data.radius
        for (let i = 0; i < data.colors; i++) {
            this.colors.push(random.color())
        }
        const radiusSquared = this.radius * this.radius
        const center = this.radius
        this.middleX = view.width / 2  - center
        this.middleY = view.height / 2 - center
        for (let y = 0; y <= this.radius * 2; y++) {
            for (let x = 0; x <= this.radius * 2; x++) {
                const dx = x - center
                const dy = y - center
                const distanceSquared = dx * dx + dy * dy
                if (distanceSquared <= radiusSquared) {
                    const color = random.get(this.colors.length)
                    const box = this.box(x + this.middleX, y + this.middleY, this.colors[color])
                    box.data = { x, y, color }
                }
            }
        }
    }

    resize() {
        this.middleX = view.width / 2  - this.radius
        this.middleY = view.height / 2 - this.radius
        for (const child of this.moon.children) {
            child.position.set(child.data.x + this.middleX, child.data.y + this.middleY)
        }
    }

    detach(block) {
        this.leaving.addChild(block)
        const angle = Math.atan2(block.y - view.height / 2, block.x - view.width / 2) + random.middle(0, 0.25, true)
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
                        if (Math.abs(block.x - detach.block.x) <= 1 && Math.abs(block.y - detach.block.y) <= 1) {
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
                move.child.x = move.x + this.middleX
                move.child.y = move.y + this.middleY
            }
            this.compress(i + 1)
        }
    }

    update() {
        if (this.spreading === true) {
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
                }
            }
        }
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
}

export const moon = new Moon()