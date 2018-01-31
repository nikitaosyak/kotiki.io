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
            const saveMatchOnBackend = (matchId, onDone) => {
                owner._client.send(new nakamajs.RpcRequest({
                    id: 'create_match',
                    payload: matchId
                }))
                    .then(result => {
                        console.log('MatchSave: ', result.payload)
                    })
                    .catch(e => console.error(e))
            }

            const createMatch = () => {
                let m = new nakamajs.MatchCreateRequest()
                owner._client.send(m).then(createResult => {
                    console.log('created match: ', createResult.match.matchId)
                    matchId = createResult.match.matchId
                    saveMatchOnBackend(matchId)
                    owner.emit('joinedMatch')
                }).catch(e => console.error(e))
            }

            const onJoinMatch = (response, saveMatch = false) => {
                console.log('joinRequest results: ', response, saveMatch)
                matchId = response.matches[0].matchId
                owner._presences.update(response.matches[0].presences, [])

                if (saveMatch) {
                    saveMatchOnBackend(matchId, () => owner.emit('joinedMatch'))
                }
                owner.emit('joinedMatch')

            }

            const findMatch = () => {
                owner._client.send(new nakamajs.MatchmakeAddRequest(3))
                    .then(mmResult => {
                        console.log('matchMakeRequest added: ', mmResult.ticket)

                        const timeout = setTimeout(() => {
                            console.log('    match timed out. will try to re-search')
                            owner._client.onmatchmakematched = null
                            owner._client.send(

                                new nakamajs.MatchmakeRemoveRequest(mmResult.ticket)
                            ).then(() => {
                                tryJoinExistingMatches(createMatch)
                            }).catch(e => console.error(e))
                        }, 200)

                        owner._client.onmatchmakematched = matchedResult => {
                            clearTimeout(timeout)
                            console.log('    found match, ', matchedResult.ticket)
                            owner._client.onmatchmakematched = null
                            owner._client.send(new nakamajs.MatchesJoinRequest({tokens: [matchedResult.token]}))
                                .then(res => onJoinMatch(res, true))
                        }
                    })
                    .catch(e => console.error(e))
            }

            const joinMatch = (list, current, onFail) => {
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
                                console.log('    FAIL.. matches not found')
                                onFail()
                            }
                        } else {
                            console.error(err)
                        }
                    })
            }

            const tryJoinExistingMatches = (onFail) => {
                owner._client.send(new nakamajs.RpcRequest({id: 'get_match'}))
                    .then(result => {
                        console.log('getMatch results: ', result)
                        if (Object.keys(result.payload).length === 0) {
                            console.log('    FAIL.. matches not found')
                            onFail()
                        } else {
                            joinMatch(result.payload, 0, onFail)
                        }
                    }).catch(e => console.error(e))
            }

            tryJoinExistingMatches(findMatch)
        }
    }
}