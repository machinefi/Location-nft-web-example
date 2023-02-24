// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, withLeaflet } from 'react-leaflet'
import { OpenStreetMapProvider } from "react-leaflet-geosearch";
import SearchControl from "./SearchControl";
import 'leaflet/dist/leaflet.css'
import { toast } from 'react-hot-toast';



const LocationMarker = (props) => {
  const [position, setPosition] = useState(null)
  const {curStore,chainId, address} = props
  const map = useMap()
  
  useMapEvents({
    click({ latlng }) {
      curStore.mapPlaces.call(latlng)
      setPosition(latlng)
    },
    locationfound(e) {
      // loading
    },
    locationError(e) {
      
    }
  })

  useEffect(() => {
    if(chainId && address) {
      map.locate().on("locationfound", ({latlng}) => {
        console.log('latlng', latlng)
        setPosition(latlng)
        map.flyTo(latlng, map.getZoom())
        curStore.setData({positionStatus: 2})
        curStore.mapPlaces.call(latlng)
      }).on("locationerror", (e) => {
        console.log('locationError', e)
        curStore.setData({positionStatus: 1})
        toast(`User denied Geolocation. Please allow location access or choose a location manually.`)
      });
    }
  }, [chainId, address, map]);


  return position === null ? null : (
    <Marker position={position}>
      <Popup>{chainId} {address}</Popup>
    </Marker>
  )
}

const Map = (props) => {
  const mapRef = useRef()
  const prov = OpenStreetMapProvider();
  const [center, setCenter] = useState({ lat: 37.7749295, lng: -122.4194155 })

  return (
    <MapContainer center={center} zoom={13} ref={mapRef}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker curStore={props.curStore} chainId={props.chainId} address={props.address} />
      <SearchControl
        provider={prov}
        showMarker={true}
        showPopup={true}
        popupFormat={({ query, result }) => {
          console.log('query', query, result);
          props.curStore.mapPlaces.call({lat: result.y, lng: result.x})
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