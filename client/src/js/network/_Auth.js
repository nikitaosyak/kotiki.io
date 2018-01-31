import * as util from "../util/util";

/**
 * @param owner {Connection}
 * @constructor
 */
export const Auth = (owner) => {

    let ready = false
    let currentSession = null

    const sessionHandler = session => {
        console.log('sessionHandler:')
        owner._client.connect(session).then(session => {
            // localStorage.nakamaToken = session.token_
            console.log('    valid until: ', new Date(session.expiresAt))
            console.log(`    sessionId: ${session.id}`)
            //
            // point of readyness
            currentSession = session
            ready = true
            owner.emit('connected')
        }).catch(e => console.error(e))
    }

    const needLoginOrRegister = () => {
        console.log('restoreSession:')
        let sessionString = ''//localStorage.nakamaToken
        if (sessionString === 'undefined' || sessionString === '') {
            console.log('    restoreSession: no saved session key in local storage')
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
        owner._client.login(msg).then(sessionHandler).catch(e => {
            if (e.code === 5) {
                console.log(`    registering user`)
                owner._client.register(msg)
                    .then(sessionHandler)
                    .catch(e => console.error(e))
            } else {
                console.error(`    session error: ${e.code}:${e}`)
            }
        })
    }

    if (needLoginOrRegister()) {
        loginOrRegister()
    }

    return {
        get ready() { return ready },
        get session() { return currentSession }
    }
}