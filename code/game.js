import * as PIXI from 'pixi.js'
import FPS from 'yy-fps'

import { file } from './file'
import { view } from './view'
import { sheet } from './sheet'
import { input } from './input'
import { moon } from './moon'
import { laser } from './laser'
import { stars } from './stars'
import { levels } from './levels'

class Game {
    async start() {
        await file.init()
        this.fps = new FPS()
        await sheet.init()
        view.init()
        this.prepareLevels()
        this.create()
        this.update()
        input.init()
    }

    pause() {
        if (this.raf) {
            this.paused = true
            cancelAnimationFrame(this.raf)
            this.raf = null
        }
    }

    resume() {
        this.paused = false
        if (!this.raf) {
            this.update()
        }
    }

    prepareLevels() {
        this.levels = []
        for (const level of levels) {
            for (let i = 0; i < level.count; i++) {
                this.levels.push({ seed: i, colors: level.colors, radius: level.radius })
            }
        }
    }

    create() {
        moon.draw()
        stars.draw()
        this.level = new PIXI.Container()
        this.level.addChild(stars)
        this.level.addChild(moon)
        this.level.addChild(laser)
        view.stage.addChild(this.level)
    }

    update() {
        if (!this.paused) {
            stars.update()
            moon.update()
            laser.update()
            view.update()
            this.fps.frame()
            this.raf = requestAnimationFrame(() => this.update())
        }
    }
}

export const game = new Game()