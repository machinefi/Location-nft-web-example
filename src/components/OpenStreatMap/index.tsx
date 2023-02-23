// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, withLeaflet } from 'react-leaflet'
import { OpenStreetMapProvider } from "react-leaflet-geosearch";
import SearchControl from "./SearchControl";
import 'leaflet/dist/leaflet.css'



const LocationMarker = (props) => {
  const [position, setPosition] = useState(null)
  useMapEvents({
    click({ latlng }) {
      console.log('click', latlng)
      props.curStore.mapPlaces.call(latlng)
      setPosition(latlng)
    },
    locationfound(e) {
    },
  })

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  )
}

const Map = (props) => {
  const mapRef = useRef()
  const prov = OpenStreetMapProvider();
  const [location, setPosition] = useState(null)

  useEffect(() => {
    if ( !mapRef ) return;
    console.log('current', mapRef)
  }, [location])

  
  return (
    <MapContainer center={{ lat: 30.27, lng: 120.04 }} zoom={13} ref={mapRef}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker curStore={props.curStore} />
      <SearchControl
        provider={prov}
        showMarker={true}
        showPopup={true}
        popupFormat={({ query, result }) => {
          console.log('query', query, result);
          props.curStore.mapPlaces.call({lat: result.y, lng: result.x})
          setPosition(result)
          return result.label
        }}
        maxMarkers={3}
        retainZoomLevel={false}
        animateZoom={true}
        autoClose={false}
        searchLabel={"Enter address, please"}
        keepResult={true}
      />
    </MapContainer>
  )
}

export default Map