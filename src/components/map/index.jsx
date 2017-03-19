// @flow
import React from 'react'
import ReactMapboxGl, { GeoJSONLayer, ScaleControl, ZoomControl, Popup } from 'react-mapbox-gl'
import geojsonExtent from 'geojson-extent'

import ConstructionData from './../../data/traffikverket'
import { stops } from './../../data/stops'

type BooliData = {
    count: number,
    sold: {
        booliId: number,
        constructionYear: number,
        listPrice: number,
        livingArea: number,
        location: {
            address: {
                streetAddress: string,
            },
            namedAreas: string[],
            position: {
                latitude: number,
                longitude: number,
            },
            region: {
                countyName: string,
                municipalityName: string,
            },
        },
        objectType: string,
        plotArea: number,
        published: string,
        rooms: number,
        soldDate: string,
        soldPrice: number,
        source: {
            id: number,
            name: string,
            type: string,
            url: string,
        },
        url: string,
    }[],
    totalCount: number,
}

/* eslint-disable */
function utmToLatLng(zone, easting, northingParam, northernHemisphere){
    let northing = northingParam
    if (!northernHemisphere) {
        northing = 10000000 - northing
    }

    const a = 6378137
    const e = 0.081819191
    const e1sq = 0.006739497
    const k0 = 0.9996

    const arc = northing / k0
    const mu = arc / (a * (1 - Math.pow(e, 2) / 4.0 - 3 *
        Math.pow(e, 4) / 64.0 - 5 * Math.pow(e, 6) / 256.0))

    const ei = (1 - Math.pow((1 - e * e), (1 / 2.0))) / (1 + Math.pow((1 - e * e), (1 / 2.0)))

    const ca = 3 * ei / 2 - 27 * Math.pow(ei, 3) / 32.0

    const cb = 21 * Math.pow(ei, 2) / 16 - 55 * Math.pow(ei, 4) / 32
    const cc = 151 * Math.pow(ei, 3) / 96
    const cd = 1097 * Math.pow(ei, 4) / 512
    const phi1 = mu + ca * Math.sin(2 * mu) + cb *
        Math.sin(4 * mu) + cc * Math.sin(6 * mu) + cd * Math.sin(8 * mu)

    const n0 = a / Math.pow((1 - Math.pow((e * Math.sin(phi1)), 2)), (1 / 2.0))

    const r0 = a * (1 - e * e) / Math.pow((1 - Math.pow((e * Math.sin(phi1)), 2)), (3 / 2.0))
    const fact1 = n0 * Math.tan(phi1) / r0

    const _a1 = 500000 - easting
    const dd0 = _a1 / (n0 * k0)
    const fact2 = dd0 * dd0 / 2

    const t0 = Math.pow(Math.tan(phi1), 2)
    const Q0 = e1sq * Math.pow(Math.cos(phi1), 2)
    const fact3 = (5 + 3 * t0 + 10 * Q0 - 4 * Q0 * Q0 - 9 * e1sq) * Math.pow(dd0, 4) / 24

    const fact4 = (61 + 90 * t0 + 298 * Q0 + 45 * t0 * t0 - 252 *
        e1sq - 3 * Q0 * Q0) * Math.pow(dd0, 6) / 720

    const lof1 = _a1 / (n0 * k0)
    const lof2 = (1 + 2 * t0 + Q0) * Math.pow(dd0, 3) / 6.0
    const lof3 = (5 - 2 * Q0 + 28 * t0 - 3 * Math.pow(Q0, 2) + 8 * e1sq + 24 *
        Math.pow(t0, 2)) * Math.pow(dd0, 5) / 120
    const _a2 = (lof1 - lof2 + lof3) / Math.cos(phi1)
    const _a3 = _a2 * 180 / Math.PI

    let latitude = 180 * (phi1 - fact1 * (fact2 + fact3 + fact4)) / Math.PI

    if (!northernHemisphere){
        latitude = -latitude
    }

    const longitude = ((zone > 0) && (6 * zone - 183.0) || 3.0) - _a3

    const obj = {
        latitude,
        longitude
    }


    return obj
}
/* eslint-enable */

type MapState = {
    booliData: ?BooliData,
    booliGeojson: ?Object,
    json: Object,
    stopsGeoJson: ?Object,
    popupFeature: ?Object,
}

const backendUrl = 'https://commutable-homes.appspot.com/all'
class Map extends React.Component {
    state: MapState = {
        booliData: null,
        booliGeojson: null,
        json: {},
        stopsGeoJson: null,
        popupFeature: null,
    }

    componentWillMount() {
        this.getBooliData()
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
    }

