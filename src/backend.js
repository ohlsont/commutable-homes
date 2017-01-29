// @flow

import 'whatwg-fetch'
import Log from 'loglevel'

class Backend {

    static token: string
    static url: string

    static get(url: string, queryParams?: Object = {}): Promise<Object> {
        return Backend.doRequest(url, queryParams)
    }

    static post(url: string, queryParams: Object = {}, data: Object | Array<any>,
                excludeAccessToken: boolean = false): Promise<Object> {
        const body = JSON.stringify(data)
        return Backend.doRequest(url, queryParams, {
            method: 'post',
            body,
            headers: {
                'Content-Type': 'application/json',
            },
            excludeAccessToken,
        })
    }

    static delete(url: string, queryParams: Object = {}, excludeAccessToken: boolean = false) {
        return Backend.doRequest(url, queryParams, {
            method: 'delete',
            excludeAccessToken,
        })
    }

    static put(url: string, queryParams?: Object = {}, data?: any = {}): Promise<Object> {
        const body = JSON.stringify(data)

        return Backend.doRequest(url, queryParams, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        })
    }

    static doRequest(uri: string, params: Object = {}, options: Object = {}): Promise<Object> {
        let url = `${Backend.url}${uri}`
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
