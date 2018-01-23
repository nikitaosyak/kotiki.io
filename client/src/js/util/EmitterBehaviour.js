export const emitterBehaviour = (dictionary) => {
    return {
        on: (event, callback) => {
            if (event in dictionary) {
                dictionary[event].push(callback)
            } else {
                dictionary[event] = [callback]
            }
        },
        clear: (event) => {
            if (event in dictionary) delete dictionary[event]
        },
        emit: (event, ...args) => {
            if (event in dictionary) {
                dictionary[event].forEach(callback => callback.apply(null, args))
            }
        }
    }
}