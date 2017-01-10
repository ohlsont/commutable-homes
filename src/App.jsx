import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TwitterManager from './twitter'

export default class App extends Component {
    async getTwitterStatus() {
        const resp = await TwitterManager.getStatuses()
        console.log('debug ', resp)
    }

    render() {
        this.getTwitterStatus()
        return (
            <MuiThemeProvider>
                <h1>Hello, world ddd</h1>
            </MuiThemeProvider>
        )
    }
}
