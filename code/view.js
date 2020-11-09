import * as PIXI from 'pixi.js'

import * as settings from './settings'
import packageJson from '../package.json'

const size = 50

class View {
    init() {
        this.renderer = new PIXI.Renderer({
            view: document.querySelector('.view'),
            resolution: window.devicePixelRatio,
            transparent: true,
            antialias: true,
        })
        this.stage = new PIXI.Container()
        this.resize()
        window.addEventListener('contextmenu', e => e.preventDefault())
        if (!settings.release) {
            const div = document.createElement('div')
            div.innerHTML = `v${packageJson.version}`
            div.className = 'version'
            document.body.appendChild(div)
        }
    }

    get width() {
        return Math.floor(window.innerWidth / this.stage.scale.x)
    }

    get height() {
        return Math.floor(window.innerHeight / this.stage.scale.x)
    }

    get size() {
        return size
    }

    resize() {
        this.stage.scale.set((window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight) / size)
        this.renderer.resize(window.innerWidth, window.innerHeight)
        this.max = Math.max(window.innerWidth, window.innerHeight) / this.stage.scale.x
    }

    update() {
        this.renderer.render(this.stage)
    }
}

export const view = new View()