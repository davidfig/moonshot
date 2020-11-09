import * as PIXI from 'pixi.js'
import random from 'yy-random'

import { view } from '../view'
import { moon } from './moon'
import { meter } from './meter'

const fireTime = 200
const fadeTime = 200

class Laser extends PIXI.Container {
    constructor() {
        super()
        this.state = ''
        this.angleOfLine = Infinity
    }

    reset() {
        this.removeChildren()
        this.state = ''
        this.isDown = false
    }

    box(x, y, tint, alpha=1) {
        const point = this.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        point.tint = tint
        point.alpha = alpha
        point.anchor.set(0.5)
        point.width = point.height = 1
        point.position.set(x, y)
    }

    line(x0, y0, x1, y1, tint, alpha) {
        const points = {}
        points[`${x0}-${y0}`] = true
        let dx = x1 - x0;
        let dy = y1 - y0;
        let adx = Math.abs(dx);
        let ady = Math.abs(dy);
        let eps = 0;
        let sx = dx > 0 ? 1 : -1;
        let sy = dy > 0 ? 1 : -1;
        if (adx > ady) {
            for (let x = x0, y = y0; sx < 0 ? x >= x1 : x <= x1; x += sx) {
                points[`${x}-${y}`] = true
                eps += ady;
                if ((eps << 1) >= adx) {
                    y += sy;
                    eps -= adx;
                }
            }
        } else {
            for (let x = x0, y = y0; sy < 0 ? y >= y1 : y <= y1; y += sy) {
                points[`${x}-${y}`] = true
                eps += adx;
                if ((eps << 1) >= ady) {
                    x += sx;
                    eps -= ady;
                }
            }
        }
        for (const key in points) {
            this.box(...key.split('-'), tint, alpha)
        }
    }

    update() {
        if (this.state === 'fire') {
            if (Date.now() >= this.time + fireTime) {
                this.state = 'fade'
                this.time = Date.now()
            }
        } else if (this.state === 'fade') {
            if (Date.now() >= this.time + fadeTime) {
                this.state = ''
                this.removeChildren()
            }
        }
        if (this.state !== '') {
            this.removeChildren()
            const center = view.size / 2
            if (this.state === 'aim') {
                const p2 = moon.closestTarget(this.point)
                if (!p2) {
                    this.state = ''
                } else {
                    this.target = p2
                    const local = this.toLocal(p2.position, moon)
                    this.aim = [local.x, local.y]
                }
            }
            let tint, alpha
            if (this.state === 'aim') {
                tint = 0xffffff
                alpha = 0.4
            } else if (this.state === 'fire') {
                tint = 0xff0000
                alpha = random.range(0.75, 1, true)
            } else if (this.state === 'fade') {
                tint = 0xff0000
                alpha = 1 - (Date.now() - this.time) / fadeTime
            } else {
                return
            }
            this.line(
                ...this.aim,
                Math.round(center + Math.cos(this.angleOfLine) * view.max),
                Math.round(center + Math.sin(this.angleOfLine) * view.max),
                tint, alpha,
            )
        }
    }

    down(point) {
        if (meter.canFire() && moon.canFire()) {
            this.isDown = true
            const angle = Math.atan2(point.y - window.innerHeight / 2, point.x - window.innerWidth / 2)
            if (this.state === '') {
                this.state = 'aim'
                this.point = moon.moon.toLocal(point)
                this.angleOfLine = angle
            }
        }
    }

    move(point) {
        if (this.isDown && this.state === 'aim') {
            this.point = moon.moon.toLocal(point)
            this.angleOfLine = Math.atan2(point.y - window.innerHeight / 2, point.x - window.innerWidth / 2)
        }
    }

    up() {
        if (this.isDown && this.state === 'aim') {
            if (!this.target) {
                this.state = ''
            } else {
                this.state = 'fire'
                this.time = Date.now()
                moon.target(this.target)
                meter.fire()
            }
        }
    }
}

export const laser = new Laser()