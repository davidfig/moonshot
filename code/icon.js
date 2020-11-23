import * as PIXI from 'pixi.js'
import random from 'yy-random'

import { view } from './view'
import { Words } from './Words'

class Icon extends PIXI.Graphics {
    init() {
        // this.halfMoon()
        this.by()
        view.stage.addChild(this)
        view.update()
    }

    by() {
        const words = this.addChild(new Words('a game by David Figatner', { shadow: true }))
        words.scale.set(0.5)
        words.position.set(1, 1)
        view.update()
    }

    halfMoon() {
        const radius = 8
        const colors = [0xC44BE5, 0xD3306C, 0x18365F]
    	const radiusSquared = radius * radius
        for (let y = 0; y <= radius * 2; y++) {
            for (let x = 0; x <= radius * 2; x++) {
			    const dx = x - radius
			    const dy = y - radius
			    const distanceSquared = dx*dx + dy*dy
			    if (distanceSquared <= radiusSquared) {
                    this
                        .beginFill(random.pick(colors), x < radius ? 1 : 0.5)
                        .drawRect(x, y, 1, 1)
                        .endFill()
                }
            }
        }
    }
}

export const icon = new Icon()