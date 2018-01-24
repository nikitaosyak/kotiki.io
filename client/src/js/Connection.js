import * as nakamajs from "@heroiclabs/nakama-js/dist/nakama-js.cjs";
import {emitterBehaviour} from "./util/EmitterBehaviour";
import * as util from "./util/util"

export class Connection {
    constructor() {
        this._errorHandler = err => console.error('Connection: ', err)
        this._ready = false
        this._client = new nakamajs.Client()
        // this._client.verbose = true

        this._client.ondisconnect = e => {
            console.warn('client disconnected: ', e)
        }

        this._client.onmatchdata = data => {
            console.log('Connection: matchdata: ', data)
        }

        this._client.onmatchpresence = presenceUpdate => {
            // console.log('Connection: matchpresence: ', presenceUpdate)
        }

        const sessionHandler = session => {
            console.log('sessionHandler:')
            this._client.connect(session).then(session => {
                // localStorage.nakamaToken = session.token_
                console.log('    valid until: ', new Date(session.expiresAt))

                //
                // point of readyness
                this._session = session
                this._ready = true
                this.emit('connected')
            }).catch(this._errorHandler)
        }

        const needLoginOrRegister = () => {
            console.log('restoreSession:')
            let sessionString = ''//localStorage.nakamaToken
            if (sessionString === 'undefined' || sessionString === '') {
                console.log('restoreSession: no saved session key in local storage')
                return true
            }

            const session = nakamajs.Session.restore(sessionString)
            if (session.isexpired(Date.now())) {
                console.log('    session expired')
                return true
            }

            console.log('    success')
            sessionHandler(session)
            return false
        }

        const loginOrRegister = () => {
            console.log('loginOrRegister:')
            const msg = nakamajs.AuthenticateRequest.email(`${util.makeid()}@test.com`, '12345678')
            this._client.login(msg).then(sessionHandler).catch(err => {
                if (err.code === 5) {
                    console.log(`    registering user`)
                    this._client.register(msg).then(sessionHandler).catch(this._errorHandler)
                } else {
                    console.log(`    session error: ${err.code}`)
                    this._errorHandler(err)
                }
            })
        }

        if (needLoginOrRegister()) {
            loginOrRegister()
        }

        Object.assign(this, emitterBehaviour({}))
    }

    get ready() { return this._ready }
    get session() { return this._session }

    joinMatch() {
        let ticket = null
        let m = new nakamajs.MatchmakeAddRequest(20)
        this._client.send(m).then(ticket => {
            console.log('added to mm', ticket)
            ticket = ticket.ticket
        }).catch(this._errorHandler)

        this._client.onmatchmakematched = matched => {
            console.log('matchmake matched: ', matched)

            m = new nakamajs.MatchesJoinRequest()
            m.tokens.push(matched.token)
            this._client.send(m).then(matches => {
                console.log('joined a match successfully', matches)
            }).catch(this._errorHandler)
        }
    }
}