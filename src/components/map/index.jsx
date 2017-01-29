import React from 'react'
import ReactMapboxGl, {GeoJSONLayer, ScaleControl, ZoomControl} from 'react-mapbox-gl'

import ConstructionData from './../../data/traffikverket'

function utmToLatLng(zone, easting, northing, northernHemisphere){
    if (!northernHemisphere){
        northing = 10000000 - northing;
    }

    var a = 6378137;
    var e = 0.081819191;
    var e1sq = 0.006739497;
    var k0 = 0.9996;

    var arc = northing / k0;
    var mu = arc / (a * (1 - Math.pow(e, 2) / 4.0 - 3 * Math.pow(e, 4) / 64.0 - 5 * Math.pow(e, 6) / 256.0));

    var ei = (1 - Math.pow((1 - e * e), (1 / 2.0))) / (1 + Math.pow((1 - e * e), (1 / 2.0)));

    var ca = 3 * ei / 2 - 27 * Math.pow(ei, 3) / 32.0;

    var cb = 21 * Math.pow(ei, 2) / 16 - 55 * Math.pow(ei, 4) / 32;
    var cc = 151 * Math.pow(ei, 3) / 96;
    var cd = 1097 * Math.pow(ei, 4) / 512;
    var phi1 = mu + ca * Math.sin(2 * mu) + cb * Math.sin(4 * mu) + cc * Math.sin(6 * mu) + cd * Math.sin(8 * mu);

    var n0 = a / Math.pow((1 - Math.pow((e * Math.sin(phi1)), 2)), (1 / 2.0));

    var r0 = a * (1 - e * e) / Math.pow((1 - Math.pow((e * Math.sin(phi1)), 2)), (3 / 2.0));
    var fact1 = n0 * Math.tan(phi1) / r0;

    var _a1 = 500000 - easting;
    var dd0 = _a1 / (n0 * k0);
    var fact2 = dd0 * dd0 / 2;

    var t0 = Math.pow(Math.tan(phi1), 2);
    var Q0 = e1sq * Math.pow(Math.cos(phi1), 2);
    var fact3 = (5 + 3 * t0 + 10 * Q0 - 4 * Q0 * Q0 - 9 * e1sq) * Math.pow(dd0, 4) / 24;

    var fact4 = (61 + 90 * t0 + 298 * Q0 + 45 * t0 * t0 - 252 * e1sq - 3 * Q0 * Q0) * Math.pow(dd0, 6) / 720;

    var lof1 = _a1 / (n0 * k0);
    var lof2 = (1 + 2 * t0 + Q0) * Math.pow(dd0, 3) / 6.0;
    var lof3 = (5 - 2 * Q0 + 28 * t0 - 3 * Math.pow(Q0, 2) + 8 * e1sq + 24 * Math.pow(t0, 2)) * Math.pow(dd0, 5) / 120;
    var _a2 = (lof1 - lof2 + lof3) / Math.cos(phi1);
    var _a3 = _a2 * 180 / Math.PI;

    var latitude = 180 * (phi1 - fact1 * (fact2 + fact3 + fact4)) / Math.PI;

    if (!northernHemisphere){
        latitude = -latitude;
    }

    var longitude = ((zone > 0) && (6 * zone - 183.0) || 3.0) - _a3;

    var obj = {
        latitude,
        longitude
    };


    return obj;
}

class Map extends React.Component {
    state = {}

    componentWillMount() {
        /*
         const bak = new Backend('http://www.trafikverket.se/Trafikverket/GenericMapApplication/')
         bak.get('MapService.ashx', {
         contentType: 'getmapdata',
         areaName: '',
         searchFilter: '',
         layerId: '5d9b0799-288c-4c06-a1d9-7b443e9e5072',
         avoidCacheHit: '1485692303675'
         }).then(json => this.setState({
         json
         }))
         */

        let data = ConstructionData;
        data.features = data.features.map(feature => {
            const latlng = utmToLatLng(33, feature.geometry.coordinates[0], feature.geometry.coordinates[1], true)
            feature.geometry.coordinates[0] = latlng.longitude
            feature.geometry.coordinates[1] = latlng.latitude
            return feature
        })


        this.setState({json: data})
    }

    props: MapProps

    render() {
        if (!this.state.json) {
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
            center={[12, 57.7]}
            zoom={[9, 12]}
            movingMethod="jumpTo"
            containerStyle={{ height: '100vh', width: '100%' }}
        >
            <ScaleControl />
            <ZoomControl />
            <GeoJSONLayer
                data={this.state.json}
                symbolLayout={{
                    'text-field': '{Name}',
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-offset': [0, 0.6],
                    'text-anchor': 'top'
                }}
            />
        </ReactMapboxGl>)
    }
}

export default Map