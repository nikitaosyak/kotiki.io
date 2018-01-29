import * as nakamajs from "@heroiclabs/nakama-js/dist/nakama-js.cjs";
import {emitterBehaviour} from "./util/EmitterBehaviour";
import * as util from "./util/util"
import base64 from "@heroiclabs/nakama-js/dist/nakama-js.cjs"

export class Connection {
    constructor() {
        this._errorHandler = err => console.error('Connection: ', err)
        this._ready = false
        this._client = new nakamajs.Client()
        this.matchId = null
        this._client.verbose = true

        this._client.ondisconnect = e => {
            console.warn('client disconnected: ', e)
        }

        this._client.onmatchdata = data => {
            console.log('Connection: matchdata: ', data)
        }

        this._client.onmatchpresence = presenceUpdate => {
            console.log('Connection: matchpresence: ', presenceUpdate)
        }

        const sessionHandler = session => {
            console.log('sessionHandler:')
            this._client.connect(session).then(session => {
                // localStorage.nakamaToken = session.token_
                console.log('    valid until: ', new Date(session.expiresAt))
                console.log(`    userId: ${session.id}`)
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
        const invalidate = matches => {
            const m = new nakamajs.RpcRequest()
            m.id = 'invalidate_matches'
            m.payload = matches
            this._client.send(m).then(result => {
                console.log('matches invalidated')
            }).catch(this._errorHandler)
        }

        const createMatch = () => {
            let m = new nakamajs.MatchCreateRequest()
            this._client.send(m).then(createResult => {
                console.log('created match: ', createResult.match.matchId)
                m = new nakamajs.RpcRequest()
                m.id = 'create_match'
                m.payload = createResult.match.matchId
                this._client.send(m).then(requestResult => {
                    console.log('createMatch results: ', requestResult)
                    this.matchId = createResult.match.matchId
                    this.emit('joined')
                }).catch(this._errorHandler)
            }).catch(this._errorHandler)
        }

        const joinMatch = (list, current) => {
            const m = new nakamajs.MatchesJoinRequest()
            m.matchIds.push(list[current].Value.matchId)
            console.log('trying to join ', list[current].Value.matchId)
            this._client.send(m).then(matches => {
                console.log('joinRequest results: ', matches)
                this.matchId = list[current].Value.matchId
                this.emit('joined')
            }).catch(err => {
                if (err.code === 14) {
                    if (current < list.length-1) {
                        joinMatch(list, current+1)
                    } else {
                        list.length > 5 && invalidate(list)
                        createMatch()
                    }
                } else {
                    console.error(err)
                }
            })
        }

        let m = new nakamajs.RpcRequest()
        m.id = 'get_match'
        this._client.send(m).then(result => {
            console.log('getMatch results: ', result)
            if (Object.keys(result.payload).length === 0) {
                createMatch()
            } else {
                joinMatch(result.payload, 0)
            }
        }).catch(this._errorHandler)
    }

    send(code, data) {
        const m = new nakamajs.MatchDataSendRequest({presences: [{
                userId: 'someid',
                sessionId: this.matchId,
                handle: 'shit'
            }], opCode: code})
        m.matchId = this.matchId
        m.data = data

        // const encoded = window.base64.encode(JSON.stringify(data))
        // console.log(encoded)
        // console.log(window.base64.decode(encoded))

        this._client.send(m).then(() => {

        }).catch(err => console.error(err))
    }
}