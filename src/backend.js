// @flow

import 'whatwg-fetch'
import Log from 'loglevel'

class Backend {

    static baseUrl: string
    localBaseUrl: string

    constructor(localBaseUrl: string) {
        this.localBaseUrl = localBaseUrl || Backend.baseUrl
    }

    get(url: string, queryParams?: Object = {}): Promise<Object> {
        return this.doRequest(url, queryParams)
    }

    post(url: string, queryParams: Object = {}, data: Object | Array<any>,
                excludeAccessToken: boolean = false): Promise<Object> {
        const body = JSON.stringify(data)
        return this.doRequest(url, queryParams, {
            method: 'post',
            body,
            headers: {
                'Content-Type': 'application/json',
            },
            excludeAccessToken,
        })
    }

    delete(url: string, queryParams: Object = {}, excludeAccessToken: boolean = false) {
        return this.doRequest(url, queryParams, {
            method: 'delete',
            excludeAccessToken,
        })
    }

    put(url: string, queryParams?: Object = {}, data?: any = {}): Promise<Object> {
        const body = JSON.stringify(data)

        return this.doRequest(url, queryParams, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        })
    }

    doRequest(uri: string, params: Object = {}, options: Object = {}): Promise<Object> {
        let url = `${this.localBaseUrl}${uri}`
        const stringifiedQueryParams = Backend.makeQueryString(params)
        url += stringifiedQueryParams

        return fetch(url, options)
            .then(resp => {
                if (resp.ok) {
                    if (resp.status === 204) {
                        return {}
                    }
                    return resp.json() || {}
                }
                Log.error('do request error: ', resp)
                throw resp || {}
            })
    }

    static makeQueryString(params: Object = {}) {
        const stringifiedParams: Array<string> = Object.keys(params).filter(key => params[key]).map(k => `${k}=${params[k]}`)
        return stringifiedParams.length ? `?${stringifiedParams.join('&')}` : ''
    }

}

export default Backend
