
export const PresenceHandler = (owner) => {

    let presences = []

    owner._client.onmatchpresence = presenceUpdate => {
        console.log('OnMatchPresence: ', presenceUpdate)

        if ('joins' in presenceUpdate) {
            presenceUpdate.joins.forEach(join => {
                self.update([join], [])
                if (join.userId !== owner.userId) {
                    owner.emit('initialDataRequested', join.userId)
                }
            })
        }

        if ('leaves' in presenceUpdate) {
            self.update([], presenceUpdate.leaves)
        }
    }

    const self = {
        get presences() { return presences },
        update: (joins, leaves) => {
            joins.forEach(join => {
                if (presences.filter(current => current.userId === join.userId).length === 0) {
                    presences.push(join)
                }
            })

            if (leaves && leaves.length > 0) {
                presences = presences.filter(current => {
                    let stillOnline = true
                    leaves.forEach(leave => {
                        if (current.userId === leave.userId) {
                            stillOnline = false
                            owner.emit('userLeaves', leave.userId)
                        }
                    })

                    return stillOnline
                })
            }
            console.log('presence list: ', presences)
        },

        /** @param list {Array} */
        mapByIdList: list => {
            return list.map(
                el =>
                    presences.reduce((_, p) => p.userId === el ? p : _)
                )

        }
    }

    return self
}