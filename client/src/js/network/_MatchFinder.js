/**
 * @param owner {Connection}
 * @return {{find: function()}}
 * @constructor
 */
export const MatchFinder = (owner) => {

    let matchId = 'EMPTY_MATCH'

    return {
        get matchId() { return matchId },
        find: () => {
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
                        this.emit('joinedMatch')
                    }).catch(e => console.error(e))
                }).catch(e => console.error(e))
            }

            const onJoinMatch = (response, saveMatch = false) => {
                console.log('joinRequest results: ', response, saveMatch)
                matchId = response.matches[0].matchId
                owner._presences.update(response.matches[0].presences, [])

                if (saveMatch) {
                    owner._client.send(new nakamajs.RpcRequest({
                        id: 'create_match',
                        payload: matchId})
                    )
                        .then(result => console.log('MatchSave: ', result.payload))
                        .catch(e => console.error(e))
                }

                owner.emit('joinedMatch')
            }

            const findMatch = () => {
                owner._client.send(new nakamajs.MatchmakeAddRequest(2))
                    .then(ticket => {
                        console.log('matchMakeRequest added: ', ticket)
                        owner._client.onmatchmakematched = matchedResult => {
                            console.log('    found match, ', matchedResult.ticket)
                            owner._client.onmatchmakematched = null
                            owner._client.send(new nakamajs.MatchesJoinRequest({tokens: [matchedResult.token]}))
                                .then(res => onJoinMatch(res, true))
                        }
                    })
                    .catch(e => console.error(e))
            }

            const joinMatch = (list, current) => {
                const m = new nakamajs.MatchesJoinRequest()
                m.matchIds.push(list[current].Value.matchId)
                console.log('trying to join ', list[current].Value.matchId)
                owner._client.send(m).then(onJoinMatch)
                    .catch(err => {
                        if (err.code === 14) {
                            if (current < list.length-1) {
                                joinMatch(list, current+1)
                            } else {
                                owner._client.send(
                                    new nakamajs.RpcRequest({
                                        id: 'invalidate_matches',
                                        payload: list
                                    })
                                ).then(_ => {
                                    console.log(`    ${list.length} matches invalidated`)
                                }).catch(e => console.error(e))
                                console.log('    matches not found, enqueueing')
                                findMatch()
                            }
                        } else {
                            console.error(err)
                        }
                    })
            }

            owner._client.send(new nakamajs.RpcRequest({id: 'get_match'}))
                .then(result => {
                    console.log('getMatch results: ', result)
                    if (Object.keys(result.payload).length === 0) {
                        console.log('    matches not found, enqueueing')
                        findMatch()
                    } else {
                        joinMatch(result.payload, 0)
                    }
                }).catch(e => console.error(e))
        }
    }
}