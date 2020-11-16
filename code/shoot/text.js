import * as PIXI from 'pixi.js'

import { view } from '../view'
import { Words } from '../Words'
import { file } from '../file'

import * as script from '../../script/script'
import { ease } from 'pixi-ease'
import { sounds } from '../sounds'

const fadeTime = 250
const scale = 0.25
const background = 0x0000aa
const buttonColor = 0x00aa00
const storyColor = 0xaa0000
const padding = 5

class Text extends PIXI.Container {
    constructor() {
        super()
        this.dialog = this.addChild(new PIXI.Container())
        this.box = this.dialog.addChild(new PIXI.Graphics())
        this.text = this.dialog.addChild(new Words())
        this.button = this.dialog.addChild(new PIXI.Container())
        this.button.background = this.button.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        this.button.background.tint = buttonColor
        this.button.words = this.button.addChild(new Words('', { shadow: true }))
        this.storyMode = this.dialog.addChild(new PIXI.Container())
        this.storyMode.background = this.storyMode.addChild(new PIXI.Sprite(PIXI.Texture.WHITE))
        this.storyMode.background.tint = storyColor
        this.storyMode.words = this.storyMode.addChild(new Words('', { shadow: true }))
        this.storyMode.visible = false
        this.dialog.scale.set(scale)
        this.visible = false
        this.alpha = 0
    }

    init() {
        let b = this.button
        b.words.change('ok')
        b.background.width = b.words.width + padding * 2
        b.background.height = b.words.height + padding
        b.words.position.set(b.background.width / 2 - b.words.width / 2, b.background.height / 2 -b.words.height / 2)
        b = this.storyMode
        b.words.change('story off')
        b.background.width = b.words.width + padding * 2
        b.background.height = b.words.height + padding
        b.words.position.set(b.background.width / 2 - b.words.width / 2, b.background.height / 2 -b.words.height / 2)
    }

    change(text) {
        this.text.change(text)
        this.text.wrap(view.width * 0.75 / scale)
        this.button.position.set(this.text.width - this.button.width, this.text.height + padding)
        this.storyMode.position.set(0, this.text.height + padding)
        this.box.clear()
        this.box
            .lineStyle(1, 0xffffff, 1, 1)
            .beginFill(background)
            .drawRect(-padding, -padding, this.text.width + padding * 2, this.text.height + padding * 3 + this.button.height)
            .endFill()
        this.position.set(view.width / 2 - this.dialog.width / 2, view.height / 2 - this.dialog.height / 2)
    }

    down(point) {
        if (this.storyMode.visible && this.storyMode.background.containsPoint(point)) {
            file.noStory = true
        }
        if (this.box.containsPoint(point)) {
            sounds.play('beep')
            this.hide()
            this.callback()
        }
    }

    tutorial(callback, i) {
        this.visible = true
        this.storyMode.visible = false
        this.change(script.tutorial[i])
        this.tutorialIndex = i
        this.callback = callback
        this.show()
    }

    story(callback) {
        this.visible = true
        this.change(script.story[file.shootLevel])
        this.storyMode.visible = file.shootLevel === 2
        this.callback = callback
        this.show()
    }

    show() {
        ease.removeEase(this)
        this.visible = true
        this.alpha = 0
        ease.add(this, { alpha: 1 }, { duration: fadeTime, ease: 'easeInOutSine' })
    }

    hide() {
        ease.removeEase(this)
        const easing = ease.add(this, { alpha: 0 }, { duration: fadeTime, ease: 'easeInOutSine' })
        easing.on('complete', () => this.visible = false)
    }
}

export const text = new Text()