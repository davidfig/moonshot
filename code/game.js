import FPS from 'yy-fps'

import { file } from './file'
import { state } from './state'
import { view } from './view'
import { sheet } from './sheet'
import { input } from './input'

class Game {
    async start() {
        await file.init()
        this.fps = new FPS()
        await sheet.init()
        view.init()
        state.init()
        this.update()
        input.init()
        window.addEventListener('resize', () => this.resize())
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
            this.fps.frame()
            this.raf = requestAnimationFrame(() => this.update())
        }
    }
}

export const game = new Game()