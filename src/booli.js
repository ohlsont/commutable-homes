// @flow

import 'whatwg-fetch'
import SHA1 from 'sha1-es'

import Backend from './backend'
import BooliCredentials from './credentials/booli_credentials'

class Booli {

    static backend = new Backend('https://api.booli.se/')

    static listings(): Promise<Object> {
        const swedenBoundingBox = '53.220395,7.589477,69.897033,29.737915'
        return this.makeAuthenticatedRequest('listings', {
            bbox: swedenBoundingBox
        })
    }

    static makeAuthenticatedRequest(url: string, queryParams: Object) {
        return Booli.backend.get(url, Object.assign({}, queryParams, Booli.authParams()))
    }

    static authParams() {
        const callerId = BooliCredentials.callerId
        const time = Math.floor(Date.now() / 1000)
        const key = BooliCredentials.privateKey
        const unique = SHA1.hash(Math.random()).substring(16)

        return {
            callerId,
            time,
            key,
            unique,
            hash: Booli.sha1(callerId + time + key + unique)
        }
    }

    static sha1() {
        return ''
    }
}

export default Booli

