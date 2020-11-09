import pixiSound from 'pixi-sound'

import { file } from './file'

const SOUNDS = ['laser', 'buzzer', 'warp', 'whoosh', 'beep', 'separate', 'approach']
const SPRITES = {}

class Sounds {
    load() {
        this.list = []
        this.count = 0
        for (const name of SOUNDS) {
            this.sound(name)
        }
        for (const name in SPRITES) {
            this.sprite(name, SPRITES[name])
        }
    }

    loaded() {
        this.count--
        if (this.count === 0) {
            this.ready = true
        }
    }

    sound(name) {
        this.list[name] = pixiSound.Sound.from({
            url: 'sounds/' + name + '.mp3',
            preload: true,
            loaded: () => this.loaded(),
        })
        this.count++
    }

    sprite(name, sprites) {
        this.list[name] = pixiSound.Sound.from({
            url: 'sounds/' + name + '.mp3',
            preload: true,
            loaded: () => this.loaded(),
            sprites
        })
        this.count++
    }

    play(name, options) {
        options = options || {}
        if (this.ready && file.sound) {
            if (options.sprite) {
                return this.list[name].play(options.sprite, options)
            } else {
                return this.list[name].play(options)
            }
        }
    }

    stop(name) {
        this.list[name].stop()
    }

    fade(name, duration, id) {
        if (file.sound) {
            this.list[name].fade(1, 0, duration, id)
        }
    }

    pause() {
        pixiSound.pauseAll()
    }

    resume() {
        pixiSound.resumeAll()
    }
}

export const sounds = new Sounds()