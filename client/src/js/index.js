import {Connection} from './Connection'

const connection = new Connection()
connection.on('connected', () => {
    connection.joinMatch()
})
