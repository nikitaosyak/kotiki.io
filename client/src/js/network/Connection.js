import {emitterBehaviour} from "../util/EmitterBehaviour";
import {Auth} from "./_Auth";
import {MatchFinder} from "./_MatchFinder";
import {PresenceHandler} from "./_PresenceUpdater";

export class Connection {
    constructor() {
        this._client = new nakamajs.Client()
        // this._client.verbose = true

        this._client.ondisconnect = e => {
            console.error('client disconnected: ', e)
        }

        this._client.onmatchdata = matchData => {
            console.log('Connection: matchdata: ', matchData)
            this.emit('data', matchData.presence.userId, matchData.data)
        }

        Object.assign(this, emitterBehaviour({}))

        this._auth = Auth(this)
        this._matchFinder = MatchFinder(this)
        this._presences = PresenceHandler(this)
    }

    get ready() { return this._auth.ready }
    get session() { return this._auth.session }
    get userId() { return this._auth.session.id }

    joinMatch() { this._matchFinder.find() }

    send(code, data, to = []) {
        const m = new nakamajs.MatchDataSendRequest()
        m.presences = this._presences.mapByIdList(to)
        m.opCode = code
        m.matchId = this._matchFinder.matchId
        m.data = data

        this._client.send(m).then(() => {}).catch(err => console.error(err))
    }
}