import {AddDebugVisual} from "./GameObjectBase";

export const Player = (id, x, y, local) => {

    const self = {
        get id() { return id }
    }

    Object.assign(self, AddDebugVisual(x, y, 40, local ? 0xCC0000 : 0x0000CC))

    return self
}