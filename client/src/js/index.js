import {Connection} from './Connection'
import {DOMUtils} from "./util/DOMUtils";
import {Renderer} from "./Renderer";
import {Input} from "./Input";
import {getRandomInt} from "./util/util";
import {Player} from "./go/Player";

window.onload = () => {

    const canvas = DOMUtils.createElement('canvas', 'gameCanvas')
    document.body.appendChild(canvas)
    PIXI.settings.MIPMAP_TEXTURES = false

    const startGame = () => {
        const input = new Input()
        const renderer = new Renderer(canvas)
        const players = {}
        let localPlayer = null

        const connection = new Connection()
        connection.on('connected', () => {
            connection.joinMatch()
        })
        connection.on('joined', () => {

            console.log('GAME STARTED')

            const addPlayer = (userId, x, y, local) => {
                const player = Player(userId, x, y, local)
                players[userId] = player
                renderer.addObject(player)

                if (local) {
                    localPlayer = player
                    connection.send(0, {start: {x: player.visual.x, y: player.visual.y}})
                }
            }

            const removePlayer = (userId) => {
                const player = players[userId]
                renderer.removeObject(player)
                delete players[userId]
            }

            addPlayer(connection.userId, getRandomInt(30, 300), getRandomInt(30, 300), true)

            const dataHandlers = {
                start: (userId, data) => {
                    addPlayer(userId, data.start.x, data.start.y, false)
                },
                leaves: (userId) => {
                    removePlayer(userId)
                },
                pos: (userId, data) => {
                    players[userId].visual.x = data.pos.x
                    players[userId].visual.y = data.pos.y
                }
            }

            connection.on('data', (userId, data) => {
                dataHandlers[Object.keys(data)[0]](userId, data)
            })

            connection.on('join', userId => {
                connection.send(0, {start: {x: localPlayer.visual.x, y: localPlayer.visual.y}}, [userId])
            })


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
            localPlayer.visual.x += v.x * 5
            localPlayer.visual.y += v.y * 5

            connection.send(1, {pos: {x: localPlayer.visual.x, y: localPlayer.visual.y}})
        })
    }

    startGame()
}
