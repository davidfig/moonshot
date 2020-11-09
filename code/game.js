import FPS from 'yy-fps'

import { file } from './file'
import { state } from './state'
import { view } from './view'
import { sheet } from './sheet'
import { input } from './input'
import { sounds } from './sounds'
// import { icon } from './icon'
import * as settings from './settings'

class Game {
    async start() {
        sounds.load()
        await file.init()
        await sheet.init()
        view.init()
        // icon.init()
        state.init()
        if (!settings.release) {
            this.fps = new FPS()
        }
        this.update()
        input.init()
        window.addEventListener('resize', () => this.resize())
    }

    pause() {
        if (this.raf) {
            this.paused = true
            cancelAnimationFrame(this.raf)
            sounds.pause()
            this.raf = null
        }
    }

    resume() {
        this.paused = false
        sounds.resume()
        if (!this.raf) {
            this.update()
        }
    }

    resize() {
        view.resize()
        state.resize()
        if (this.paused) {
            view.update()
        }
    }

    update() {
        if (!this.paused) {
            state.update()
            view.update()
            if (this.fps) {
                this.fps.frame()
            }
            this.raf = requestAnimationFrame(() => this.update())
        }
    }
}

export const game = new Game()