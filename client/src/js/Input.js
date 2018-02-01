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

        let fs = false
        let fsDoubleClick = 0
        const onTouchEnd = e => {
            if (Date.now() - fsDoubleClick < 200) {
                if (fs) {
                    document.exitFullscreen()
                    fs = false
                } else {
                    window.document.documentElement.requestFullscreen()
                    fs = true
                }
            }
            fsDoubleClick = Date.now()
            e.preventDefault()
            disableNormal()
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
        window.ontouchend = onTouchEnd

        window.onmousemove = updateNormal
        window.onmouseup = onTouchEnd
        window.onmouseout = disableNormal

        Object.assign(this, emitterBehaviour({}))

        return {
            get normal() { return normalDirection }
        }
    }
}