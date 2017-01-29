import React from 'react'
import ReactMapboxGl, { GeoJSONLayer, ScaleControl, ZoomControl } from 'react-mapbox-gl'

type MapProps = {
    geoJson: Object
}

export default class Map extends React.Component {
    props: MapProps
    render() {
        if (!this.props.geoJson) {
            return (<div>
                no data
            </div>)
        }
        const conf = {
            accessToken: 'pk.eyJ1IjoiZmFicmljOCIsImEiOiJjaWc5aTV1ZzUwMDJwdzJrb2w0dXRmc2d0In0.p6GGlfyV-WksaDV_KdN27A',
            style: 'mapbox://styles/mapbox/streets-v8'
        }
        return (<ReactMapboxGl
            style={conf.style}
            accessToken={conf.accessToken}
            center={this.state.center}
            movingMethod="jumpTo"
            containerStyle={{ height: '100vh', width: '100%' }}
        >
            <ScaleControl />
            <ZoomControl />
            <GeoJSONLayer
                data={this.props.geoJson}
                symbolLayout={{
                    'text-field': '{place}',
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-offset': [0, 0.6],
                    'text-anchor': 'top'
                }}
            />
        </ReactMapboxGl>)
    }
}