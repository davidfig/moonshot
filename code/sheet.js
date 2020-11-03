import RenderSheet from 'yy-rendersheet'
import letters from '../images/letters.json'

class Sheet extends RenderSheet {
    constructor() {
        super({ extrude: true, scaleMode: true })
        this.letters()
    }

    async init() {
        await this.asyncRender()
    }

    letters() {
        for (let i = 0; i < letters.imageData.length; i++) {
            this.addData(`letters-${i}`, letters.imageData[i][2])
        }
    }
}

export const sheet = new Sheet()