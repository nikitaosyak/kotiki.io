import {emitterBehaviour} from "./util/EmitterBehaviour";

export class Input {
    constructor() {

        const keyReactions = {
            97: () => {this.emit('velocity', {x: -1, y: 0})},
            100: () => {this.emit('velocity', {x: 1, y: 0})},
            119: () => {this.emit('velocity', {x: 0, y: -1})},
            115: () => {this.emit('velocity', {x: 0, y: 1})},
        }

        window.onkeypress = (e) => {
            e.preventDefault()
            keyReactions[e.keyCode]()
        }

        let normalDirection = {x: 0, y: 0}

        window.onmousemove = (e) => {
            const centerX = document.documentElement.clientWidth / 2
            const centerY = document.documentElement.clientHeight / 2

            const vx = e.clientX - centerX
            const vy = e.clientY - centerY

            const magnitude = Math.sqrt(vx*vx + vy*vy)

            if (magnitude > 100) {
                normalDirection.x = vx / magnitude
                normalDirection.y = vy / magnitude
            } else {
                normalDirection.x = normalDirection.y = 0
            }
        }

        window.onmouseout = (e) => {
            normalDirection.x = normalDirection.y = 0
        }

        Object.assign(this, emitterBehaviour({}))

        return {
            get normal() { return normalDirection }
        }
    }
}