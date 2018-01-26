
export class Renderer {
    constructor(canvas) {
        this._canvasW = 0
        this._canvasH = 0

        this._stage = new PIXI.Container()
        this._graphics = new PIXI.Graphics()
        this._stage.addChild(this._graphics)
        this._graphicsList = []

        this._renderer = PIXI.autoDetectRenderer({
            roundPixels: false,
            view: canvas,
            backgroundColor: 0x000000,
            antialias: false,
            resolution: 1,
            autoResize: true
        })

        this._resizeCanvas = () => {
            console.log('will resize')
            this._canvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
            this._canvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)

            this._renderer.resize(this._canvasW, this._canvasH)
        }
        this._resizeCanvas()
    }

    update() {
        const newCanvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
        const newCanvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)
        if (newCanvasW !== this._canvasW || newCanvasH !== this._canvasH) {
            this._resizeCanvas()
        }

        this._renderer.render(this._stage)
    }

    _redrawGraphics() {
        this._graphics.clear()

        this._graphicsList.forEach(item => {
            this._graphics.beginFill(0xCC0000)
            this._graphics.drawCircle(item.x, item.y, 50)
            this._graphics.endFill()
        })
    }

    addObject(x, y) {
        this._graphicsList.push({x: x, y: y})
        this._redrawGraphics()

        return this._graphicsList.length-1
    }

    moveObject(idx, x, y) {
        this._graphicsList[idx].x += x
        this._graphicsList[idx].y += y
        this._redrawGraphics()
    }
}