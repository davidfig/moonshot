import { state } from './state'

class Input {
    init() {
        const view = document.querySelector('.view')
        view.addEventListener('mousedown', e => this.down(e))
        view.addEventListener('mousemove', e => this.move(e))
        view.addEventListener('mouseup', e => this.up(e))

        view.addEventListener('touchstart', e => this.down(e))
        view.addEventListener('touchmove', e => this.move(e))
        view.addEventListener('touchend', e => this.up(e))

        window.addEventListener('keydown', e => this.keyDown(e))
        window.addEventListener('keydown', e => this.keyUp(e))
    }

    translateEvent(e) {
        let x, y
        if (typeof e.touches === 'undefined') {
            x = e.clientX
            y = e.clientY
        } else {
            if (e.touches.length) {
                x = e.touches[0].clientX
                y = e.touches[0].clientY
            } else {
                x = e.changedTouches[0].clientX
                y = e.changedTouches[0].clientY
            }
        }
        return { x, y }
    }

    down(e) {
        const point = this.translateEvent(e)
        state.down(point)
        e.preventDefault()
    }

    move(e) {
        const point = this.translateEvent(e)
        state.move(point)
    }

    up(e) {
        const point = this.translateEvent(e)
        state.up(point)
    }

    keyDown(e) {
        switch (e.code) {}
    }

    keyUp(e) {
        switch (e.code) {}
    }
}

export const input = new Input()