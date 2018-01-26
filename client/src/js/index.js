import {Connection} from './Connection'
import {DOMUtils} from "./util/DOMUtils";
import {Renderer} from "./Renderer";
import {Input} from "./Input";
import {getRandomInt} from "./util/util";

window.onload = () => {

    const canvas = DOMUtils.createElement('canvas', 'gameCanvas')
    document.body.appendChild(canvas)
    PIXI.settings.MIPMAP_TEXTURES = false

    const startGame = () => {
        const input = new Input()
        const renderer = new Renderer(canvas)

        const connection = new Connection()
        connection.on('connected', () => {
            connection.joinMatch()
        })
        connection.on('joined', () => {
            console.log('GAME STARTED')

            const initialPos = {x: getRandomInt(100, 300), y: getRandomInt(100, 300)}
            renderer.addObject(initialPos.x, initialPos.y)
            connection.send({join: initialPos})

            let time = Date.now()
            const gameLoop = () => {
                let dt = Date.now() - time
                time = Date.now()

                requestAnimationFrame(gameLoop)
                renderer.update()
            }
            gameLoop()
        })

        input.on('velocity', v => {
            renderer.moveObject(0, v.x, v.y)
        })
    }

    startGame()
}
