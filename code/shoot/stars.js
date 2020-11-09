import * as PIXI from 'pixi.js'
import random from 'yy-random'
import intersects from 'intersects'

import { state } from '../state'
import { view } from '../view'
import { moon } from './moon'

const count = 30
const maxTwinkle = 0.1
const warpFrames = 30

class Stars extends PIXI.Container {
    constructor() {
        super()
        this.stars = this.addChild(new PIXI.Container())
        this.warping = this.addChild(new PIXI.Graphics())
        this.flash = this.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        this.flash.visible = false
        this.flash.tint = 0xaaaaaa
        this.state = 'twinkle'
    }

    overlap(star) {
        for (const check of this.stars.children) {
            if (check !== star && intersects.boxBox(check.x - 0.5, check.y - 0.5, 1, 1, star.x - 0.5, star.y - 0.5, 1, 1)) {
                return true
            }
        }
    }

    draw(seed) {
        this.state = 'twinkle'
        this.stars.removeChildren()
        this.warping.clear()
        this.stars.visible = true
        this.warping.visible = false
        random.seedOld(seed)
        for (let i = 0; i < count; i++) {
            const star = this.stars.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
            star.anchor.set(0.5)
            do {
                star.location = [random.get(1, true), random.get(1, true)]
                star.position.set(star.location[0] * view.width, star.location[1] * view.height)
            } while (this.overlap(star))
            star.width = star.height = 1
            star.alpha = star.alphaSave = random.range(0.2, 0.75, true)
            star.twinkle = random.range(0.01, 0.02)
            star.direction = random.sign()
        }
        this.flash.width = view.width + 1
        this.flash.height = view.height + 1
    }

    resize() {
        for (const star of this.stars.children) {
            star.position.set(star.location[0] * view.width, star.location[1] * view.height)
        }
        this.flash.width = view.width + 1
        this.flash.height = view.height + 1
    }

    // from https://stackoverflow.com/a/45408622/1955997
    calculateExitPoint(from, to) {
        const directionV = from.y < to.y ? 1 : -1
        const directionH = from.x < to.x ? 1 : -1
        const a = directionV > 0 ? view.height - from.y : from.y
        const a1 = directionV > 0 ? to.y - from.y : from.y - to.y
        const b1 = directionH > 0 ? to.x - from.x : from.x - to.x
        const b = a / (a1 / b1)
        const tgAlpha = b / a
        const b2 = directionH > 0 ? view.width - to.x : to.x
        const a2 = b2 / tgAlpha
        const point = { x: from.x + b * directionH, y: to.y + a2 * directionV }
        if (point.x > view.width + 1) {
            point.x = view.width + 1
        } else if (point.x < -1) {
            point.x = -1
        } else {
            point.y = directionV > 0 ? view.height + 1 : -1
        }
        return point
    }

    warpOut() {
        this.state = 'warp-out'
        this.warpFrame = 0
        this.flash.alpha = 0
        this.flash.visible = true
        this.stars.visible = false
        this.warping.visible = true
        const center = { x: view.width / 2, y: view.height / 2 }
        for (const star of this.stars.children) {
            star.to = this.calculateExitPoint(center, star.position)
            star.distance = Math.sqrt(Math.pow(star.x - star.to.x, 2) + Math.pow(star.y - star.to.y, 2))
            const angle = Math.atan2(star.to.y - star.y, star.to.x - star.x)
            star.cos = Math.cos(angle)
            star.sin = Math.sin(angle)
        }
    }

    warpIn() {
        this.state = 'warp-in'
        this.stars.visible = false
        this.warpFrame = 0
        this.warping.visible = true
        this.warping
            .clear()
            .lineStyle(1, 0xffffff, 1, 0.5)
        const center = { x: view.width / 2, y: view.height / 2 }
        for (const star of this.stars.children) {
            star.to = this.calculateExitPoint(center, star.position)
            star.distance = Math.sqrt(Math.pow(star.x - star.to.x, 2) + Math.pow(star.y - star.to.y, 2))
            const angle = Math.atan2(star.to.y - star.y, star.to.x - star.x)
            star.cos = Math.cos(angle)
            star.sin = Math.sin(angle)
            this.warping
                .moveTo(star.position.x, star.position.y)
                .lineTo(star.to.x, star.to.y)
        }
    }

    twinkleUpdate() {
        for (const star of this.stars.children) {
            if (star.direction === 1) {
                star.alpha += star.twinkle
                if (star.alpha >= star.alphaSave + maxTwinkle) {
                    star.direction = -1
                    star.alpha = star.alphaSave + maxTwinkle
                }
            } else {
                star.alpha -= star.twinkle
                if (star.alpha <= star.alphaSave - maxTwinkle) {
                    star.direction = 1
                    star.alpha = star.alphaSave - maxTwinkle
                }
            }
        }
    }

    warpOutUpdate() {
        this.warpFrame++
        const percent = this.warpFrame / warpFrames
        if (percent <= 1) {
            this.warping
                .clear()
                .lineStyle(1, 0xffffff, 1, 0.5)
            for (const star of this.stars.children) {
                const dist = star.distance * percent
                this.warping
                    .moveTo(star.position.x, star.position.y)
                    .lineTo(star.position.x + star.cos * dist, star.position.y + star.sin * dist)
            }
        } else if (percent <= 2) {
            this.flash.alpha = percent - 1
        } else {
            this.warping.clear()
            state.next()
        }
    }

    warpInUpdate() {
        this.warpFrame++
        const percent = this.warpFrame / warpFrames
        if (percent <= 1) {
            this.flash.alpha = 1 - percent
        }
        if (percent >= 0.25 && percent <= 1.25) {
            this.warping
                .clear()
                .lineStyle(1, 0xffffff, 1, 0.5)
            for (const star of this.stars.children) {
                const dist = star.distance * (1.25 - percent)
                this.warping
                    .moveTo(star.position.x - star.cos, star.position.y - star.sin)
                    .lineTo(star.position.x + star.cos * dist, star.position.y + star.sin * dist)
            }
        }
        if (percent >= 1.5) {
            this.warping.clear()
            this.stars.visible = true
            this.flash.visible = false
            this.state = 'twinkle'
            moon.approach()
        }
    }

    isWarping() {
        return this.state.includes('warp')
    }

    update() {
        if (this.state === 'twinkle') {
            this.twinkleUpdate()
        } else if (this.state === 'warp-out') {
            this.warpOutUpdate()
        } else if (this.state === 'warp-in') {
            this.warpInUpdate()
        }
    }
}

export const stars = new Stars()
