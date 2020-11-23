import { file } from './file'
import { shoot }  from './shoot/shoot'
import { menu } from './menu/menu'
import { view } from './view'
import { story } from '../script/script'
import * as settings from './settings'

class State {
    init() {
        this.states = {
            'menu': menu,
            'shoot': shoot,
        }
        for (const key in this.states) {
            this.states[key].init()
        }
        this.state = settings.state || 'menu'
    }

    set state(state) {
        if (state !== this._state) {
            if (this._state) {
                view.stage.removeChild(this.states[this.state])
                this.states[this.state].reset()
            }
            this._state = state
            view.stage.addChild(this.states[this.state])
            this.states[this.state].change()
        }
    }
    get state() {
        return this._state
    }

    next() {
        if (this.state === 'shoot') {
            if (file.shootLevel === story.length - 1) {
                this.states[this.state].endScreen()
            } else {
                file.shootLevel++
                this.states[this.state].change(true)
            }
        }
    }

    resize() {
        for (const key in this.states) {
            this.states[key].resize()
        }
    }

    change(state) {
        this.state = state
    }

    down(point) {
        this.states[this.state].down(point)
    }

    move(point) {
        this.states[this.state].move(point)

    }

    up(point) {
        this.states[this.state].up(point)
    }

    update() {
        this.states[this.state].update()
    }

}

export const state = new State()