
export const AddDebugVisual = (x, y, radius = 40, tint = 0xCC0000) => {
    const graphics = new PIXI.Graphics()
    graphics.x = x; graphics.y = y
    graphics.beginFill(tint)
    graphics.drawCircle(0, 0, radius)
    graphics.endFill()

    return {
        get visual() { return graphics }
    }
}