    getBooliData() {
        fetch(backendUrl).then(resp => {
            console.log('asdf ', resp)
            if (!resp.ok) {
                console.error('bad resp ', backendUrl)
                throw resp || {}
            }
            resp.json().then(booliData => {
                console.log('asdf ', booliData)
                this.makeData(booliData)
            }).catch(err => console.error(err))
        })
    }

    makeData(booliData: BooliData) {
        const data = ConstructionData
        data.features = data.features.map(featureParam => {
            const feature = featureParam
            const latlng = utmToLatLng(33,
                feature.geometry.coordinates[0],
                feature.geometry.coordinates[1],
                true)
            feature.geometry.coordinates[0] = latlng.longitude
            feature.geometry.coordinates[1] = latlng.latitude
            return feature
        })


        console.log('got points ', booliData.sold)
        const booliGeojson: Object = {
            type: 'FeatureCollection',
            features: (booliData.sold || []).filter(sale => sale.livingArea).map(sale => {
                const name = `${sale.location.address.streetAddress}`
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [
                            sale.location.position.longitude,
                            sale.location.position.latitude
                        ]
                    },
                    properties: {
                        name,
                        val: Math.round(sale.soldPrice / sale.livingArea),
                        soldPrice: sale.soldPrice,
                        livingArea: sale.livingArea,
                        coord: [
                            sale.location.position.longitude,
                            sale.location.position.latitude
                        ]
                    }
                }
            })
        }

        const stopsGeoJson = {
            type: 'FeatureCollection',
            features: stops.map(stop => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [
                        stop.stop_lon,
                        stop.stop_lat,
                    ]
                },
                properties: {
                    name: stop.stop_name,
                    coord: [
                        stop.stop_lon,
                        stop.stop_lat,
                    ]
                }
            }))
        }

        console.log(booliGeojson)

        this.setState({
            json: data,
            booliGeojson,
            stopsGeoJson,
            booliData,
        })
    }

    mapClick(mapParam: Object, event: Object) {
        // console.log('mapclick', mapParam, event)
        const map = mapParam
        const fs = map.queryRenderedFeatures(event.point)
        const features = fs.filter(feature => feature.layer.type === 'circle')
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''

        if (!features.length) {
            // popup.remove()
            // console.error('found no features ', fs)
            return
        }

        const feature = features[0]

        // Populate the popup and set its coordinates
        // based on the feature found.
        // console.log('aa ', feature, event.point)
        this.setState({ popupFeature: feature })
    }

    render() {
        const { booliGeojson, popupFeature, json, stopsGeoJson } = this.state
        if (!json) {
            return (<div>
                no data
            </div>)
        }

        const conf = {
            accessToken: 'pk.eyJ1IjoiaGluayIsImEiOiJ0emd1UlZNIn0.NpY-l_Elzhz9aOLoql6zZQ',
            style: 'mapbox://styles/mapbox/dark-v8'
        }
        const stopsGeoJsonName = 'stopsGeoJson'
        return (<ReactMapboxGl
            style={conf.style}
            accessToken={conf.accessToken}
            onMouseMove={(mapParam: Object, event: Object) => this.mapClick(mapParam, event)}
            movingMethod="jumpTo"
            containerStyle={{ height: '100vh', width: '100%' }}
            fitBounds={popupFeature ? null : geojsonExtent(booliGeojson)}
        >
            <ScaleControl />
            <ZoomControl />
            {/* <GeoJSONLayer
             data={this.state.json}
             symbolLayout={{
             'text-field': '{Name}',
             'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
             'text-offset': [0, 0.6],
             'text-anchor': 'top'
             }}
             /> */}
            {!!stopsGeoJson && <GeoJSONLayer
                id={stopsGeoJsonName}
                data={stopsGeoJson}
                circlePaint={{
                    'circle-color': '#b7daff'
                }}
            />}
            {!!booliGeojson && <GeoJSONLayer
                data={booliGeojson}
                symbolLayout={{
                    'text-field': '{name}',
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-offset': [0, 0.6],
                    'text-anchor': 'top'
                }}
                circlePaint={{
                    'circle-color': {
                        property: 'val',
                        stops: [
                            [1000, '#039ef1'],
                            [30000, '#35f107'],
                            [60000, '#f1e412'],
                            [150000, '#e51c07']
                        ]
                    }
                }}
            />}
            {popupFeature && <Popup
                key={'popup'}
                offset={-60}
                coordinates={JSON.parse(popupFeature.properties.coord)}
            >
                {popupFeature.properties.name}
                <br />
                {popupFeature.properties.val} kr / kvm,
                <br />
                {popupFeature.properties.soldPrice} kr,
                <br />
                {popupFeature.properties.livingArea} kvm
            </Popup>}
        </ReactMapboxGl>)
    }
}

export default Map