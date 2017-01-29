import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Map from './components/map/index'

class App extends Component { // eslint-disable-line
    render() {
        return (
            <MuiThemeProvider>
                <div>
                    <h1>Hello, world ddd dd</h1>
                    <Map />
                </div>
            </MuiThemeProvider>
        )
    }
}

export default App