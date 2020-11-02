import * as PIXI from 'pixi.js'
import random from 'yy-random'

import { view } from './view'

const count = 20
const maxTwinkle = 0.1

class Stars extends PIXI.Container {
    draw() {
        for (let i = 0; i < count; i++) {
            const star = this.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
            const x = random.range(1, view.width) - 0.5
            const y = random.range(1, view.height) - 0.5
            star.position.set(x, y)
            star.width = star.height = 1
            star.alpha = star.alphaSave = random.range(0.2, 0.75, true)
            star.twinkle = random.range(0.01, 0.02)
            star.direction = random.sign()
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
