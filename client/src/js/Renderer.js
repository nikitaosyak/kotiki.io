
export class Renderer {
    constructor(canvas) {
        this._canvasW = 0
        this._canvasH = 0

        this._stagePivot = null
        this._stage = new PIXI.Container()
        this._graphics = new PIXI.Graphics()
        this._stage.addChild(this._graphics)

        const bg = new PIXI.extras.TilingSprite(window.resources.getTexture('bgtile'), 2000, 2000)
        this._stage.addChild(bg)


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

    pivotOn(object) {
        this._stagePivot = object.visual
    }

    update() {
        const newCanvasW = Math.max(window.innerWidth || 0, document.documentElement.clientWidth)
        const newCanvasH = Math.max(window.innerHeight || 0, document.documentElement.clientHeight)
        if (newCanvasW !== this._canvasW || newCanvasH !== this._canvasH) {
            this._resizeCanvas()
        }

        if (this._stagePivot !== null) {
            this._stage.x = this._renderer.width/2
            this._stage.y = this._renderer.height/2

            this._stage.pivot.x = this._stagePivot.x// / this._stage.width
            this._stage.pivot.y = this._stagePivot.y// / this._stage.height
        }
        this._renderer.render(this._stage)
    }

    addObject(value) {
        this._stage.addChild(value.visual)
    }

    removeObject(value) {
        this._stage.removeChild(value.visual)
    }

}