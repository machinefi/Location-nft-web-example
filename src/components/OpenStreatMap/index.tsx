// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, withLeaflet } from 'react-leaflet'
import { OpenStreetMapProvider } from "react-leaflet-geosearch";
import SearchControl from "./SearchControl";
import 'leaflet/dist/leaflet.css'
import { toast } from 'react-hot-toast';



const LocationMarker = (props) => {
  const [position, setPosition] = useState(null)
  const {curStore, address} = props
  const map = useMap()
  
  const mapEvent = useMapEvents({
    click({ latlng }) {
      curStore.mapPlaces.call(latlng)
      setPosition(latlng)
    },
    locationfound(e) {
      // loading
    },
  })

  useEffect(() => {
   if(address) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
        curStore.setData({positionStatus: 2})
        setPosition(latlng)
        map.flyTo(latlng, map.getZoom())
        curStore.mapPlaces.call(latlng)
      },(err)=>{
        console.log(err);
        curStore.setData({positionStatus: 1})
        toast(err.message)
      });
    } else {
      curStore.setData({positionStatus: 1})
    }
   }
  }, [address, navigator.geolocation])

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
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
      <LocationMarker curStore={props.curStore} address={props.address} />
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