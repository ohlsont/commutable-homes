import 'whatwg-fetch'
import 'babel-polyfill'

export default class TwitterManager {
    static async getStatuses(): Promise<Object> {
        const url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=%40realdonaldtrump'
        try {
            const response = await fetch(url, {
                method: 'get',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                cache: 'default',
                body: {},
            })
            console.log('debug ', response)
            return response
        } catch (error) {
            console.error('error ', error)
            throw error
        }
    }
}