import {emitterBehaviour} from "../util/EmitterBehaviour";
import {Auth} from "./_Auth";

export class Connection {
    constructor() {
        this._client = new nakamajs.Client()
        // this._client.verbose = true
        this._matchId = null
        this._presences = []

        this._client.ondisconnect = e => {
            console.warn('client disconnected: ', e)
        }

        this._client.onmatchdata = matchData => {
            console.log('Connection: matchdata: ', matchData)
            this.emit('data', matchData.presence.userId, matchData.data)
        }

        this._client.onmatchpresence = presenceUpdate => {
            console.log('Connection: matchpresence: ', presenceUpdate)

            if ('joins' in presenceUpdate) {
                presenceUpdate.joins.forEach(join => {
                    this._updatePresence([join], [])
                    if (join.userId !== this.userId) {
                        this.emit('initialDataRequested', join.userId)
                    }
                })
            }

            if ('leaves' in presenceUpdate) {
                this._updatePresence([], presenceUpdate.leaves)
            }
        }

        Object.assign(this, emitterBehaviour({}))

        this._auth = Auth(this)
    }

    get ready() { return this._auth.ready }
    get session() { return this._auth.session }
    get userId() { return this._auth.session.id }

    _updatePresence(joins, leaves) {
        joins.forEach(join => {
            if (this._presences.filter(current => current.userId === join.userId).length === 0) {
                this._presences.push(join)
            }
        })

        if (leaves && leaves.length > 0) {
            this._presences = this._presences.filter(current => {
                let stillOnline = true
                leaves.forEach(leave => {
                    if (current.userId === leave.userId) {
                        stillOnline = false
                        this.emit('data', leave.userId, {leaves: true})
                    }
                })

                return stillOnline
            })
        }
        console.log('presence list: ', this._presences)
    }

    joinMatch() {
        const invalidate = matches => {
            const m = new nakamajs.RpcRequest()
            m.id = 'invalidate_matches'
            m.payload = matches
            this._client.send(m).then(result => {
                console.log('matches invalidated')
            }).catch(e => console.error(e))
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
                    this._matchId = createResult.match.matchId
                    this.emit('joined')
                }).catch(e => console.error(e))
            }).catch(e => console.error(e))
        }

        const joinMatch = (list, current) => {
            const m = new nakamajs.MatchesJoinRequest()
            m.matchIds.push(list[current].Value.matchId)
            // console.log('trying to join ', list[current].Value.matchId)
            this._client.send(m).then(response => {
                console.log('joinRequest results: ', response)
                this._updatePresence(response.matches[0].presences, [])

                this._matchId = list[current].Value.matchId
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
        }).catch(e => console.error(e))
    }

    send(code, data, to = []) {
        const m = new nakamajs.MatchDataSendRequest()
        m.presences = to.map(el => this._presences.reduce((_, p) => p.userId === el ? p : _), null)
        m.opCode = code
        m.matchId = this._matchId
        m.data = data

        this._client.send(m).then(() => {

        }).catch(err => console.error(err))
    }
}