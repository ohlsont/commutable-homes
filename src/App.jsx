import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Map from './components/map/index.jsx'

export default class App extends Component {
    render() {
        return (
            <MuiThemeProvider>
                <div>
                    <h1>Hello, world ddd dd</h1>
                    <Map geoJson={{}} />
                </div>
            </MuiThemeProvider>
        )
    }
}
