import * as PIXI from 'pixi.js'
import random from 'yy-random'

import { view } from '../view'
import { Words } from '../Words'

const padding = 0.75
const colorCount = 3
const radius = 6

class Title extends PIXI.Container {
    init() {
        this.halfMoon()
        this.title = this.addChild(new Words('shoot the moon', { shadow: true }))

        // todo: fix this for other orientations
        this.title.width = view.width / 2
        this.title.scale.y = this.title.scale.x
        this.subtitle = this.addChild(new Words('(like literally)', { shadow: true, color: 0xdddddd }))
        this.subtitle.width = this.title.width
        this.subtitle.scale.y = this.subtitle.scale.x
        this.subtitle.y = this.title.height + padding
        this.moon.height = this.title.height + this.subtitle.height + padding
        this.moon.scale.x = this.moon.scale.y
        this.title.x = this.subtitle.x = this.moon.width + 0.5
        this.position.set(view.width / 2 - this.width / 2, 1)
    }

    halfMoon() {
        const colors = []
        for (let i = 0; i < colorCount; i++) {
            colors.push(random.get(0xffffff))
        }
        this.moon = this.addChild(new PIXI.Graphics())
    	const radiusSquared = radius * radius
        for (let y = 0; y <= radius * 2; y++) {
            for (let x = 0; x <= radius * 2; x++) {
			    const dx = x - radius
			    const dy = y - radius
			    const distanceSquared = dx*dx + dy*dy
			    if (distanceSquared <= radiusSquared) {
                    this.moon
                        .beginFill(random.pick(colors), x < radius ? 1 : 0.5)
                        .drawRect(x, y, 1, 1)
                        .endFill()
                }
            }
        }
    }
}

export const title = new Title()