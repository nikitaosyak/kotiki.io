export const Resources = () => {

    const loader = PIXI.loader
    const res = loader.resources

    const self = {
        get raw() { return res },
        add: (alias, path) => {
            loader.add(alias, path)
            return self
        },
        load: (onComplete) => {
            loader.load(onComplete)
            return self
        },
        getTexture: (alias) => {
            if (alias in res) return res[alias].texture
            // console.warn('texture', alias, 'was replaced with default texture')
            return res.pixel.texture
        },
        getJSON: (alias) => {
            if (alias in res) return res[alias].data
            throw '   Cannot find JSON with alias ' + alias
        },
        getText: (alias) => {
            if (alias in res) return res[alias].data
            throw '   Cannot find TEXT with alias ' + alias
        }
    }
    return self
}