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

        Object.assign(this, emitterBehaviour({}))
    }
}