// @flow

import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Map from '../map'

class App extends Component { // eslint-disable-line
    render() {
        return (
            <MuiThemeProvider>
                <div>
                    <Map geoJson={{}} />
                </div>
            </MuiThemeProvider>
        )
    }
}

export default App