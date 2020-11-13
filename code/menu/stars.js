import * as PIXI from 'pixi.js'
import random from 'yy-random'
import intersects from 'intersects'

import { view } from '../view'

const count = 30
const maxTwinkle = 0.1

class Stars extends PIXI.Container {
    constructor() {
        super()
    }

    overlap(star) {
        for (const check of this.children) {
            if (check !== star && intersects.boxBox(check.x - 0.5, check.y - 0.5, 1, 1, star.x - 0.5, star.y - 0.5, 1, 1)) {
                return true
            }
        }
    }

    draw() {
        random.reset()
        for (let i = 0; i < count; i++) {
            const star = this.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
            star.anchor.set(0.5)
            do {
                star.location = [random.get(1, true), random.get(1, true)]
                star.position.set(0.5 + star.location[0] * (view.width - 0.5), 0.5 + star.location[1] * (view.height - 0.5))
            } while (this.overlap(star))
            star.width = star.height = 1
            star.alpha = star.alphaSave = random.range(0.2, 0.75, true)
            star.twinkle = random.range(0.01, 0.02)
            star.direction = random.sign()
        }
    }

    resize() {
        for (const star of this.children) {
            star.position.set(0.5 + star.location[0] * (view.width - 1), 0.5 + star.location[1] * (view.height - 1))
        }
    }


    update() {
        for (const star of this.children) {
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
}

export const stars = new Stars()
