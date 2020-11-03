import { game } from './game'

window.addEventListener('DOMContentLoaded', () => {
    game.start()
    window.addEventListener('blur', () => game.pause())
    window.addEventListener('focus', () => game.resume())
})