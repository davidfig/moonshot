import * as PIXI from 'pixi.js'
import random from 'yy-random'

import { view } from './view'

const count = 20
const maxTwinkle = 0.1

class Stars extends PIXI.Container {
    draw() {
        for (let i = 0; i < count; i++) {
            const star = this.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
            star.location = [random.get(1, true), random.get(1, true)]
            star.position.set(star.location[0] * view.width, star.location[1] * view.height)
            star.width = star.height = 1
            star.alpha = star.alphaSave = random.range(0.2, 0.75, true)
            star.twinkle = random.range(0.01, 0.02)
            star.direction = random.sign()
        }
    }

    resize() {
        for (const star of this.children) {
            star.position.set(star.location[0] * view.width, star.location[1] * view.height)
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
