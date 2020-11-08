import * as PIXI from 'pixi.js'

import { view } from '../view'
import { Words } from '../Words'
import { stars } from './stars'

const padding = 8
const shadow = 0.25
const shadowTint = 0x888888

const items = [
    'play',
    'reset',
]

class Menu extends PIXI.Container {
    constructor() {
        super()
        this.addChild(stars)
        this.title = this.addChild(new PIXI.Container())
        this.menuShadow = this.addChild(new PIXI.Container())
        this.menu = this.addChild(new PIXI.Container())
    }

    drawTitle() {
        this.titleShadow = this.title.addChild(new Words('shoot the moon (like literally)'))
        this.titleShadow.tint = shadowTint
        this.title = this.title.addChild(new Words('shoot the moon (like literally)'))
        this.title.width = view.width - 2
        this.title.scale.y = this.title.scale.x
        this.titleShadow.scale.set(this.title.scale.x)
        this.title.position.set(view.width / 2 - this.title.width / 2, 1)
        this.titleShadow.position.set(this.title.x + shadow, this.title.y + shadow)
    }

    init() {
        stars.draw()
        this.drawTitle()
        let y = 0, longest = 0
        for (const name of items) {
            const itemShadow = this.menuShadow.addChild(new Words(name))
            itemShadow.tint = shadowTint
            const item = this.menu.addChild(new Words(name))
            item.y = y
            itemShadow.y = y
            y += item.height + padding
            longest = Math.max(longest, item.width)
        }
        for (let i = 0; i < this.menu.children.length; i++) {
            const menu = this.menu.children[i]
            menu.x = longest / 2 - menu.width / 2
            const menuShadow = this.menuShadow.children[i]
            menuShadow.x = menu.x

        }
        this.menu.scale.set(0.5)
        this.menuShadow.scale.set(0.5)
        this.menu.position.set(view.width / 2 - this.menu.width / 2, view.height / 2 - this.menu.height / 2)
        this.menuShadow.position.set(this.menu.x + shadow, this.menu.y + shadow)
    }

    down() {}

    move() {}

    up() {}

    resize() {
        stars.resize()
    }

    change() {}

    update() {
        stars.update()
    }
}

export const menu = new Menu()