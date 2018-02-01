import {emitterBehaviour} from "./util/EmitterBehaviour";

export class Input {
    constructor() {
        let normalDirection = {x: 0, y: 0}

        const getX = (e) => {
            if ('touches' in e) return e.touches.item(0).clientX
            return e.clientX
        }
        const getY = (e) => {
            if ('touches' in e) return e.touches.item(0).clientY
            return e.clientY
        }

        const updateNormal = e => {
            const centerX = document.documentElement.clientWidth / 2
            const centerY = document.documentElement.clientHeight / 2

            const vx = getX(e) - centerX; const vy = getY(e) - centerY

            const magnitude = Math.sqrt(vx*vx + vy*vy)

            if (magnitude > 0) {
                normalDirection.x = vx / magnitude
                normalDirection.y = vy / magnitude
            } else {
                normalDirection.x = normalDirection.y = 0
            }
        }

        const disableNormal = () => {
            normalDirection.x = normalDirection.y = 0
        }

        window.ontouchstart = e => {
            e.preventDefault()
            updateNormal(e)
        }
        window.ontouchmove = e => {
            e.preventDefault()
            updateNormal(e)
        }
        window.ontouchend = e => {
            e.preventDefault()
            disableNormal()
        }

        window.onmousemove = updateNormal
        window.onmouseout = disableNormal

        Object.assign(this, emitterBehaviour({}))

        return {
            get normal() { return normalDirection }
        }
    }
}