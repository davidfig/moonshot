import { file } from './file'
import { shoot }  from './shoot/shoot'
import { menu } from './menu/menu'
import { view } from './view'

class State {
    init() {
        this.states = {
            'menu': menu,
            'shoot': shoot,
        }
        for (const key in this.states) {
            this.states[key].init()
        }
        this.state = 'shoot'
    }

    set state(state) {
        if (state !== this._state) {
            if (this._state) {
                view.stage.removeChild(this.states[this.state])
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
            file.shoot.level++
            this.states[this.state].change(true)
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