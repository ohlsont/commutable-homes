import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

export default class App extends Component {
    render() {
        return (
            <MuiThemeProvider>
                <h1>Hello, world ddd</h1>
            </MuiThemeProvider>
        )
    }
}
