import * as nakamajs from "@heroiclabs/nakama-js/dist/nakama-js.cjs";
import {emitterBehaviour} from "./util/EmitterBehaviour";

export class Connection {
    constructor() {
        this._errorHandler = err => console.error('Connection: ', err)
        this._client = new nakamajs.Client()

        const sessionHandler = session => {
            console.log('sessionHandler:')
            this._session = session
            this._client.connect(session).then(session => {
                localStorage.nakamaToken = session.token_
                console.log('    valid until: ', new Date(session.expiresAt))
                this.emit('connected')
            }).catch(this._errorHandler)
        }

        const restoreSession = () => {
            console.log('restoreSession:')
            let sessionString = localStorage.nakamaToken
            if (sessionString === 'undefined' || sessionString === '') {
                console.log('restoreSession: no saved session key in local storage')
                return
            }

            const session = nakamajs.Session.restore(sessionString)
            if (session.isexpired(Date.now())) {
                console.log('    session expired')
                return
            }

            console.log('    success')
            sessionHandler(session)
        }

        const loginOrRegister = () => {
            console.log('loginOrRegister:')
            const msg = nakamajs.AuthenticateRequest.email('test@test.com', '12345678')
            this._client.login(msg).then(sessionHandler).catch(err => {
                if (err.code === 5) {
                    console.log(`    registering user`)
                    this._client.register(msg).then(sessionHandler).catch(errorHandler)
                } else {
                    console.log(`    session error: ${err.code}`)
                    this._errorHandler(err)
                }
            })
        }

        restoreSession()
        if (this._session == null) {
            loginOrRegister()
        }

        Object.assign(this, emitterBehaviour({}))
    }

    get session() { return this._session }
}